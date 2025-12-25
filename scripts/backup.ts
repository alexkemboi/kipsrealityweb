import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    // List of ACTUAL TABLE NAMES in your database (Check your DB or guess standard names)
    // Since we are using RAW SQL, these must match the DB, not the Schema Model names.
    // Based on your errors, you have a mix of CamelCase and SnakeCase tables.
    const tableNames = [
        'organizations', 'users', 'organization_users', 'vendors',
        'CategoryMarketplace', 'Location', 'ActionType', 'Plan', 'Feature', 'SidebarItem',
        'AboutUs', 'Applicant', 'Application', 'CTA', 'ContactMessage', 'HeroSection', 'Job',
        'Policy', 'Section', 'Testimonial', 'categories', 'services',
        'MaintenanceRequest', 'ListingStatus', 'PropertyType', 'ServiceType', 'Listing',
        'Property', 'ApartmentComplexDetail', 'HouseDetail', 'Unit', 'Appliance',
        'ServiceMarketplace', 'ListingImage', 'AdminAction', 'NavbarItem', 'Invite',
        'TenantApplication', 'Lease', 'invoice', 'lease_utility', 'payment', 'receipt',
        'utility', 'utility_reading', 'InvoiceItem', 'OccupancyHistory', 'payment_reversal',
        'LeaseAmendment', 'LeaseAuditLog', 'LeaseDocument', 'LeaseNotification',
        'LeaseRenewal', 'RentEscalation', 'PasswordResetToken',
        // Added DSS tables
        'DssDocument', 'DssNotaryRecord', 'DssParticipant', 'DssSignature', 'DssWorkflowStep', 'DssWorkflowTemplate'
    ];

    console.log(`📦 Starting RAW backup to: ${backupDir}`);

    for (const tableName of tableNames) {
        try {
            // Fetch everything as raw objects
            const data = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``) as unknown[];

            // We map the filename to the MODEL name (PascalCase) for the Seeder to find later
            // This is a heuristic mapping
            let modelName = tableName;
            if (tableName === 'organizations') modelName = 'Organization';
            if (tableName === 'users') modelName = 'User';
            if (tableName === 'organization_users') modelName = 'OrganizationUser';
            // ... add other mappings if needed, or rename file manually later if seed fails

            const filePath = path.join(backupDir, `${modelName}.json`);

            const jsonString = JSON.stringify(data, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            , 2);

            fs.writeFileSync(filePath, jsonString);
            console.log(`✅ Exported ${data.length} records from ${tableName}`);
        } catch (error) {
            // Ignore "Table doesn't exist" errors, log others
            const err = error as { code?: string; meta?: { message?: string }; message?: string };
            if (err.code !== 'P2010') {
                 console.warn(`⚠️  Could not export ${tableName}: ${err.meta?.message || err.message}`);
            } else {
                 // Try CamelCase variant if SnakeCase failed (or vice versa)
                 // This handles the "Is it 'User' or 'users'?" ambiguity
                 try {
                     const altName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
                     if (altName !== tableName) {
                        const data = await prisma.$queryRawUnsafe(`SELECT * FROM \`${altName}\``) as unknown[];
                        const filePath = path.join(backupDir, `${altName}.json`);
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                        console.log(`✅ Exported ${data.length} records from ${altName} (Retry)`);
                     }
                 } catch (e) {}
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
