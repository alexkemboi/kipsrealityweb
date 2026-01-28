/**
 * Minimal Utility Seed Script
 *
 * Creates deterministic, minimal utility data for integration testing.
 * Not intended for load testing or production use.
 *
 * Dependency order:
 * property → unit → lease → utility → lease_utility → reading → bill → allocation
 *
 * Cleanup runs in reverse order to satisfy FK constraints.
 *
 * STRICT LIMITS: 2 records per table (10 total new rows)
 */

import { PrismaClient, utility_type, utility_bills_status, utility_bills_split_method } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Deterministic IDs for reproducibility
const IDS = {
    utilities: {
        electricity: 'util-elec-seed-0001',
        water: 'util-watr-seed-0002',
    },
    leaseUtilities: {
        elec: 'lutil-elec-seed-001',
        water: 'lutil-watr-seed-002',
    },
    readings: {
        previous: 'read-prev-seed-0001',
        current: 'read-curr-seed-0002',
    },
    bills: {
        electricity: 'bill-elec-seed-0001',
        water: 'bill-watr-seed-0002',
    },
    allocations: {
        elec: 'alloc-elec-seed-001',
        water: 'alloc-watr-seed-002',
    },
} as const;

async function main() {
    console.log('═'.repeat(50));
    console.log('🔌 MINIMAL UTILITY SEED');
    console.log('═'.repeat(50));

    // STEP 0: Verify prerequisites
    // Find an active lease first, then get its property
    console.log('\n📋 Verifying prerequisites...');

    const primaryLease = await prisma.lease.findFirst({
        where: { leaseStatus: 'ACTIVE' },
        include: {
            unit: true,
            property: {
                include: { units: { take: 2 } }
            }
        },
    });

    if (!primaryLease) {
        console.error('❌ No active lease found. Run main seed first.');
        return;
    }

    const primaryProperty = primaryLease.property;

    if (!primaryProperty || primaryProperty.units.length === 0) {
        console.error('❌ Lease property has no units. Run main seed first.');
        return;
    }

    console.log(`  ✓ Property: ${primaryProperty.name || primaryProperty.address}`);
    console.log(`  ✓ Lease: ${primaryLease.id.slice(0, 8)}...`);

    // STEP 1: Cleanup existing utility data (FK-safe order)
    // ⚠️ WARNING: This deletes ALL utility data across all properties.
    //    Only run in dev/test environments. Not safe for shared databases.
    console.log('\n🧹 Cleaning up existing data...');

    await prisma.$transaction(async (tx) => {
        const allocDel = await tx.utilityAllocation.deleteMany({});
        const billDel = await tx.utilityBill.deleteMany({});
        const readDel = await tx.utility_reading.deleteMany({});
        const luDel = await tx.lease_utility.deleteMany({});
        console.log(`  ✓ Deleted: ${allocDel.count} allocs, ${billDel.count} bills, ${readDel.count} readings, ${luDel.count} lease_utils`);
    });

    // STEP 2: Seed utilities (2 records)
    console.log('\n📊 Seeding utilities...');

    const electricityUtil = await prisma.utility.upsert({
        where: { name: 'Electricity' },
        update: { unitPrice: 0.18 },
        create: {
            id: IDS.utilities.electricity,
            name: 'Electricity',
            type: 'METERED' as utility_type,
            unitPrice: 0.18,
        },
    });

    const waterUtil = await prisma.utility.upsert({
        where: { name: 'Water' },
        update: { unitPrice: 0.006 },
        create: {
            id: IDS.utilities.water,
            name: 'Water',
            type: 'METERED' as utility_type,
            unitPrice: 0.006,
        },
    });
    console.log(`  ✓ Electricity, Water`);

    // STEP 3: Seed lease_utility (2 records)
    console.log('\n🔗 Linking utilities to lease...');

    const leaseUtilElec = await prisma.lease_utility.upsert({
        where: { id: IDS.leaseUtilities.elec },
        update: {},
        create: {
            id: IDS.leaseUtilities.elec,
            lease_id: primaryLease.id,
            utility_id: electricityUtil.id,
            is_tenant_responsible: true,
        },
    });

    const leaseUtilWater = await prisma.lease_utility.upsert({
        where: { id: IDS.leaseUtilities.water },
        update: {},
        create: {
            id: IDS.leaseUtilities.water,
            lease_id: primaryLease.id,
            utility_id: waterUtil.id,
            is_tenant_responsible: true,
        },
    });
    console.log(`  ✓ 2 lease-utility links`);

    // STEP 4: Seed utility_reading (2 records)
    console.log('\n📖 Seeding readings...');

    const prevDate = new Date('2024-12-15');
    const currDate = new Date('2025-01-15');

    await prisma.utility_reading.upsert({
        where: { id: IDS.readings.previous },
        update: {},
        create: {
            id: IDS.readings.previous,
            lease_utility_id: leaseUtilElec.id,
            reading_value: 10000,
            readingDate: prevDate,
            amount: null,
        },
    });

    await prisma.utility_reading.upsert({
        where: { id: IDS.readings.current },
        update: {},
        create: {
            id: IDS.readings.current,
            lease_utility_id: leaseUtilElec.id,
            reading_value: 10350,
            readingDate: currDate,
            amount: 350 * 0.18,
        },
    });
    console.log(`  ✓ Previous: 10,000 kWh | Current: 10,350 kWh`);

    // STEP 5: Seed utility_bill (2 records)
    console.log('\n💵 Seeding bills...');

    const periodStart = new Date('2024-12-15');
    const periodEnd = new Date('2025-01-15');
    const billDate = new Date('2025-01-16');
    const dueDate = new Date('2025-02-15');

    const elecBill = await prisma.utilityBill.upsert({
        where: { id: IDS.bills.electricity },
        update: {},
        create: {
            id: IDS.bills.electricity,
            propertyId: primaryProperty.id,
            utilityId: electricityUtil.id,
            providerName: 'Pacific Gas & Electric',
            totalAmount: new Decimal('63.00'),
            consumption: 350,
            rate: 0.18,
            periodStart,
            periodEnd,
            billDate,
            dueDate,
            status: 'APPROVED' as utility_bills_status,
            split_method: 'EQUAL_USAGE' as utility_bills_split_method,
            updated_at: new Date(),
        },
    });

    const waterBill = await prisma.utilityBill.upsert({
        where: { id: IDS.bills.water },
        update: {},
        create: {
            id: IDS.bills.water,
            propertyId: primaryProperty.id,
            utilityId: waterUtil.id,
            providerName: 'City Water Authority',
            totalAmount: new Decimal('16.80'),
            consumption: 2800,
            rate: 0.006,
            periodStart,
            periodEnd,
            billDate,
            dueDate,
            status: 'APPROVED' as utility_bills_status,
            split_method: 'EQUAL_USAGE' as utility_bills_split_method,
            updated_at: new Date(),
        },
    });
    console.log(`  ✓ Electricity: $63.00 | Water: $16.80`);

    // STEP 6: Seed utility_allocation (2 records)
    console.log('\n📊 Seeding allocations...');

    const primaryUnit = primaryProperty.units[0];

    await prisma.utilityAllocation.upsert({
        where: { id: IDS.allocations.elec },
        update: {},
        create: {
            id: IDS.allocations.elec,
            utilityBillId: elecBill.id,
            unitId: primaryUnit.id,
            amount: new Decimal('63.00'),
            percentage: new Decimal('100.00'),
        },
    });

    await prisma.utilityAllocation.upsert({
        where: { id: IDS.allocations.water },
        update: {},
        create: {
            id: IDS.allocations.water,
            utilityBillId: waterBill.id,
            unitId: primaryUnit.id,
            amount: new Decimal('16.80'),
            percentage: new Decimal('100.00'),
        },
    });
    console.log(`  ✓ 2 allocations → Unit ${primaryUnit.unitNumber}`);

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('✅ SEED COMPLETE');
    console.log('═'.repeat(50));
    console.log('  utilities: 2 | lease_utilities: 2 | readings: 2');
    console.log('  bills: 2 | allocations: 2 | TOTAL: 10 rows');
    console.log('  Verify: npx prisma studio');
}

main()
    .catch((e) => {
        console.error('❌ SEED FAILED:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
