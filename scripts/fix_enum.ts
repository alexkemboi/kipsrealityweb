import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🛠️  Starting Emergency Enum Fix...");

    try {
        // 1. Temporarily relax the column rules (Change ENUM to VARCHAR)
        console.log("1️⃣  Converting column to Text (VARCHAR)...");
        await prisma.$executeRawUnsafe(`
      ALTER TABLE payment MODIFY COLUMN method VARCHAR(50);
    `);

        // 2. Fix the data (Now it works because text accepts anything)
        console.log("2️⃣  Updating 'CREDIT CARD' to 'CREDIT_CARD'...");
        const result = await prisma.$executeRawUnsafe(`
      UPDATE payment 
      SET method = 'CREDIT_CARD' 
      WHERE method = 'CREDIT CARD';
    `);

        console.log(`✅ Fixed ${result} records.`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();