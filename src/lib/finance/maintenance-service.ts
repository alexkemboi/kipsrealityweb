import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { CHART_OF_ACCOUNTS } from "./types";
import { journalService } from "./journal-service";
import { MaintenanceRequest_status } from "@prisma/client";

export const maintenanceService = {
    /**
     * Finalize a maintenance request and post to GL.
     * DR: Maintenance Expense (5100), CR: Accounts Payable (2200)
     * If tenantChargeable: DR: AR (1100), CR: Maintenance Recovery (4300) + Tenant Invoice
     */
    async postMaintenanceBill(requestId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch request with relations
            const request = await tx.maintenanceRequest.findUnique({
                where: { id: requestId },
                include: {
                    property: { include: { organization: true } },
                    unit: {
                        include: {
                            leases: {
                                where: { leaseStatus: 'ACTIVE' },
                                take: 1
                            }
                        }
                    }
                }
            });

            if (!request) throw new Error("Maintenance request not found");
            if (request.status !== MaintenanceRequest_status.COMPLETED) {
                throw new Error("Only completed requests can be billed");
            }
            if (!request.cost || Number(request.cost) <= 0) {
                throw new Error("Maintenance cost must be greater than zero to post");
            }
            if (request.journalEntryId) throw new Error("Request already posted to ledger");

            const orgId = request.organizationId;
            const cost = request.cost;

            // 2. Post Vendor Expense to GL
            // DR: Maintenance Expense (5100)
            // CR: Accounts Payable (2200)
            const expenseGLEntry = await journalService.post(
                {
                    organizationId: orgId,
                    date: new Date(),
                    description: `Maintenance Cost: ${request.title} - ${request.property.name}`,
                    reference: request.id,
                    lines: [
                        {
                            accountCode: CHART_OF_ACCOUNTS.MAINTENANCE_EXPENSE,
                            debit: cost,
                            credit: 0,
                            propertyId: request.propertyId,
                            unitId: request.unitId || undefined
                        },
                        {
                            accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_PAYABLE,
                            debit: 0,
                            credit: cost,
                            propertyId: request.propertyId,
                            unitId: request.unitId || undefined
                        }
                    ]
                },
                tx
            );

            let invoiceId: string | undefined;

            // 3. Handle Tenant Chargeback if applicable
            if (request.isTenantChargeable) {
                const activeLease = request.unit?.leases[0];
                if (!activeLease) {
                    throw new Error("No active lease found for tenant chargeback");
                }

                // Create Invoice
                const invoice = await tx.invoice.create({
                    data: {
                        leaseId: activeLease.id,
                        type: 'MAINTENANCE',
                        totalAmount: Number(cost),
                        balance: Number(cost),
                        amountPaid: 0,
                        status: 'PENDING',
                        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                        maintenanceRequest: {
                            connect: { id: request.id }
                        },
                        InvoiceItem: {
                            create: {
                                description: `Maintenance Chargeback: ${request.title}`,
                                amount: Number(cost)
                            }
                        }
                    }
                });

                invoiceId = invoice.id;

                // Post Recovery to GL
                // DR: Accounts Receivable (1100)
                // CR: Maintenance Income (4300)
                const recoveryGLEntry = await journalService.post(
                    {
                        organizationId: orgId,
                        date: new Date(),
                        description: `Maintenance Chargeback: ${request.title} - Unit ${request.unit?.unitNumber}`,
                        reference: invoice.id,
                        lines: [
                            {
                                accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
                                debit: cost,
                                credit: 0,
                                propertyId: request.propertyId,
                                unitId: request.unitId || undefined,
                                leaseId: activeLease.id,
                                tenantId: activeLease.tenantId || undefined
                            },
                            {
                                accountCode: CHART_OF_ACCOUNTS.MAINTENANCE_INCOME,
                                debit: 0,
                                credit: cost,
                                propertyId: request.propertyId,
                                unitId: request.unitId || undefined,
                                leaseId: activeLease.id
                            }
                        ]
                    },
                    tx
                );

                // Link invoice to its GL entry
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { journalEntryId: recoveryGLEntry.id }
                });
            }

            // 4. Update request with financial links
            const updatedRequest = await tx.maintenanceRequest.update({
                where: { id: request.id },
                data: {
                    journalEntryId: expenseGLEntry.id,
                    invoiceId: invoiceId
                }
            });

            return {
                request: updatedRequest,
                expenseGLEntry,
                invoiceId
            };
        }, { timeout: 30000 });
    }
};
