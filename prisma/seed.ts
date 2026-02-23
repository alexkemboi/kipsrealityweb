import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const BOOLEAN_FIELDS = new Set([
  'isActive', 'is_active',
  'isFurnished', 'is_furnished',
  'accepted',
  'isSigned', 'is_signed',
  'isOccupied', 'is_occupied',
  'isReversed', 'is_reversed',
  'searchBar', 'search_bar',
  'isVisible', 'is_visible',
  'isAvailable', 'is_available',
  'isExternal', 'is_external',
  'isTenantResponsible', 'is_tenant_responsible',
  'isOptional', 'is_optional',
  'hasSigned', 'has_signed',
  'hasRenewalOption', 'has_renewal_option',
  'hasRentEscalation', 'has_rent_escalation',
  'autoRenew', 'auto_renew',
  'consentMarketing', 'consentNotifications', 'consentTransactional',
  'tenantPaysElectric', 'tenantPaysInternet', 'tenantPaysTrash', 'tenantPaysWater',
  'consent',
]);

const FIELD_TRANSLATIONS: Record<string, Record<string, string>> = {
  MaintenanceRequest: {
    assigned_at: 'assignedAt',
    assigned_vendor_id: 'assignedVendorId',
    organization_id: 'organizationId',
    property_id: 'propertyId',
    requested_by_id: 'requestedById',
    unit_id: 'unitId',
  },
  Lease: {
    lease_status: 'leaseStatus',
    application_id: 'applicationId',
    tenant_id: 'tenantId',
    property_id: 'propertyId',
    unit_id: 'unitId',
    end_date: 'endDate',
    start_date: 'startDate',
    rent_amount: 'rentAmount',
  },
  LeaseAmendment: {
    amendment_type: 'amendmentType',
    lease_id: 'leaseId',
    effective_date: 'effectiveDate',
  },
  Property: {
    listing_id: 'listingId',
    manager_id: 'managerId',
    organization_id: 'organizationId',
    property_type_id: 'propertyTypeId',
    location_id: 'locationId',
  },
  User: {
    email_verified: 'emailVerified',
    password_hash: 'passwordHash',
    first_name: 'firstName',
    last_name: 'lastName',
    avatar_url: 'avatarUrl',
    last_login_at: 'lastLoginAt',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    verification_token_hash: 'verificationTokenHash',
    verification_token_expires_at: 'verificationTokenExpiresAt',
  },
};

const toCamelCase = (str: string) =>
  str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function normalizeClientKey(rawModelName: string): string {
  let clientKey = rawModelName;

  // Common plural/casing fixes
  if (clientKey === 'vendors') clientKey = 'vendor';
  if (clientKey === 'services') clientKey = 'service';
  if (clientKey === 'categories') clientKey = 'category';
  if (clientKey === 'lease_utility') clientKey = 'leaseUtility';
  if (clientKey === 'utility_reading') clientKey = 'utilityReading';
  if (clientKey === 'payment_reversal') clientKey = 'paymentReversal';
  if (clientKey === 'Tenantapplication') clientKey = 'tenantapplication';
  if (clientKey === 'PropertyImage') clientKey = 'propertyImage';

  return clientKey.charAt(0).toLowerCase() + clientKey.slice(1);
}

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

async function seedReferenceData() {
  const propertyTypes = [
    { id: '1', name: 'House', description: 'Single family home' },
    { id: '2', name: 'Apartment', description: 'Apartment unit' },
    { id: '3', name: 'condominium (Condos)', description: 'Condominium units' },
    { id: '4', name: 'Land', description: 'Vacant land or plots' },
    { id: '5', name: 'Townhouse', description: 'Townhouse or row house' },
  ];

  for (const type of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    });
  }

  console.log('✅ Reference property types seeded/upserted.');
}

