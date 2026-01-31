import { journalService } from "./journal-service";
import { prisma } from "@/lib/db";
import { PostingStatus } from "@prisma/client";
import { CHART_OF_ACCOUNTS } from "./types";

export const financeActions = {

    /**
     * Action: Post Rent Invoice
     * Dr. Accounts Receivable (1100)
     * Cr. Rental Income (4000)
     */
    async postInvoiceToGL(invoiceId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { Lease: { include: { property: true } } } // Get dimensions
        });

        if (!invoice) throw new Error("Invoice not found");
        // Ensure we handle case where organizationId might be missing or verify it exists
        if (!invoice.Lease?.property.organizationId) throw new Error("Property has no organization assigned");

        if (invoice.postingStatus === PostingStatus.POSTED) return; // Idempotency

        const amount = invoice.totalAmount;

        try {
            const journal = await journalService.post({
                organizationId: invoice.Lease.property.organizationId,
                date: invoice.createdAt || new Date(),
                reference: `INV-${invoice.id.substring(0, 8)}`,
                description: `Rent Invoice: ${invoice.Lease.unitId}`,
                lines: [
                    // Debit AR (Asset)
                    {
                        accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
                        debit: amount,
                        credit: 0,
                        leaseId: invoice.leaseId,
                        propertyId: invoice.Lease.propertyId,
                        tenantId: invoice.Lease.tenantId || undefined
                    },
                    // Credit Income
                    {
                        accountCode: CHART_OF_ACCOUNTS.RENTAL_INCOME,
                        debit: 0,
                        credit: amount,
                        leaseId: invoice.leaseId,
                        propertyId: invoice.Lease.propertyId
                    }
                ]
            });

            // Update Source Document
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    postingStatus: PostingStatus.POSTED,
                    journalEntryId: journal.id
                }
            });

            console.log(`✅ Posted Invoice ${invoice.id} to GL.`);

        } catch (error) {
            console.error("GL Posting Failed:", error);
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { postingStatus: PostingStatus.FAILED }
            });
        }
    },

    /**
     * Action: Post Payment Receipt
     * Dr. Cash (1000)
     * Cr. Accounts Receivable (1100)
     */
    async postPaymentToGL(paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: { include: { Lease: { include: { property: true } } } } }
        });

        if (!payment) throw new Error("Payment not found");
        if (payment.postingStatus === PostingStatus.POSTED) return;

        // Use Decimal for math
        const amount = payment.amount;
        const orgId = payment.invoice?.Lease.property.organizationId;

        if (!orgId) throw new Error("Property has no organization assigned for payment posting");

        try {
            const journal = await journalService.post({
                organizationId: orgId,
                date: payment.paidOn || new Date(),
                reference: `PAY-${payment.reference || payment.id.substring(0, 8)}`,
                description: `Payment for Invoice #${payment.invoice?.id.substring(0, 8)}`,
                lines: [
                    // Debit Cash (Asset) - Money enters bank
                    {
                        accountCode: CHART_OF_ACCOUNTS.CASH_IN_BANK, // "Cash - Operating Account"
                        debit: amount,
                        credit: 0,
                        propertyId: payment.invoice?.Lease.propertyId
                    },
                    // Credit Accounts Receivable (Asset) - Tenant owes less
                    {
                        accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, // "Accounts Receivable"
                        debit: 0,
                        credit: amount,
                        leaseId: payment.invoice?.leaseId,
                        propertyId: payment.invoice?.Lease.propertyId,
                        tenantId: payment.invoice?.Lease.tenantId || undefined
                    }
                ]
            });

            // Update Payment Status
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    postingStatus: PostingStatus.POSTED,
                    journalEntryId: journal.id
                }
            });

            console.log(`✅ Posted Payment ${payment.id} to GL.`);

        } catch (error) {
            console.error("GL Payment Posting Failed:", error);
            await prisma.payment.update({
                where: { id: payment.id },
                data: { postingStatus: PostingStatus.FAILED }
            });
        }
    }
};
