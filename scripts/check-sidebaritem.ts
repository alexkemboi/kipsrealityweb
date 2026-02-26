import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSidebarItem() {
  console.log('=== Checking SidebarItem table ===\n');
  
  // Check SidebarItem table directly using raw SQL
  try {
    const results = await prisma.$queryRawUnsafe<any[]>('SELECT id, label, role FROM SidebarItem LIMIT 30');
    console.log('SidebarItem data:');
    results.forEach((row, idx) => {
      console.log(`  Row ${idx + 1}: id=${row.id}, label=${row.label}, role=${row.role}`);
    });
  } catch (e: any) {
    console.log('Error:', e.message);
  }
  
  // Also check the exact row 16
  try {
    const row16 = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM SidebarItem WHERE id = 16');
    console.log('\nRow 16:', row16);
  } catch (e: any) {
    console.log('\nError fetching row 16:', e.message);
  }
}

checkSidebarItem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
