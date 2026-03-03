import { IPaymentStrategy, PaymentRequest, PaymentResult } from "../types";
import { PaymentGateway, TransactionStatus } from "@prisma/client";

export class KenyaPaymentStrategy implements IPaymentStrategy {
    private secretKey = process.env.PAYSTACK_SECRET_KEY;

    async initializePayment(req: PaymentRequest): Promise<PaymentResult> {
        // 1. Convert to Subunits (Kobo/Cents)
        // Paystack requires integers. 100 KES = 10000 kobo
        const amountInSubunits = Math.round(req.amount * 100);

        // 2. Prepare Paystack Payload
        const payload = {
            email: req.user.email,
            amount: amountInSubunits,
            currency: "KES",
            reference: `REF-${Date.now()}-${req.invoiceId.substring(0, 8)}`,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback/paystack`,
            metadata: {
                invoiceId: req.invoiceId,
                userId: req.user.id,
                custom_fields: [
                    { display_name: "Invoice ID", variable_name: "invoice_id", value: req.invoiceId }
                ]
            },
            // SPLIT LOGIC: If landlord has a subaccount, split the money here
            subaccount: req.organization.paystackSubaccountCode || undefined,
            channels: ['card', 'mobile_money'] // Enables M-Pesa option on checkout
        };

        // 3. Call Paystack API
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(`Paystack Init Failed: ${data.message}`);
        }

        // 4. Return Standardized Result
        return {
            transactionId: data.data.reference,
            status: TransactionStatus.PENDING,
            gateway: PaymentGateway.PAYSTACK,
            checkoutUrl: data.data.authorization_url, // Redirect user here to pay via M-Pesa/Card
            rawResponse: data
        };
    }

    async verifyTransaction(reference: string): Promise<PaymentResult> {
        // Implement verification logic later for webhooks
        return {} as PaymentResult;
    }
}
