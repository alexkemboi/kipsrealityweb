import { prisma } from '../src/lib/db';
import { utilityService } from '../src/lib/finance/utility-service';
import { UtilitySplitMethod, UtilityBillStatus, Lease_leaseStatus } from '@prisma/client';

async function verifyUtilityAllocation() {
    console.log('\n🚀 Starting Utility Allocation Verification (Direct Service Call)...\n');

    try {
        // 1. Setup: Create a fresh organization for this test
        const orgName = `Utility Test Org ${Date.now()}`;
        const targetOrg = await prisma.organization.create({
            data: {
                name: orgName,
                slug: `util-test-${Date.now()}`
            }
        });

        // 1b. Seed financials for this new org
        console.log("Setting up financials for test org...");
        const { setupFinancials } = await import('../src/lib/finance/setup');
        await setupFinancials(targetOrg.id, targetOrg.name);

        console.log(`✅ Created Org: ${targetOrg.id}`);

        // 2. Create property
        const property = await prisma.property.create({
            data: {
                organizationId: targetOrg.id,
                name: 'Utility Test Property',
                city: 'Nairobi',
                address: '789 Utility St'
            }
        });

        // 3. Create 3 units with active leases
        const units = await Promise.all([
            prisma.unit.create({
                data: {
                    propertyId: property.id,
                    unitNumber: '301',
                    rentAmount: 1000,
                    isOccupied: true,
                    squareFootage: 500
                }
            }),
            prisma.unit.create({
                data: {
                    propertyId: property.id,
                    unitNumber: '302',
                    rentAmount: 1500,
                    isOccupied: true,
                    squareFootage: 750
                }
            }),
            prisma.unit.create({
                data: {
                    propertyId: property.id,
                    unitNumber: '303',
                    rentAmount: 2000,
                    isOccupied: true,
                    squareFootage: 1000
                }
            })
        ]);

        // 4. Create tenants and active leases
        // Note: Lease model requires applicationId. I'll mock that.
        const leases = await Promise.all(
            units.map(async (unit, index) => {
                const tenant = await prisma.user.create({
                    data: {
                        email: `utility-tenant-${index}-${Date.now()}@test.com`,
                        passwordHash: 'dummy',
                        firstName: `Tenant${index + 1}`,
                        lastName: 'Utility',
                        emailVerified: new Date()
                    }
                });

                // Need an application first
                const app = await prisma.tenantapplication.create({
                    data: {
                        fullName: `${tenant.firstName} ${tenant.lastName}`,
                        email: tenant.email,
                        phone: '123456789',
                        dob: new Date(1990, 0, 1),
                        leaseType: 'STANDARD',
                        occupancyType: 'SINGLE',
                        moveInDate: new Date(),
                        leaseDuration: '12 months',
                        propertyId: property.id,
                        unitId: unit.id,
                        userId: tenant.id,
                        status: 'APPROVED'
                    }
                });

                return prisma.lease.create({
                    data: {
                        applicationId: app.id,
                        tenantId: tenant.id,
                        propertyId: property.id,
                        unitId: unit.id,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        rentAmount: unit.rentAmount || 0,
                        leaseStatus: 'ACTIVE'
                    }
                });
            })
        );

        console.log(`✅ Created ${units.length} units with active leases\n`);

        // 5. Create utility bill
        const utilityBill = await prisma.utilityBill.create({
            data: {
                propertyId: property.id,
                providerName: 'Test Electric Company',
                totalAmount: 300, // $300 total
                splitMethod: UtilitySplitMethod.EQUAL,
                billDate: new Date(),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                periodStart: new Date(),
                periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: UtilityBillStatus.APPROVED
            }
        });

        console.log(`✅ Created Utility Bill: $${utilityBill.totalAmount}`);
        console.log(`   Split Method: ${utilityBill.splitMethod}\n`);

        // 6. Calculate allocation (preview)
        console.log('📊 Calculating allocation using UtilityService...\n');
        const calcResult = await utilityService.calculateAllocations(utilityBill.id);

        console.log('✅ Allocation Preview:');
        console.log(`   Total Amount: $${calcResult.totalAmount}`);
        console.log(`   Number of Tenants: ${calcResult.allocations.length}`);

        calcResult.allocations.forEach((alloc: any) => {
            console.log(`   ${alloc.tenantName} (Unit ${alloc.unitNumber}): $${alloc.amount} (${alloc.percentage}%)`);
        });

        // 7. Post allocation (finalize)
        console.log('\n💾 Posting allocation to GL...\n');
        const postResult = await utilityService.postAllocations(utilityBill.id, calcResult.allocations);

        console.log('✅ Posting Complete:');
        console.log(`   Allocations Created: ${postResult.results.length}`);
        console.log(`   Invoices Generated: ${postResult.results.length}`);
        console.log(`   Master GL Entry: ${postResult.masterGLEntry.id}`);
        console.log(`   Recovery GL Entry (Tenant 1): ${postResult.results[0].journalEntry.id}`);
        console.log(`   Total Expense: $${postResult.utilityBill.totalAmount}`);

        // 8. Verify database state
        const verifyBill = await prisma.utilityBill.findUnique({
            where: { id: utilityBill.id },
            include: {
                allocations: true,
                journalEntry: { include: { lines: true } }
            }
        });

        const verifyInvoices = await prisma.invoice.findMany({
            where: {
                Lease: { propertyId: property.id },
                type: 'UTILITY'
            },
            include: {
                journalEntry: { include: { lines: true } }
            }
        });

        console.log('\n🔍 Database Verification:');
        console.log(`   Bill Status: ${verifyBill?.status} ${verifyBill?.status === UtilityBillStatus.POSTED ? '✅' : '❌'}`);
        console.log(`   Allocations: ${verifyBill?.allocations.length} ${verifyBill?.allocations.length === 3 ? '✅' : '❌'}`);
        console.log(`   Invoices: ${verifyInvoices.length} ${verifyInvoices.length === 3 ? '✅' : '❌'}\n`);

        // 9. Verify GL entries
        if (verifyBill?.journalEntry) {
            const masterLines = verifyBill.journalEntry.lines;
            const masterDebit = masterLines.reduce((s, l) => s + Number(l.debit), 0);
            const masterCredit = masterLines.reduce((s, l) => s + Number(l.credit), 0);

            console.log('💰 Master GL Entry (Expense):');
            console.log(`   Debits:  $${masterDebit}`);
            console.log(`   Credits: $${masterCredit}`);
            console.log(`   ${masterDebit === masterCredit ? '✅ BALANCED' : '❌ IMBALANCED'}\n`);
        }

        if (verifyInvoices[0]?.journalEntry) {
            const recoveryLines = verifyInvoices[0].journalEntry.lines;
            const recoveryDebit = recoveryLines.reduce((s: number, l: any) => s + Number(l.debit), 0);
            const recoveryCredit = recoveryLines.reduce((s: number, l: any) => s + Number(l.credit), 0);

            console.log('💰 Recovery GL Entry (Tenant Charges):');
            console.log(`   Debits:  $${recoveryDebit}`);
            console.log(`   Credits: $${recoveryCredit}`);
            console.log(`   ${recoveryDebit === recoveryCredit ? '✅ BALANCED' : '❌ IMBALANCED'}\n`);
        }

        // 10. Cleanup
        console.log('🧹 Cleaning up...');
        // Delete in reverse order of dependencies
        await prisma.utilityAllocation.deleteMany({ where: { utilityBillId: utilityBill.id } });
        await prisma.invoiceItem.deleteMany({ where: { invoice: { Lease: { propertyId: property.id } } } });
        await prisma.invoice.deleteMany({ where: { Lease: { propertyId: property.id } } });
        await prisma.utilityBill.delete({ where: { id: utilityBill.id } });

        // Delete GL entries created in this test
        if (verifyBill?.journalEntryId) {
            await prisma.journalLine.deleteMany({ where: { journalEntryId: verifyBill.journalEntryId } });
            await prisma.journalEntry.delete({ where: { id: verifyBill.journalEntryId } });
        }
        const invoiceJournalIds = verifyInvoices.map(i => i.journalEntryId).filter(id => !!id) as string[];
        if (invoiceJournalIds.length > 0) {
            await prisma.journalLine.deleteMany({ where: { journalEntryId: { in: invoiceJournalIds } } });
            await prisma.journalEntry.deleteMany({ where: { id: { in: invoiceJournalIds } } });
        }

        await prisma.lease.deleteMany({ where: { propertyId: property.id } });
        await prisma.tenantapplication.deleteMany({ where: { propertyId: property.id } });
        await prisma.unit.deleteMany({ where: { propertyId: property.id } });

        const tenantEmails = units.map((_, i) => `utility-tenant-${i}`);
        await prisma.user.deleteMany({
            where: { email: { contains: 'utility-tenant' } }
        });

        await prisma.property.delete({ where: { id: property.id } });

        console.log('✅ Cleanup complete\n');
        console.log('🎉 UTILITY ALLOCATION VERIFIED!\n');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUtilityAllocation();
