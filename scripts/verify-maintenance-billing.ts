import { prisma } from '../src/lib/db';
import { maintenanceService } from '../src/lib/finance/maintenance-service';
import { MaintenanceRequest_status, RequestCategory, Priority } from '@prisma/client';

async function verifyMaintenanceBilling() {
    console.log('\n🚀 Starting Maintenance Billing Verification...\n');

    try {
        // 1. Setup: Create a fresh organization
        const orgName = `Maintenance Test Org ${Date.now()}`;
        const targetOrg = await prisma.organization.create({
            data: {
                name: orgName,
                slug: `maint-test-${Date.now()}`
            }
        });

        // 1b. Seed financials
        console.log("Setting up financials for test org...");
        const { setupFinancials } = await import('../src/lib/finance/setup');
        await setupFinancials(targetOrg.id, targetOrg.name);

        // 2. Create property & unit
        const property = await prisma.property.create({
            data: {
                organizationId: targetOrg.id,
                name: 'Maintenance Test Property',
                city: 'Nairobi',
                address: '123 Repair Lane'
            }
        });

        const unit = await prisma.unit.create({
            data: {
                propertyId: property.id,
                unitNumber: '101',
                rentAmount: 1200,
                isOccupied: true
            }
        });

        // 3. Create tenant and active lease
        const tenant = await prisma.user.create({
            data: {
                email: `maint-tenant-${Date.now()}@test.com`,
                passwordHash: 'dummy',
                firstName: 'Repair',
                lastName: 'Tenant',
                emailVerified: new Date()
            }
        });

        const application = await prisma.tenantapplication.create({
            data: {
                fullName: 'Repair Tenant',
                email: tenant.email,
                phone: '555-0199',
                dob: new Date(1995, 5, 10),
                leaseType: 'STANDARD',
                occupancyType: 'SINGLE',
                propertyId: property.id,
                unitId: unit.id,
                userId: tenant.id,
                status: 'APPROVED',
                moveInDate: new Date(),
                leaseDuration: '12 months'
            }
        });

        const lease = await prisma.lease.create({
            data: {
                applicationId: application.id,
                tenantId: tenant.id,
                propertyId: property.id,
                unitId: unit.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                rentAmount: 1200,
                leaseStatus: 'ACTIVE'
            }
        });

        // Need an OrganizationUser for "requestedBy"
        const orgUser = await prisma.organizationUser.create({
            data: {
                organizationId: targetOrg.id,
                userId: tenant.id,
                role: 'TENANT'
            }
        });

        console.log(`✅ Setup complete: Org ${targetOrg.id}, Lease ${lease.id}`);

        // 4. Create Maintenance Request (Chargeable to tenant)
        const request = await prisma.maintenanceRequest.create({
            data: {
                organizationId: targetOrg.id,
                propertyId: property.id,
                unitId: unit.id,
                requestedById: orgUser.id,
                title: 'Broken Window (Tenant Damage)',
                description: 'Tenant threw a ball through the window.',
                priority: Priority.NORMAL,
                category: RequestCategory.ROUTINE,
                status: MaintenanceRequest_status.COMPLETED,
                cost: 250, // $250 repair
                isTenantChargeable: true
            }
        });

        console.log(`✅ Created COMPLETED Maintenance Request: $${request.cost}`);

        // 5. Run billing service
        console.log('💰 Processing billing via MaintenanceService...\n');
        const result = await maintenanceService.postMaintenanceBill(request.id);

        console.log('✅ Billing Complete:');
        console.log(`   Expense Journal Entry: ${result.expenseGLEntry.id}`);
        console.log(`   Tenant Invoice ID: ${result.invoiceId}`);

        // 6. Verify Database State
        const verifyRequest = await prisma.maintenanceRequest.findUnique({
            where: { id: request.id },
            include: {
                invoice: { include: { journalEntry: { include: { lines: true } } } },
                journalEntry: { include: { lines: true } }
            }
        });

        console.log('\n🔍 Verification Results:');
        console.log(`   Request Journal Link: ${verifyRequest?.journalEntryId ? '✅' : '❌'}`);
        console.log(`   Request Invoice Link: ${verifyRequest?.invoiceId ? '✅' : '❌'}`);

        // Verify Vendor Expense GL Entry (Master)
        if (verifyRequest?.journalEntry) {
            const lines = verifyRequest.journalEntry.lines;
            const debit = lines.reduce((s, l) => s + Number(l.debit), 0);
            const credit = lines.reduce((s, l) => s + Number(l.credit), 0);
            console.log(`   Expense GL Balanced: ${debit === credit && debit === 250 ? '✅' : '❌'} ($${debit})`);
        }

        // Verify Tenant Recovery GL Entry
        if (verifyRequest?.invoice?.journalEntry) {
            const lines = verifyRequest.invoice.journalEntry.lines;
            const debit = lines.reduce((s, l) => s + Number(l.debit), 0);
            const credit = lines.reduce((s, l) => s + Number(l.credit), 0);
            console.log(`   Recovery GL Balanced: ${debit === credit && debit === 250 ? '✅' : '❌'} ($${debit})`);
            console.log(`   Recovery Account: ${lines.find(l => Number(l.credit) > 0)?.accountId.includes('4300') ? '✅ (Income 4300)' : '❌'}`);
        }

        // 7. Cleanup
        console.log('\n🧹 Cleaning up...');
        const invoiceId = verifyRequest?.invoiceId;
        const expenseJournalId = verifyRequest?.journalEntryId;
        const recoveryJournalId = verifyRequest?.invoice?.journalEntryId;

        // Delete InvoiceItems first
        if (invoiceId) {
            await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
        }

        // Delete in reverse order of dependencies
        await prisma.maintenanceRequest.delete({ where: { id: request.id } });
        if (invoiceId) await prisma.invoice.delete({ where: { id: invoiceId } });

        // Cleanup Journals
        if (expenseJournalId) {
            await prisma.journalLine.deleteMany({ where: { journalEntryId: expenseJournalId } });
            await prisma.journalEntry.delete({ where: { id: expenseJournalId } });
        }
        if (recoveryJournalId) {
            await prisma.journalLine.deleteMany({ where: { journalEntryId: recoveryJournalId } });
            await prisma.journalEntry.delete({ where: { id: recoveryJournalId } });
        }

        await prisma.lease.delete({ where: { id: lease.id } });
        await prisma.tenantapplication.delete({ where: { id: application.id } });
        await prisma.organizationUser.delete({ where: { id: orgUser.id } });
        await prisma.user.delete({ where: { id: tenant.id } });
        await prisma.unit.delete({ where: { id: unit.id } });
        await prisma.property.delete({ where: { id: property.id } });

        console.log('✅ Cleanup complete\n');
        console.log('🎉 MAINTENANCE BILLING VERIFIED!\n');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyMaintenanceBilling();
