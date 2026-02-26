import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDataIssues() {
  console.log('=== Checking Data Issues for Migration ===\n');

  // 1. Check for AGENT values in any role-related tables
  console.log('\n1. Checking for AGENT role values...');
  
  // Check multiple tables that might have role columns
  const tablesToCheck = ['User_Organization_Role', 'Invite', 'users', 'Organization', 'SidebarItem'];
  
  for (const table of tablesToCheck) {
    try {
      // @ts-ignore
      const result = await prisma.$queryRaw`SELECT * FROM ${prisma.raw(table)} LIMIT 5`;
      console.log(`   ${table}:`, JSON.stringify(result, null, 2).substring(0, 500));
    } catch (e: any) {
      console.log(`   ${table}: Error - ${e.message?.substring(0, 100)}`);
    }
  }

  try {
    const inviteRoles = await prisma.$queryRaw`SELECT DISTINCT role FROM Invite`;
    console.log('   Invite roles:', inviteRoles);
  } catch (e) {
    console.log('   Table Invite may not exist or has no data');
  }

  // 2. Check for duplicate invoice_id in MaintenanceRequest
  console.log('\n2. Checking MaintenanceRequest for duplicate invoice_id...');
  try {
    const dupInvoices = await prisma.$queryRaw`
      SELECT invoice_id, COUNT(*) as count 
      FROM MaintenanceRequest 
      WHERE invoice_id IS NOT NULL 
      GROUP BY invoice_id 
      HAVING COUNT(*) > 1
    `;
    console.log('   Duplicate invoice_ids:', dupInvoices);
  } catch (e) {
    console.log('   Table MaintenanceRequest may not exist or has no data');
  }

  // 3. Check for duplicate journal_entry_id in MaintenanceRequest
  console.log('\n3. Checking MaintenanceRequest for duplicate journal_entry_id...');
  try {
    const dupJournal = await prisma.$queryRaw`
      SELECT journal_entry_id, COUNT(*) as count 
      FROM MaintenanceRequest 
      WHERE journal_entry_id IS NOT NULL 
      GROUP BY journal_entry_id 
      HAVING COUNT(*) > 1
    `;
    console.log('   Duplicate journal_entry_ids:', dupJournal);
  } catch (e) {
    console.log('   Error:', e.message);
  }

  // 4. Check for duplicate (id, organization_id) in dss_documents
  console.log('\n4. Checking dss_documents for duplicate (id, organization_id)...');
  try {
    const dupDocs = await prisma.$queryRaw`
      SELECT id, organization_id, COUNT(*) as count 
      FROM dss_documents 
      GROUP BY id, organization_id 
      HAVING COUNT(*) > 1
    `;
    console.log('   Duplicate dss_documents:', dupDocs);
  } catch (e) {
    console.log('   Table dss_documents may not exist or has no data');
  }

  // 5. Check for duplicate (document_id, email, role) in dss_participants
  console.log('\n5. Checking dss_participants for duplicate (document_id, email, role)...');
  try {
    const dupParts = await prisma.$queryRaw`
      SELECT document_id, email, role, COUNT(*) as count 
      FROM dss_participants 
      GROUP BY document_id, email, role 
      HAVING COUNT(*) > 1
    `;
    console.log('   Duplicate dss_participants:', dupParts);
  } catch (e) {
    console.log('   Table dss_participants may not exist or has no data');
  }

  console.log('\n=== Check Complete ===');
}

checkDataIssues()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