async function importBackupIfPresent() {
  const backupDir = process.env.BACKUP_DIR
    ? path.resolve(process.env.BACKUP_DIR)
    : path.join(process.cwd(), 'backup');

  const hasBackupDir = fs.existsSync(backupDir);
  if (!hasBackupDir) {
    console.log(`ℹ️ No backup directory found at: ${backupDir}. Skipping backup import.`);
    return;
  }

  console.log(`📂 Backup directory found: ${backupDir}`);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;');

  try {
    const PRIORITY = ['Organization', 'User', 'Property', 'Unit', 'Lease'];

    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith('.json'))
      .sort((a, b) => {
        const modelA = a.replace('.json', '');
        const modelB = b.replace('.json', '');
        const idxA = PRIORITY.indexOf(modelA);
        const idxB = PRIORITY.indexOf(modelB);

        if (idxA > -1 && idxB > -1) return idxA - idxB;
        if (idxA > -1) return -1;
        if (idxB > -1) return 1;
        return a.localeCompare(b);
      });

    const processedModels = new Set<string>();

    for (const file of files) {
      const rawModelName = file.replace('.json', '');
      let clientKey = normalizeClientKey(rawModelName);

      if (processedModels.has(clientKey)) {
        console.log(`⚠️ Skipping duplicate normalized model "${clientKey}" from file "${file}"`);
        continue;
      }

      // @ts-ignore dynamic Prisma model access
      if (!prisma[clientKey]) {
        const pascalKey = rawModelName.charAt(0).toUpperCase() + rawModelName.slice(1);
        // @ts-ignore
        if (prisma[pascalKey]) {
          clientKey = pascalKey;
        } else {
          console.log(`⚠️ No Prisma client model found for file "${file}" (raw="${rawModelName}", normalized="${clientKey}")`);
          continue;
        }
      }

      processedModels.add(clientKey);

      const filePath = path.join(backupDir, file);
      console.log(`📥 Importing ${file} -> prisma.${clientKey}`);

      let rawData: any;
      try {
        rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'), (_key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
          }
          return value;
        });
      } catch (err) {
        console.error(`❌ Failed to parse JSON file: ${file}`);
        console.error(err);
        continue;
      }

      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.log(`ℹ️ ${file} is empty or not an array. Skipping.`);
        continue;
      }

      const normalizedData = rawData.map((item: Record<string, any>) => {
        const newItem: Record<string, any> = {};

        for (const key in item) {
          let value = item[key];
          let newKey = key;

          if (FIELD_TRANSLATIONS[rawModelName]?.[key]) {
            newKey = FIELD_TRANSLATIONS[rawModelName][key];
          } else if (key.includes('_')) {
            newKey = toCamelCase(key);
          }

          if ((BOOLEAN_FIELDS.has(key) || BOOLEAN_FIELDS.has(newKey)) && (value === 0 || value === 1)) {
            value = value === 1;
          }

          newItem[newKey] = value;
        }

        return newItem;
      });

      const cleanData = normalizedData.filter((item) => {
        if (clientKey === 'property' && !item.organizationId) return false;
        if (clientKey === 'user' && !item.email) return false;
        return true;
      });

      if (cleanData.length === 0) {
        console.log(`⚠️ All rows filtered out for ${file}.`);
        continue;
      }

      try {
        // @ts-ignore dynamic Prisma model access
        const result = await prisma[clientKey].createMany({
          data: cleanData,
          skipDuplicates: true,
        });

        console.log(`✅ Imported ${result.count} row(s) into ${clientKey} from ${file}`);
      } catch (err: any) {
        console.error(`❌ Failed importing "${file}" into prisma.${clientKey}`);
        console.error(err?.message ?? err);
      }
    }
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1;');
  }
}

async function main() {
  try {
    await seedReferenceData();
    await importBackupIfPresent();
    await seedNavbarItemsIfMissing();
    await seedTestimonialsIfMissing();

    console.log('🎉 Seed completed successfully.');
  } catch (e: any) {
    console.error('❌ Seed failed:', e?.message ?? e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
