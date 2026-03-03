import { PaymentGateway, TransactionStatus, User, Organization } from "@prisma/client";
export { PaymentGateway, TransactionStatus };

export interface PaymentRequest {
    user: User;
    organization: Organization; // The Landlord (Receiver)
    amount: number;             // Decimal amount (e.g., 1000.00) for display
    currency: string;           // "KES" or "USD"
    invoiceId: string;
    metadata?: any;
}

export interface PaymentResult {
    transactionId: string;      // The Processor's ID (e.g., Stripe PI or Paystack Ref)
    status: TransactionStatus;
    gateway: PaymentGateway;

    // For redirection flows (Paystack/Standard Stripe)
    checkoutUrl?: string;

    // For embedded flows (Stripe Elements)
    clientSecret?: string;

    rawResponse?: any;          // For debugging logs
}

// The contract every strategy must obey
export interface IPaymentStrategy {
    initializePayment(request: PaymentRequest): Promise<PaymentResult>;
    verifyTransaction(reference: string): Promise<PaymentResult>;
}
