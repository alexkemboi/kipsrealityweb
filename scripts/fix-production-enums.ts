import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🚑 Starting Production Data Patch...");

    try {
        // 1. Relax the rules (Change to Text so we can edit)
        console.log("🔓 Relaxing constraints on utility_bills...");
        await prisma.$executeRawUnsafe(`
      ALTER TABLE utility_bills MODIFY COLUMN import_method VARCHAR(50);
    `);
        await prisma.$executeRawUnsafe(`
      ALTER TABLE utility_bills MODIFY COLUMN split_method VARCHAR(50);
    `);

        // 2. Migrate Data (Old Value -> New Value)
        console.log("🔄 Migrating Data values...");

        // Fix Import Method: MANUAL -> MANUAL_ENTRY
        const importFix = await prisma.$executeRawUnsafe(`
      UPDATE utility_bills 
      SET import_method = 'MANUAL_ENTRY' 
      WHERE import_method = 'MANUAL';
    `);
        console.log(`   - Updated ${importFix} rows (Import Method)`);

        // Fix Split Method: EQUAL_USAGE -> EQUAL
        const splitFix = await prisma.$executeRawUnsafe(`
      UPDATE utility_bills 
      SET split_method = 'EQUAL' 
      WHERE split_method = 'EQUAL_USAGE';
    `);
        console.log(`   - Updated ${splitFix} rows (Split Method)`);

        console.log("✅ Data is now compatible with new Schema.");

    } catch (error) {
        console.error("❌ Error during patch:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();