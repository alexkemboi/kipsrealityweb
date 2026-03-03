import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { prisma } from "@/lib/db";
import { PaymentFactory } from "@/lib/payment/payment-factory";
import { PaymentRequest } from "@/lib/payment/types";
import { TransactionStatus, Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
        }

        // 1. Fetch Invoice and related data
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                Lease: {
                    include: {
                        property: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        const organization = invoice.Lease.property.organization;
        if (!organization) {
            return NextResponse.json({ error: "Organization not found for this invoice" }, { status: 404 });
        }

        // 2. Determine Strategy
        // Default to 'KEN' if region is null
        const region = organization.region || "KEN";
        const strategy = PaymentFactory.getStrategy(region);

        // 3. Prepare Payment Request
        // We need a full User object for the PaymentRequest interface, 
        // but getCurrentUser returns a subset. We should fetch the full user or cast/map it.
        // Let's fetch the full user to be safe and get all required fields.
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!fullUser) {
            return NextResponse.json({ error: "User record not found" }, { status: 404 });
        }

        const paymentRequest: PaymentRequest = {
            user: fullUser,
            organization: organization,
            amount: invoice.totalAmount, // or invoice.balance? Using totalAmount for now as per "Pay Now" logic usually implies paying the bill.
            currency: "KES", // This should probably be dynamic based on region or invoice currency.
            invoiceId: invoice.id,
            metadata: {
                source: "web_app",
            },
        };

        // Override currency if region is USA
        if (region === 'USA') {
            paymentRequest.currency = 'USD';
        }


        // 4. Initialize Payment via Strategy
        const result = await strategy.initializePayment(paymentRequest);

        // 5. Log Intent to DB (Create Payment Record)
        // We create a payment record with status PENDING.
        const paymentMethod = region === "KEN" && result.gateway === "MPESA_DIRECT" ? "MPESA" : "CREDIT_CARD";
        
        const paymentData: Prisma.PaymentCreateInput = {
            invoice: { connect: { id: invoice.id } },
            amount: invoice.totalAmount, // Assuming full payment
            currency: paymentRequest.currency,
            gateway: result.gateway,
            gatewayReference: result.transactionId,
            status: TransactionStatus.PENDING,
            amountSubunits: Math.round(invoice.totalAmount * 100), // Approximate
            method: paymentMethod,
        };

        // Add metadata for M-Pesa payments
        if (result.gateway === "MPESA_DIRECT" && result.rawResponse?.mpesaCheckoutId) {
            const metadata: Record<string, Prisma.InputJsonValue> = {
                checkoutRequestId: result.rawResponse.mpesaCheckoutId,
                customerMessage: result.rawResponse.customerMessage,
                initiatedAt: new Date().toISOString(),
            };
            
            // Only add phone number if it exists
            if (paymentRequest.user.phone) {
                metadata.phoneNumber = paymentRequest.user.phone;
            }
            
            paymentData.metadata = metadata;
        }

        await prisma.payment.create({
            data: paymentData,
        });

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error("Payment Initialization Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize payment";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
