import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// 1. Fields that MUST be boolean (Convert 1/0 -> true/false)
const BOOLEAN_FIELDS = new Set([
    'isActive', 'isActive', 'is_active',
    'isFurnished', 'isFurnished', 'is_furnished',
    'accepted',
    'isSigned', 'isSigned', 'is_signed',
    'isOccupied', 'isOccupied', 'is_occupied',
    'isReversed', 'isReversed', 'is_reversed',
    'searchBar', 'searchBar', 'search_bar',
    'isVisible', 'isVisible', 'is_visible',
    'isAvailable', 'isAvailable', 'is_available',
    'isExternal', 'isExternal', 'is_external',
    'isTenantResponsible', 'isTenantResponsible', 'is_tenant_responsible',
    'isOptional', 'isOptional', 'is_optional',
    'hasSigned', 'hasSigned', 'has_signed',
    'hasRenewalOption', 'hasRenewalOption', 'has_renewal_option',
    'hasRentEscalation', 'hasRentEscalation', 'has_rent_escalation',
    'autoRenew', 'autoRenew', 'auto_renew',
    'consentMarketing', 'consentNotifications', 'consentTransactional',
    'tenantPaysElectric', 'tenantPaysInternet', 'tenantPaysTrash', 'tenantPaysWater',
    'consent'
]);

// 2. Explicit Key Remapping (Backup Key -> Prisma Client Expected Key)
// ✅ FIX: Mapping to CamelCase which Prisma Client expects
const FIELD_TRANSLATIONS: Record<string, Record<string, string>> = {
    'MaintenanceRequest': {
        'assigned_at': 'assignedAt',       // Fixes "Did you mean assignedAt?"
        'assigned_vendor_id': 'assignedVendorId',
        'organization_id': 'organizationId',
        'property_id': 'propertyId',
        'requested_by_id': 'requestedById',
        'unit_id': 'unitId'
    },
    'Lease': {
        'lease_status': 'leaseStatus',
        'application_id': 'applicationId',
        'tenant_id': 'tenantId',
        'property_id': 'propertyId',
        'unit_id': 'unitId',
        'end_date': 'endDate',
        'start_date': 'startDate',
        'rent_amount': 'rentAmount'
    },
    'LeaseAmendment': {
        'amendment_type': 'amendmentType',
        'lease_id': 'leaseId',
        'effective_date': 'effectiveDate'
    },
    'Property': {
        'listing_id': 'listingId',
        'manager_id': 'managerId',
        'organization_id': 'organizationId',
        'property_type_id': 'propertyTypeId',
        'location_id': 'locationId'
    },
    'User': {
        'email_verified': 'emailVerified',
        'password_hash': 'passwordHash',
        'first_name': 'firstName',
        'last_name': 'lastName',
        'avatar_url': 'avatarUrl',
        'last_login_at': 'lastLoginAt',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt'
    }
};

const toCamelCase = (str: string) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

