import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 🛡️ SAFETY CHECK
  const dbUrl = process.env['DATABASE_URL'];
  if (!dbUrl || !dbUrl.includes('rentflow360_test')) {
    console.error('🚨 DANGER: Attempting to seed E2E data into a non-test database!');
    process.exit(1);
  }

  console.log('🌱 Seeding E2E Test Data...');

  // Deterministic dates for stable tests
  const now = new Date('2026-02-01T10:00:00.000Z');
  const leaseStart = new Date('2026-02-01T00:00:00.000Z');
  const leaseEnd = new Date('2027-01-31T23:59:59.000Z');
  const moveInDate = new Date('2026-02-05T00:00:00.000Z');
  const dob = new Date('1990-01-01T00:00:00.000Z');

  const managerPasswordHash = await bcrypt.hash('password123', 12);
  const tenantPasswordHash = await bcrypt.hash('password123', 12);

  await prisma.$transaction(async (tx) => {
    // 1) CLEANUP (child -> parent)
    // Add/remove entries here depending on your schema relations.
    // These are the core ones from your flows.
    await tx.invite.deleteMany();
    await tx.payment.deleteMany();
    await tx.invoice.deleteMany();
    await tx.lease.deleteMany();
    await tx.tenantapplication.deleteMany(); // ✅ important (was missing)
    await tx.unit.deleteMany();
    await tx.property.deleteMany();
    await tx.organizationUser.deleteMany();
    await tx.user.deleteMany();
    await tx.organization.deleteMany();

    // 2) ORGANIZATION
    const org = await tx.organization.create({
      data: {
        name: 'E2E Test Org',
        slug: 'e2e-test-org',
        isActive: true,
      },
    });

    // 3) MANAGER USER (verified)
    const manager = await tx.user.create({
      data: {
        email: 'manager@test.com',
        passwordHash: managerPasswordHash,
        firstName: 'Test',
        lastName: 'Manager',
        status: 'ACTIVE',
        emailVerified: now,
        organizationUsers: {
          create: {
            organizationId: org.id,
            role: 'PROPERTY_MANAGER',
          },
        },
      },
    });

    // 4) GET ORG USER LINK (used as property.managerId)
    const orgUser = await tx.organizationUser.findFirstOrThrow({
      where: {
        userId: manager.id,
        organizationId: org.id,
      },
    });

    // 5) TENANT USER (verified)
    const tenant = await tx.user.create({
      data: {
        email: 'tenant@test.com',
        passwordHash: tenantPasswordHash,
        firstName: 'Test',
        lastName: 'Tenant',
        status: 'ACTIVE',
        emailVerified: now,
        organizationUsers: {
          create: {
            organizationId: org.id,
            role: 'TENANT',
          },
        },
      },
    });

    // 6) PROPERTY
    const property = await tx.property.create({
      data: {
        name: 'Sunset Apartments',
        organizationId: org.id,
        managerId: orgUser.id,
        city: 'Nairobi',
        address: '123 Test St',
      },
    });

    // 7) UNIT
    const unit = await tx.unit.create({
      data: {
        unitNumber: '101',
        propertyId: property.id,
        rentAmount: 15000,
        isOccupied: true, // needed for active lease flow assumptions
      },
    });

    // 8) TENANT APPLICATION (required by lease FK in your schema)
    const tenantApplication = await tx.tenantapplication.create({
      data: {
        fullName: 'Test Tenant',
        email: 'tenant@test.com',
        phone: '+254712345678',
        dob,
        leaseType: 'RESIDENTIAL',
        occupancyType: 'PRIMARY',
        moveInDate,
        leaseDuration: '12 months',
        propertyId: property.id,
        unitId: unit.id,
        status: 'APPROVED',
        consent: true,
        userId: tenant.id,
      },
    });

    // 9) LEASE (active)
    const lease = await tx.lease.create({
      data: {
        applicationId: tenantApplication.id,
        propertyId: property.id,
        unitId: unit.id,
        tenantId: tenant.id,
        startDate: leaseStart,
        endDate: leaseEnd,
        rentAmount: 15000,
        leaseStatus: 'ACTIVE',
        paymentDueDay: 5,
        paymentFrequency: 'MONTHLY',
      },
    });

    console.log('✅ Seed complete');
    console.log(`   Org: ${org.name} (${org.id})`);
    console.log(`   Manager: ${manager.email}`);
    console.log(`   Tenant: ${tenant.email}`);
    console.log(`   Property: ${property.name}`);
    console.log(`   Unit: ${unit.unitNumber}`);
    console.log(`   Lease ID: ${lease.id}`);
  });

  console.log('🎉 E2E test data seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
