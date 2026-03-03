import { NextResponse } from "next/server";
import { plaidClient, createStripeBankAccountToken } from "@/lib/payment/services/plaid-service";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-01-28.clover"
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { publicToken, accountId, userId } = body; // Data from Frontend

        // 1. Exchange Public Token for Access Token
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        const accessToken = exchangeResponse.data.access_token;

        // 2. Create Stripe Processor Token (The Bridge)
        const stripeToken = await createStripeBankAccountToken(accessToken, accountId);

        // 3. Get or Create Stripe Customer
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({ email: user.email });
            stripeCustomerId = customer.id;
            // Update DB with stripe ID
            await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
        }

        // 4. Save Bank Account to Stripe Customer
        const source = await stripe.customers.createSource(stripeCustomerId, {
            source: stripeToken, // This is the magic Plaid token
        });

        // 5. Save Plaid metadata to DB (Encrypted!)
        // NOTE: In production, encrypt `accessToken` before saving.
        await prisma.tenantPaymentMethod.create({
            data: {
                userId,
                type: 'ACH',
                plaidAccessToken: accessToken, // ENCRYPT THIS
                plaidAccountId: accountId,
                stripePaymentMethodId: source.id,
                isDefault: true
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error connecting bank account:", error);
        return NextResponse.json({ error: error.message || "Failed to connect bank account" }, { status: 500 });
    }
}