async function seedNavbarItemsIfMissing() {
    const existingCount = await prisma.navbarItem.count();
    if (existingCount > 0) {
        console.log(`ℹ️ Navbar items already exist (${existingCount}). Skipping navbar seed.`);
        return;
    }

    console.log('🌱 Seeding default navbar items...');

    await prisma.navbarItem.createMany({
        data: [
            { name: 'Home', href: '/', order: 0, isVisible: true, isAvailable: true },
            { name: 'About', href: '/about', order: 10, isVisible: true, isAvailable: true },
            { name: 'Plans', href: '/plans', order: 20, isVisible: true, isAvailable: true },
            { name: 'Marketplace', href: '/marketplace', order: 30, isVisible: true, isAvailable: true },
            { name: 'Blog', href: '/blog', order: 40, isVisible: true, isAvailable: true },
            { name: 'Contact', href: '/contact', order: 50, isVisible: true, isAvailable: true },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Default navbar items seeded.');
}

async function seedTestimonialsIfMissing() {
    const existingCount = await prisma.testimonial.count();
    if (existingCount > 0) {
        console.log(`ℹ️ Testimonials already exist (${existingCount}). Skipping testimonial seed.`);
        return;
    }

    console.log('🌱 Seeding default testimonials...');

    await prisma.testimonial.createMany({
        data: [
            {
                name: 'Sarah Johnson',
                role: 'Property Manager',
                image: '/lady.jpg',
                text: 'RentFlow360 has completely transformed how I manage my properties. The automation features save me hours every week!',
            },
            {
                name: 'Michael Chen',
                role: 'Real Estate Investor',
                image: '/man.jpeg',
                text: "The financial analytics are incredible. I now have complete visibility into my portfolio's performance.",
            },
            {
                name: 'Emily Rodriguez',
                role: 'Landlord',
                image: '/smile.jpeg',
                text: 'The tenant portal has dramatically improved communication with my tenants. Maintenance requests are now handled seamlessly.',
            },
        ],
    });

    console.log('✅ Default testimonials seeded.');
}

async function main() {
    // Run this seed when setting up a new database or environment.
    // Uses upsert to prevent duplicates - safe to run multiple times.
    const propertyTypes = [
        { id: "1", name: "House", description: "Single family home" },
        { id: "2", name: "Apartment", description: "Apartment unit" },
        { id: "3", name: "condominium (Condos)", description: "Condominium units" },
        { id: "4", name: "Land", description: "Vacant land or plots" },
        { id: "5", name: "Townhouse", description: "Townhouse or row house" },
    ]

    for (const type of propertyTypes) {
        await prisma.propertyType.upsert({
            where: { id: type.id },
            update: {},
            create: type,
        });
    }

    const backupDir = path.join(process.cwd(), 'backup');
    const hasBackupDir = fs.existsSync(backupDir);

    try {
        if (hasBackupDir) {
            await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;');

            const PRIORITY = ['Organization', 'User', 'Property', 'Unit', 'Lease'];

            const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort((a, b) => {
                const modelA = a.replace('.json', '');
                const modelB = b.replace('.json', '');
                const idxA = PRIORITY.indexOf(modelA);
                const idxB = PRIORITY.indexOf(modelB);
                if (idxA > -1 && idxB > -1) return idxA - idxB;
                if (idxA > -1) return -1;
                if (idxB > -1) return 1;
                return 0;
            });

            const processedModels = new Set<string>();

            for (const file of files) {
                const rawModelName = file.replace('.json', '');
                let clientKey = rawModelName;

            // Map common plural/casing issues
            if (clientKey === 'vendors') clientKey = 'vendor';
            if (clientKey === 'services') clientKey = 'service';
            if (clientKey === 'categories') clientKey = 'category';
            if (clientKey === 'invoice') clientKey = 'invoice';
            if (clientKey === 'payment') clientKey = 'payment';
            if (clientKey === 'receipt') clientKey = 'receipt';
            if (clientKey === 'utility') clientKey = 'utility';
            if (clientKey === 'lease_utility') clientKey = 'leaseUtility';
            if (clientKey === 'utility_reading') clientKey = 'utilityReading';
            if (clientKey === 'payment_reversal') clientKey = 'paymentReversal';
            if (clientKey === 'Tenantapplication') clientKey = 'tenantapplication';
            if (clientKey === 'PropertyImage') clientKey = 'propertyImage';

            clientKey = clientKey.charAt(0).toLowerCase() + clientKey.slice(1);

            if (processedModels.has(clientKey)) continue;
            processedModels.add(clientKey);

            // @ts-ignore
            if (!prisma[clientKey]) {
                const pascalKey = rawModelName.charAt(0).toUpperCase() + rawModelName.slice(1);
                // @ts-ignore
                if (prisma[pascalKey]) clientKey = pascalKey;
                else {
                    continue;
                }
            }

            const filePath = path.join(backupDir, file);
            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'), (key, value) => {
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value);
                return value;
            });

            if (!Array.isArray(rawData) || rawData.length === 0) continue;

            const normalizedData = rawData.map(item => {
                const newItem: any = {};
                for (const key in item) {
                    let value = item[key];
                    let newKey = key;

                    // 1. Apply Manual Translation (Backup Key -> Client Key)
                    if (FIELD_TRANSLATIONS[rawModelName] && FIELD_TRANSLATIONS[rawModelName][key]) {
                        newKey = FIELD_TRANSLATIONS[rawModelName][key];
                    }
                    // 2. Auto-convert snake_case -> camelCase
                    else if (key.includes('_')) {
                        newKey = toCamelCase(key);
                    }

                    // 3. Boolean Conversion
                    // Check against the *original* key or the *new* key
                    if ((BOOLEAN_FIELDS.has(key) || BOOLEAN_FIELDS.has(newKey)) && (value === 0 || value === 1)) {
                        value = value === 1;
                    }

                    newItem[newKey] = value;
                }
                return newItem;
            });

            // 4. Safety Filter: Remove rows with null required FKs
            const cleanData = normalizedData.filter(item => {
                if (clientKey === 'property' && !item.organizationId) return false;
                if (clientKey === 'user' && !item.email) return false;
                return true;
            });


            try {
                // @ts-ignore
                await prisma[clientKey].createMany({
                    data: cleanData,
                    skipDuplicates: true
                });
            } catch (err: any) {
            }
        }
        }

        // Always ensure navbar items exist for the website top nav
        await seedNavbarItemsIfMissing();

        // Ensure the marketing testimonials section has content
        await seedTestimonialsIfMissing();
    } catch (e) {
    } finally {
        if (hasBackupDir) {
            await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1;');
        }
        await prisma.$disconnect();
    }
}

main();
