import { prisma } from "@/lib/db";
import { setupFinancials } from "@/lib/finance/setup";
import { journalService } from "@/lib/finance/journal-service";
import { CHART_OF_ACCOUNTS } from "@/lib/finance/types";
import { PostingStatus } from "@prisma/client";

async function main() {
    try {
        console.log("🚀 [1/5] Starting Lease Activation Verification...");

        // 1. Get Organization & Setup Financials
        console.log("🔍 Finding Organization...");
        const org = await prisma.organization.findFirst();
        if (!org) throw new Error("No Organization found. Please create one.");
        console.log(`✅ Found Org: ${org.id}`);

        let entity = await prisma.financialEntity.findFirst({ where: { organizationId: org.id } });
        if (!entity) {
            console.log("⚙️ Setting up financials...");
            entity = await setupFinancials(org.id, org.name);
        }
        console.log(`✅ Financial Entity Ready: ${entity.id}`);

        // 2. Create Dependencies (Property, Unit, Tenant)
        console.log("🏗️ [2/5] Creating Test Data...");

        let propType = await prisma.propertyType.findFirst({ where: { name: "Apartment" } });
        if (!propType) {
            propType = await prisma.propertyType.create({ data: { name: "Apartment" } });
        }

        const property = await prisma.property.create({
            data: {
                organizationId: org.id,
                name: "Test Property Activation",
                city: "Test City",
                address: "123 Test St",
                propertyTypeId: propType.id
            }
        });
        console.log(`✅ Property Created: ${property.id}`);

        const unit = await prisma.unit.create({
            data: {
                propertyId: property.id,
                unitNumber: "101-activation",
                rentAmount: 1500
            }
        });
        console.log(`✅ Unit Created: ${unit.id}`);

        const tenant = await prisma.user.create({
            data: {
                email: `test-tenant-${Date.now()}@example.com`,
                passwordHash: "hash",
                firstName: "John",
                lastName: "Doe",
                status: "ACTIVE"
            }
        });

        const application = await prisma.tenantapplication.create({
            data: {
                fullName: "John Doe",
                email: tenant.email,
                phone: "1234567890",
                dob: new Date(),
                leaseType: "Residential",
                occupancyType: "Single",
                moveInDate: new Date(),
                leaseDuration: "12 Months",
                propertyId: property.id,
                userId: tenant.id
            }
        });

        // 3. Create DRAFT Lease
        console.log("📝 [3/5] Creating DRAFT Lease...");
        const lease = await prisma.lease.create({
            data: {
                propertyId: property.id,
                unitId: unit.id,
                tenantId: tenant.id,
                applicationId: application.id,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                rentAmount: 1500,
                leaseStatus: "DRAFT",
                paymentFrequency: "MONTHLY"
            }
        });

        console.log(`✅ Created DRAFT Lease: ${lease.id}`);

        // 4. Simulate Activation with Transaction
        console.log("⚡ [4/5] Simulating Activation Transaction...");

        const result = await prisma.$transaction(async (tx) => {
            console.log("   -> Inside Transaction Block...");

            // A. Update Lease Status
            await tx.lease.update({
                where: { id: lease.id },
                data: { leaseStatus: 'ACTIVE' }
            });

            // B. Update Unit Status
            await tx.unit.update({
                where: { id: lease.unitId },
                data: { isOccupied: true }
            });

            // C. Generate Invoice
            const invoice = await tx.invoice.create({
                data: {
                    leaseId: lease.id,
                    type: 'RENT',
                    totalAmount: lease.rentAmount,
                    balance: lease.rentAmount,
                    amountPaid: 0,
                    status: 'PENDING',
                    dueDate: new Date(),
                    postingStatus: PostingStatus.PENDING
                }
            });
            console.log(`   -> Invoice Created (in tx): ${invoice.id}`);

            // D. Post to GL
            console.log("   -> Posting to GL...", {
                orgId: property.organizationId,
                linesCount: 2
            });

            const glEntry = await journalService.post({
                organizationId: property.organizationId!,
                date: new Date(),
                description: `Lease Activation Test: ${unit.unitNumber}`,
                reference: invoice.id,
                lines: [
                    {
                        accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
                        debit: lease.rentAmount,
                        credit: 0,
                        propertyId: lease.propertyId,
                        unitId: lease.unitId,
                        leaseId: lease.id,
                        tenantId: lease.tenantId || undefined
                    },
                    {
                        accountCode: CHART_OF_ACCOUNTS.RENTAL_INCOME,
                        debit: 0,
                        credit: lease.rentAmount,
                        propertyId: lease.propertyId,
                        unitId: lease.unitId,
                        leaseId: lease.id,
                        tenantId: lease.tenantId || undefined
                    }
                ]
            }, tx); // <--- PASSING TX HERE

            console.log(`   -> GL Entry Created (in tx): ${glEntry.id}`);

            await tx.invoice.update({
                where: { id: invoice.id },
                data: { journalEntryId: glEntry.id, postingStatus: PostingStatus.POSTED }
            });

            return { invoice, glEntry };
        }, {
            timeout: 10000 // Increase timeout to 10s
        });

        console.log("✅ [5/5] Transaction Committed Successfully!");

        // 5. Verification Checks
        process.stdout.write("🔍 Verifying DB State... ");
        const checkLease = await prisma.lease.findUnique({ where: { id: lease.id } });
        const checkUnit = await prisma.unit.findUnique({ where: { id: unit.id } });
        const checkInvoice = await prisma.invoice.findUnique({ where: { id: result.invoice.id } });
        const checkGL = await prisma.journalEntry.findUnique({
            where: { id: result.glEntry.id },
            include: { lines: true }
        });

        if (checkLease?.leaseStatus !== 'ACTIVE') throw new Error("Lease Status failed");
        if (checkUnit?.isOccupied !== true) throw new Error("Unit Occupied failed");
        if (checkInvoice?.postingStatus !== 'POSTED') throw new Error("Invoice Status failed");
        if (checkGL?.lines.length !== 2) throw new Error("GL Lines missing");

        console.log("ALL CHECKS PASSED 🎉");

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR in Verification:", error);
    } finally {
        await prisma.$disconnect();
        console.log("👋 Done.");
    }
}

main();
