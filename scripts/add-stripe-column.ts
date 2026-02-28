import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addColumn() {
  console.log('Adding stripeCustomerId column to users table...');
  
  try {
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN stripeCustomerId VARCHAR(255) NULL`;
    console.log('Column added successfully!');
  } catch (e: any) {
    if (e.message.includes('Duplicate column name')) {
      console.log('Column already exists');
    } else {
      console.log('Error:', e.message);
    }
  }
}

addColumn()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
