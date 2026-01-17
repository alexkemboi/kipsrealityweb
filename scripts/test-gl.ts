import { financeActions } from "../src/lib/finance/actions";
import { prisma } from "../src/lib/db";
import { AccountType } from "@prisma/client";

async function main() {
    console.log("🔍 Checking prerequisites...");

    // 1. Ensure we have an Organization
    let org = await prisma.organization.findFirst();
    if (!org) {
        console.log("⚠️ No Organization found. Creating one...");
        org = await prisma.organization.create({
            data: {
                name: "Test Org",
                slug: "test-org-" + Date.now(),
                isActive: true
            }
        });
    }

    // 2. Ensure Financial Entity exists for this Org
    let entity = await prisma.financialEntity.findFirst({
        where: { organizationId: org.id }
    });

    if (!entity) {
        console.log("⚠️ No Financial Entity found. Creating one...");
        entity = await prisma.financialEntity.create({
            data: {
                organizationId: org.id,
                name: org.name + " Finance"
            }
        });
    }

    // 3. Ensure Chart of Accounts exists (1000, 1100 and 4000)
    const accountsToCreate = [
        { code: "1000", name: "Cash - Operating Account", type: "ASSET" },
        { code: "1100", name: "Accounts Receivable", type: "ASSET" },
        { code: "4000", name: "Rental Income", type: "INCOME" }
    ];

    for (const acc of accountsToCreate) {
        const existing = await prisma.account.findFirst({
            where: { entityId: entity.id, code: acc.code }
        });

        if (!existing) {
            console.log(`⚠️ Account ${acc.code} missing. Creating...`);
            await prisma.account.create({
                data: {
                    entityId: entity.id,
                    code: acc.code,
                    name: acc.name,
                    type: acc.type as AccountType,
                    isSystem: true
                }
            });
        }
    }

    // 4. Ensure Property and Lease exist for the Invoice
    let property = await prisma.property.findFirst({
        where: { organizationId: org.id }
    });

    if (!property) {
        console.log("⚠️ No Property found. Creating one...");
        property = await prisma.property.create({
            data: {
                organizationId: org.id,
                name: "Test Property",
                city: "Test City",
                address: "123 Test St"
            }
        });
    }

    let unit = await prisma.unit.findFirst({ where: { propertyId: property.id } });
    if (!unit) {
        unit = await prisma.unit.create({
            data: {
                propertyId: property.id,
                unitNumber: "101",
                rentAmount: 1000
            }
        })
    }

    let lease = await prisma.lease.findFirst({ where: { propertyId: property.id } });
    if (!lease) {
        // Create Application first
        const app = await (prisma.tenantapplication as any).create({
            data: {
                fullName: "John Doe",
                email: "john@example.com",
                phone: "1234567890",
                dob: new Date(),
                status: "APPROVED",
                propertyId: property.id,
                leaseType: "Residential",
                occupancyType: "Family",
                moveInDate: new Date(),
                leaseDuration: "12 Months"
            }
        });

        lease = await prisma.lease.create({
            data: {
                applicationId: app.id,
                propertyId: property.id,
                unitId: unit.id,
                startDate: new Date(),
                endDate: new Date(new Date().getFullYear() + 1, 0, 1),
                rentAmount: 1000,
                leaseStatus: "ACTIVE"
            }
        });
    }

    // 5. Get or Create Invoice
    let invoice = await prisma.invoice.findFirst({
        where: { leaseId: lease.id, postingStatus: "PENDING" }
    });

    if (!invoice) {
        console.log("⚠️ No Pending Invoice found. Creating one...");
        invoice = await prisma.invoice.create({
            data: {
                leaseId: lease.id,
                type: "RENT",
                totalAmount: 1000,
                dueDate: new Date(),
                status: "PENDING",
                postingStatus: "PENDING"
            }
        });
    }

    console.log(`🚀 Posting Invoice: ${invoice.id}`);
    await financeActions.postInvoiceToGL(invoice.id);

    // 6. Create Payment for the Invoice
    const payment = await prisma.payment.create({
        data: {
            invoiceId: invoice.id,
            amount: 500,
            method: "CASH",
            reference: "TEST-PAY",
            postingStatus: "PENDING"
        }
    });

    console.log(`🚀 Posting Payment: ${payment.id}`);
    await financeActions.postPaymentToGL(payment.id);

    // 7. Verify
    const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: { journalEntry: { include: { lines: true } } }
    });

    const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: { journalEntry: { include: { lines: true } } }
    });

    console.log("\n✅ Validation Results:");
    console.log("Invoice Posting Status:", updatedInvoice?.postingStatus);
    console.log("Payment Posting Status:", updatedPayment?.postingStatus);

    if (updatedInvoice?.postingStatus === "POSTED" && updatedPayment?.postingStatus === "POSTED") {
        console.log("🎉 SUCCESS: All financial records reconciled in GL!");
    } else {
        console.error("❌ FAILURE: GL Reconcilation failed.");
    }
}

main();
