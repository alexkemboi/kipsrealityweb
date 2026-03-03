import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { financeActions } from "@/lib/finance/actions";
import crypto from "crypto";
import { TransactionStatus } from "@prisma/client";

export async function POST(req: Request) {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const signature = req.headers.get("x-paystack-signature");

    if (!secret) {
        return NextResponse.json({ error: "Server Misconfigured" }, { status: 500 });
    }

    // 1. Verify Signature (Security)
    try {
        const body = await req.json();
        const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");

        if (hash !== signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
        }

        const event = body.event;
        const data = body.data;

        // 2. Handle Success
        if (event === "charge.success") {
            const reference = data.reference;

            // Find the payment by the Processor Reference
            const payment = await prisma.payment.findFirst({
                where: { gatewayReference: reference }
            });

            if (payment && payment.status !== TransactionStatus.SETTLED) {
                // 3. Update Status
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: TransactionStatus.SETTLED }
                });

                // 4. POST TO GENERAL LEDGER (The Financial Core)
                await financeActions.postPaymentToGL(payment.id);

                console.log(`✅ Paystack Payment ${reference} Settled & Posted to GL.`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Paystack Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
