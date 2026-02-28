import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInvite() {
  console.log('=== Checking Invite table ===\n');
  
  // Check Invite table directly using raw SQL
  try {
    const results = await prisma.$queryRawUnsafe<any[]>('SELECT id, email, role FROM Invite LIMIT 30');
    console.log('Invite data:');
    results.forEach((row, idx) => {
      console.log(`  Row ${idx + 1}: id=${row.id}, email=${row.email}, role=${row.role}`);
    });
  } catch (e: any) {
    console.log('Error:', e.message);
  }
  
  // Check for all unique roles
  try {
    const roles = await prisma.$queryRawUnsafe<any[]>('SELECT DISTINCT role FROM Invite');
    console.log('\nUnique roles in Invite:', roles);
  } catch (e: any) {
    console.log('\nError fetching roles:', e.message);
  }
  
  // Check row 16
  try {
    const row16 = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM Invite WHERE id = 16');
    console.log('\nRow 16:', row16);
  } catch (e: any) {
    console.log('\nError fetching row 16:', e.message);
  }
}

checkInvite()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
