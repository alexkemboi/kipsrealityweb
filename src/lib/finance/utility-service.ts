import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { CHART_OF_ACCOUNTS } from "./types";
import { journalService } from "./journal-service";
import { UtilityBillStatus, UtilitySplitMethod } from "@prisma/client";

export const utilityService = {
    /**
     * Preview utility allocations based on split method.
     */
    async calculateAllocations(utilityBillId: string) {
        const utilityBill = await prisma.utilityBill.findUnique({
            where: { id: utilityBillId },
            include: {
                property: {
                    include: {
                        units: {
                            include: {
                                leases: {
                                    where: { leaseStatus: 'ACTIVE' },
                                    include: { tenant: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!utilityBill) throw new Error("Utility bill not found");
        if (utilityBill.status === UtilityBillStatus.POSTED) throw new Error("Bill already posted");

        // 2. Find all active leases at this property
        const activeLeases = utilityBill.property.units
            .flatMap(unit => unit.leases.map(lease => ({ ...lease, unit })))
            .filter(lease => lease.leaseStatus === 'ACTIVE');

        if (activeLeases.length === 0) throw new Error("No active leases found for this property");

        const totalAmount = new Decimal(utilityBill.totalAmount);
        let allocations: Array<{
            leaseId: string;
            tenantId: string | null;
            tenantName: string;
            unitNumber: string;
            unitId: string;
            amount: Decimal;
            percentage: Decimal;
        }> = [];

        switch (utilityBill.splitMethod) {
            case UtilitySplitMethod.EQUAL: {
                const count = new Decimal(activeLeases.length);
                const equalAmount = totalAmount.div(count).toDecimalPlaces(2);
                const equalPercentage = new Decimal(100).div(count).toDecimalPlaces(2);

                allocations = activeLeases.map(lease => ({
                    leaseId: lease.id,
                    tenantId: lease.tenantId,
                    tenantName: lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'N/A',
                    unitNumber: lease.unit.unitNumber,
                    unitId: lease.unit.id,
                    amount: equalAmount,
                    percentage: equalPercentage
                }));
                break;
            }

            case UtilitySplitMethod.SQ_FOOTAGE: {
                const totalSqFt = activeLeases.reduce((sum, l) => sum.plus(new Decimal(l.unit.squareFootage || 0)), new Decimal(0));

                if (totalSqFt.isZero()) throw new Error("Total square footage is zero or not available");

                allocations = activeLeases.map(lease => {
                    const sqFt = new Decimal(lease.unit.squareFootage || 0);
                    const percentage = sqFt.div(totalSqFt).times(100).toDecimalPlaces(2);
                    const amount = totalAmount.times(sqFt).div(totalSqFt).toDecimalPlaces(2);

                    return {
                        leaseId: lease.id,
                        tenantId: lease.tenantId,
                        tenantName: lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'N/A',
                        unitNumber: lease.unit.unitNumber,
                        unitId: lease.unit.id,
                        amount,
                        percentage
                    };
                });
                break;
            }

            case UtilitySplitMethod.OCCUPANCY_BASED:
            case UtilitySplitMethod.AI_OPTIMIZED:
            default: {
                // Default to EQUAL for others if not explicitly implemented
                const count = new Decimal(activeLeases.length);
                const equalAmount = totalAmount.div(count).toDecimalPlaces(2);
                const equalPercentage = new Decimal(100).div(count).toDecimalPlaces(2);

                allocations = activeLeases.map(lease => ({
                    leaseId: lease.id,
                    tenantId: lease.tenantId,
                    tenantName: lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'N/A',
                    unitNumber: lease.unit.unitNumber,
                    unitId: lease.unit.id,
                    amount: equalAmount,
                    percentage: equalPercentage
                }));
                break;
            }
        }

        // 4. Verify total matches (rounding adjustment)
        const allocatedTotal = allocations.reduce((sum, a) => sum.plus(a.amount), new Decimal(0));
        const diff = totalAmount.minus(allocatedTotal);

        if (!diff.isZero() && allocations.length > 0) {
            allocations[allocations.length - 1].amount = allocations[allocations.length - 1].amount.plus(diff);
        }

        return {
            utilityBill,
            allocations,
            totalAmount
        };
    },

    /**
     * Post allocations to GL and create invoices.
     */
    async postAllocations(utilityBillId: string, allocationsInput: any[]) {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch utility bill
            const utilityBill = await tx.utilityBill.findUnique({
                where: { id: utilityBillId },
                include: {
                    property: { include: { organization: true } }
                }
            });

            if (!utilityBill) throw new Error("Utility bill not found");
            if (utilityBill.status === UtilityBillStatus.POSTED) throw new Error("Bill already posted");
            if (!utilityBill.property.organizationId) throw new Error("Organization not found for property");

            // 2. Create allocation records and tenant invoices
            const recoveryResults = await Promise.all(
                allocationsInput.map(async (alloc) => {
                    // Create Invoice
                    const invoice = await tx.invoice.create({
                        data: {
                            leaseId: alloc.leaseId,
                            type: 'UTILITY',
                            totalAmount: Number(alloc.amount),
                            balance: Number(alloc.amount),
                            amountPaid: 0,
                            status: 'PENDING',
                            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                            InvoiceItem: {
                                create: {
                                    description: `Utility: ${utilityBill.providerName}`,
                                    amount: Number(alloc.amount)
                                }
                            }
                        }
                    });

                    // Create Allocation
                    const allocation = await tx.utilityAllocation.create({
                        data: {
                            utilityBillId: utilityBill.id,
                            unitId: alloc.unitId,
                            leaseId: alloc.leaseId,
                            tenantId: alloc.tenantId,
                            amount: alloc.amount,
                            percentage: alloc.percentage,
                            invoiceId: invoice.id,
                            status: 'PENDING'
                        }
                    });

                    return { allocation, invoice };
                })
            );

            // 3. Post Master Bill to GL (The bigExpense)
            // DR: Utility Expense (5200)
            // CR: Accounts Payable (2200)
            const masterGLEntry = await journalService.post(
                {
                    organizationId: utilityBill.property.organizationId,
                    date: new Date(),
                    description: `Utility Bill: ${utilityBill.providerName} - ${utilityBill.property.name || 'Property'}`,
                    reference: utilityBill.id,
                    lines: [
                        {
                            accountCode: CHART_OF_ACCOUNTS.UTILITY_EXPENSE,
                            debit: utilityBill.totalAmount,
                            credit: 0,
                            propertyId: utilityBill.propertyId
                        },
                        {
                            accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_PAYABLE,
                            debit: 0,
                            credit: utilityBill.totalAmount,
                            propertyId: utilityBill.propertyId
                        }
                    ]
                },
                tx
            );

            // 4. Post Tenant Recoveries to GL (Individually per tenant to link to Invoice correctly)
            const recoveryResultsWithJournals = await Promise.all(
                recoveryResults.map(async (res, index) => {
                    const alloc = allocationsInput[index];
                    const recoveryGLEntry = await journalService.post(
                        {
                            organizationId: utilityBill.property.organizationId!,
                            date: new Date(),
                            description: `Utility Recovery: ${utilityBill.providerName} - Unit ${alloc.unitNumber}`,
                            reference: res.invoice.id,
                            lines: [
                                {
                                    accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
                                    debit: alloc.amount,
                                    credit: 0,
                                    propertyId: utilityBill.propertyId,
                                    leaseId: alloc.leaseId,
                                    unitId: alloc.unitId,
                                    tenantId: alloc.tenantId
                                },
                                {
                                    accountCode: CHART_OF_ACCOUNTS.UTILITY_RECOVERY_INCOME,
                                    debit: 0,
                                    credit: alloc.amount,
                                    propertyId: utilityBill.propertyId,
                                    leaseId: alloc.leaseId,
                                    unitId: alloc.unitId
                                }
                            ]
                        },
                        tx
                    );

                    // Link invoice to its specific recovery GL entry
                    const updatedInvoice = await tx.invoice.update({
                        where: { id: res.invoice.id },
                        data: { journalEntryId: recoveryGLEntry.id }
                    });

                    return { ...res, invoice: updatedInvoice, journalEntry: recoveryGLEntry };
                })
            );

            // 5. Update utility bill status
            const updatedBill = await tx.utilityBill.update({
                where: { id: utilityBill.id },
                data: {
                    status: UtilityBillStatus.POSTED,
                    journalEntryId: masterGLEntry.id
                }
            });

            return {
                utilityBill: updatedBill,
                results: recoveryResultsWithJournals,
                masterGLEntry
            };
        }, { timeout: 30000 });
    }
};
