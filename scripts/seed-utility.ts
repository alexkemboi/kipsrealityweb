/**
 * Minimal Utility Seed Script
 * Fixed for Prisma Client (CamelCase Field Names)
 */

import { PrismaClient, utility_type, UtilityBillStatus, UtilitySplitMethod } from '@prisma/client';
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

    // STEP 1: Cleanup existing utility data
    console.log('\n🧹 Cleaning up existing data...');

    await prisma.$transaction(async (tx) => {
        // Delete in order of dependencies (Child -> Parent)
        await tx.utilityPayment.deleteMany({}); // New table
        await tx.utilityDispute.deleteMany({}); // New table
        await tx.utilityAllocation.deleteMany({});
        await tx.utilityBill.deleteMany({});
        await tx.utility_reading.deleteMany({});
        await tx.lease_utility.deleteMany({});
        console.log(`  ✓ Cleaned up utility tables`);
    });

    // STEP 2: Seed utilities
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

    // STEP 3: Seed lease_utility
    console.log('\n🔗 Linking utilities to lease...');

    await prisma.lease_utility.upsert({
        where: { id: IDS.leaseUtilities.elec },
        update: {},
        create: {
            id: IDS.leaseUtilities.elec,
            lease_id: primaryLease.id,
            utility_id: electricityUtil.id,
            is_tenant_responsible: true,
        },
    });

    await prisma.lease_utility.upsert({
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

    // STEP 4: Seed utility_reading
    console.log('\n📖 Seeding readings...');

    const prevDate = new Date('2024-12-15');
    const currDate = new Date('2025-01-15');

    await prisma.utility_reading.upsert({
        where: { id: IDS.readings.previous },
        update: {},
        create: {
            id: IDS.readings.previous,
            lease_utility_id: IDS.leaseUtilities.elec, // Use ID directly
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
            lease_utility_id: IDS.leaseUtilities.elec, // Use ID directly
            reading_value: 10350,
            readingDate: currDate,
            amount: 350 * 0.18,
        },
    });
    console.log(`  ✓ Previous: 10,000 kWh | Current: 10,350 kWh`);

    // STEP 5: Seed utility_bill
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
            // ✅ FIX: Use 'utilityId' (CamelCase), NOT 'utility_id'
            utilityId: electricityUtil.id, 
            providerName: 'Pacific Gas & Electric',
            totalAmount: new Decimal('63.00'),
            consumption: 350,
            rate: 0.18,
            // ✅ FIX: Use CamelCase variable names defined above
            periodStart: periodStart,
            periodEnd: periodEnd,
            billDate: billDate,
            dueDate: dueDate,
            status: 'APPROVED' as UtilityBillStatus,
            splitMethod: 'EQUAL' as UtilitySplitMethod,
            // ✅ FIX: Use 'updatedAt' (CamelCase)
            updatedAt: new Date(), 
        },
    });

    const waterBill = await prisma.utilityBill.upsert({
        where: { id: IDS.bills.water },
        update: {},
        create: {
            id: IDS.bills.water,
            propertyId: primaryProperty.id,
            // ✅ FIX: CamelCase key
            utilityId: waterUtil.id, 
            providerName: 'City Water Authority',
            totalAmount: new Decimal('16.80'),
            consumption: 2800,
            rate: 0.006,
            // ✅ FIX: Use correct CamelCase keys mapping to the variables
            periodStart: periodStart,
            periodEnd: periodEnd,
            billDate: billDate,
            dueDate: dueDate,
            status: 'APPROVED' as UtilityBillStatus,
            splitMethod: 'EQUAL' as UtilitySplitMethod,
            updatedAt: new Date(),
        },
    });
    console.log(`  ✓ Electricity: $63.00 | Water: $16.80`);

    // STEP 6: Seed utility_allocation
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
            // Removed percentage as it wasn't in your previous schema snippet
            // If you added it back, uncomment:
            // percentage: new Decimal('100.00'), 
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