import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    console.log('🌱 DATABASE_URL:', dbUrl);
    
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }
    
    // Check if we're seeding the test database (allow query params)
    const isTestDb = dbUrl.includes('rentflow360_test');
    const isCi = process.env.CI === 'true';
    
    if (!isTestDb && !isCi) {
        console.warn('⚠️  WARNING: Not seeding rentflow360_test database!');
        console.warn('   URL contains:', dbUrl);
        console.warn('   If this is CI, ensure DATABASE_URL points to rentflow360_test');
        // Don't exit in CI - it might still work
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    const email = 'manager@test.com';

    console.log('🌱 Seeding E2E test data...');

    // 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'test-org' },
        update: {},
        create: {
            name: 'Test Organization',
            slug: 'test-org',
        },
    });

    // 1.1 Create Financial Entity & Accounts
    const entity = await prisma.financialEntity.upsert({
        where: { id: 'test-entity' },
        update: {},
        create: {
            id: 'test-entity',
            organizationId: org.id,
            name: 'Test Financial Entity',
        },
    });

    const accounts = [
        { code: '1000', name: 'Cash - Operating Account', type: 'ASSET' as const, isSystem: true },
        { code: '1100', name: 'Accounts Receivable', type: 'ASSET' as const, isSystem: true },
        { code: '4000', name: 'Rental Income', type: 'INCOME' as const, isSystem: true },
    ];

    for (const acc of accounts) {
        await prisma.account.upsert({
            where: {
                entityId_code: {
                    entityId: entity.id,
                    code: acc.code,
                },
            },
            update: {
                name: acc.name,
                type: acc.type,
                isSystem: acc.isSystem,
            },
            create: {
                entityId: entity.id,
                code: acc.code,
                name: acc.name,
                type: acc.type,
                isSystem: acc.isSystem,
            },
        });
    }

    // 2. Create Manager User (Pre-verified for E2E tests)
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            status: 'ACTIVE',
            emailVerified: new Date(),
            verificationToken: null, // No verification needed for tests
        },
        create: {
            email,
            firstName: 'Test',
            lastName: 'Manager',
            passwordHash,
            status: 'ACTIVE',
            emailVerified: new Date(), // PRE-VERIFIED for CI login
            verificationToken: null,
        },
    });

    console.log('✅ Manager User created:', { id: user.id, email: user.email, emailVerified: user.emailVerified });

    // 3. Link User to Org
    const orgUser = await prisma.organizationUser.upsert({
        where: {
            userId_organizationId: {
                userId: user.id,
                organizationId: org.id,
            },
        },
        update: { role: 'PROPERTY_MANAGER' },
        create: {
            userId: user.id,
            organizationId: org.id,
            role: 'PROPERTY_MANAGER',
        },
    });

    console.log('✅ Organization User created:', { id: orgUser.id, userId: orgUser.userId, organizationId: orgUser.organizationId });

    // 4. Get or Create Property Type (deterministic for CI)
    let propType = await prisma.propertyType.findFirst({
        where: { name: 'Apartment' },
    });
    if (!propType) {
        propType = await prisma.propertyType.create({
            data: {
                id: 'e2e-test-property-type',
                name: 'Apartment',
                description: 'Test Apartment Type for E2E',
            },
        });
    }
    console.log('✅ Property Type:', { id: propType.id, name: propType.name });

    // 5. Create Property (deterministic for CI)
    const property = await prisma.property.create({
        data: {
            name: 'Test Property E2E',
            address: '123 Test St',
            city: 'Test City',
            managerId: orgUser.id,
            organizationId: org.id,
            propertyTypeId: propType.id,
        },
    });
    
    console.log('✅ Property created:', { 
        id: property.id, 
        name: property.name, 
        managerId: property.managerId,
        organizationId: property.organizationId 
    });

    // 6. Create Unit
    const unit = await prisma.unit.create({
        data: {
            unitNumber: '101',
            propertyId: property.id,
            rentAmount: 1500,
            isOccupied: false,
        },
    });

    // 7. Create Tenant User
    const tenantEmail = 'tenant@test.com';
    const tenantUser = await prisma.user.upsert({
        where: { email: tenantEmail },
        update: { status: 'ACTIVE', emailVerified: new Date() },
        create: {
            email: tenantEmail,
            firstName: 'John',
            lastName: 'Doe',
            passwordHash,
            status: 'ACTIVE',
            emailVerified: new Date(),
        },
    });

    // 8. Create Tenant Application (Required by Lease)
    const application = await prisma.tenantapplication.create({
        data: {
            fullName: 'John Doe',
            email: tenantEmail,
            phone: '1234567890',
            dob: new Date('1990-01-01'),
            moveInDate: new Date(),
            leaseType: 'STANDARD',
            occupancyType: 'RESIDENTIAL',
            leaseDuration: '12 months',
            propertyId: property.id,
            unitId: unit.id,
            userId: tenantUser.id,
            status: 'APPROVED',
        },
    });

    // 9. Create Lease (deterministic for CI)
    const lease = await prisma.lease.create({
        data: {
            id: 'e2e-test-lease-1',
            applicationId: application.id,
            propertyId: property.id,
            unitId: unit.id,
            tenantId: tenantUser.id,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            rentAmount: 1500,
            leaseStatus: 'ACTIVE',
        },
    });
    
    console.log('✅ Lease created:', { 
        id: lease.id, 
        propertyId: lease.propertyId, 
        unitId: lease.unitId,
        tenantId: lease.tenantId,
        leaseStatus: lease.leaseStatus 
    });

    // 10. Final validation and debug output
    console.log('\n📊 FINAL VALIDATION:');
    console.log('====================');
    
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    const unitCount = await prisma.unit.count();
    const leaseCount = await prisma.lease.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Properties: ${propertyCount}`);
    console.log(`Units: ${unitCount}`);
    console.log(`Leases: ${leaseCount}`);
    
    // Verify relationship chain
    const verifiedProperty = await prisma.property.findUnique({
        where: { id: property.id },
        include: {
            manager: {
                include: { user: true }
            }
        }
    });
    
    if (verifiedProperty?.manager?.user?.id === user.id) {
        console.log('✅ Property-Manager-User chain is CORRECT');
        console.log(`   Property → Manager (OrgUser): ${verifiedProperty.managerId}`);
        console.log(`   Manager → User: ${verifiedProperty.manager.userId}`);
        console.log(`   Expected User: ${user.id}`);
    } else {
        console.log('❌ Property-Manager-User chain is BROKEN');
        console.log('   This will cause lease API to return empty results!');
    }
    
    console.log('✅ E2E Seed complete and validated.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });