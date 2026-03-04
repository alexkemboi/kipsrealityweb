import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { financeActions } from "@/lib/finance/actions";
import Stripe from "stripe";
import { TransactionStatus } from "@prisma/client";

let stripeClient: Stripe | null = null;

function getStripeClient() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        throw new Error("Stripe not configured: STRIPE_SECRET_KEY is missing");
    }

    if (!stripeClient) {
        stripeClient = new Stripe(stripeSecretKey, {
            apiVersion: "2026-01-28.clover"
        });
    }

    return stripeClient;
}

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return NextResponse.json({ error: "Missing Signature or Secret" }, { status: 400 });
    }

    let event;

    try {
        const stripe = getStripeClient();
        // 1. Verify Signature
        const text = await req.text(); // Stripe needs raw body for verification
        event = stripe.webhooks.constructEvent(text, sig, endpointSecret);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Webhook Signature Error: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    // 2. Handle Success
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const payment = await prisma.payment.findFirst({
            where: { gatewayReference: paymentIntent.id }
        });

        if (payment && payment.status !== TransactionStatus.SETTLED) {
            // 3. Update & Post to GL
            try {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: TransactionStatus.SETTLED }
                });

                await financeActions.postPaymentToGL(payment.id);
                console.log(`✅ Stripe Payment ${paymentIntent.id} Settled & Posted.`);
            } catch (dbError) {
                console.error("DB Update Failed:", dbError);
                return NextResponse.json({ error: "Database Update Failed" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
