import { IPaymentStrategy, PaymentRequest, PaymentResult, PaymentGateway } from "../types";
import { TransactionStatus } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { checkBalance } from "../services/plaid-service";

export class UsaPaymentStrategy implements IPaymentStrategy {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2026-01-28.clover",
        });
    }

    async initializePayment(req: PaymentRequest): Promise<PaymentResult> {
        const amountInCents = Math.round(req.amount * 100);

        // 1. Check if user has a linked Bank Account (ACH)
        const paymentMethod = await prisma.tenantPaymentMethod.findFirst({
            where: {
                userId: req.user.id,
                type: 'ACH',
                isDefault: true
            }
        });

        if (paymentMethod && paymentMethod.plaidAccessToken && paymentMethod.plaidAccountId) {
            try {
                // ⚠️ RISK CHECK ⚠️
                // Before charging, check Plaid Balance
                const balanceCheck = await checkBalance(
                    paymentMethod.plaidAccessToken, // In prod, decrypt this first
                    paymentMethod.plaidAccountId,
                    req.amount
                );

                if (balanceCheck.risk === 'HIGH') {
                    throw new Error("Insufficient funds in linked bank account.");
                }

                // Charge via ACH (Stripe PaymentIntent)
                const params: Stripe.PaymentIntentCreateParams = {
                    amount: amountInCents,
                    currency: "usd",
                    customer: req.user.stripeCustomerId!, // Must exist if bad method exists
                    payment_method: paymentMethod.stripePaymentMethodId, // The ACH Source
                    off_session: true, // We are charging saved method
                    confirm: true, // Auto-confirm because it's ACH
                    metadata: {
                        invoiceId: req.invoiceId,
                        userId: req.user.id
                    },
                };

                // SPLIT LOGIC: If Landlord is connected via Stripe Connect
                if (req.organization.stripeConnectId) {
                    params.transfer_data = {
                        destination: req.organization.stripeConnectId,
                    };
                }

                const intent = await this.stripe.paymentIntents.create(params);

                return {
                    transactionId: intent.id,
                    status: TransactionStatus.PENDING, // ACH takes 3-5 days
                    gateway: PaymentGateway.STRIPE, // Or create a new enum value STRIPE_ACH if needed
                    rawResponse: intent
                };
            } catch (error) {
                console.warn("ACH Payment failed, falling back to Card:", error);
                // Fallthrough to Card logic if ACH fails
            }
        }

        // 2. Fallback / Default: Create Payment Intent for Cards (Elements)
        const params: Stripe.PaymentIntentCreateParams = {
            amount: amountInCents,
            currency: "usd",
            metadata: {
                invoiceId: req.invoiceId,
                userId: req.user.id
            },
            automatic_payment_methods: { enabled: true }, // Enables Apple Pay, Google Pay, ACH (if configured in Dashboard)
        };

        // SPLIT LOGIC: If Landlord is connected via Stripe Connect
        if (req.organization.stripeConnectId) {
            params.transfer_data = {
                destination: req.organization.stripeConnectId,
            };
        }

        const intent = await this.stripe.paymentIntents.create(params);

        return {
            transactionId: intent.id,
            status: TransactionStatus.PENDING,
            gateway: PaymentGateway.STRIPE,
            clientSecret: intent.client_secret!, // Frontend uses this to render Elements
            rawResponse: intent
        };
    }

    async verifyTransaction(reference: string): Promise<PaymentResult> {
        return {} as PaymentResult;
    }
}
