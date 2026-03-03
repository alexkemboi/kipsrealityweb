import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test
const envPath = path.resolve('.env.test');
dotenv.config({ path: envPath });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  console.log('=== Verifying E2E Seed Data ===');
  
  // Check users
  const users = await prisma.user.findMany();
  console.log(`Users: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.email} (${u.id}) emailVerified: ${u.emailVerified}`));
  
  // Check organization
  const orgs = await prisma.organization.findMany();
  console.log(`Organizations: ${orgs.length}`);
  
  // Check organization users
  const orgUsers = await prisma.organizationUser.findMany({
    include: { user: true, organization: true }
  });
  console.log(`Organization Users: ${orgUsers.length}`);
  orgUsers.forEach(ou => console.log(`  - ${ou.user.email} -> ${ou.organization.name} (${ou.role})`));
  
  // Check properties
  const properties = await prisma.property.findMany({
    include: { manager: { include: { user: true } }, organization: true }
  });
  console.log(`Properties: ${properties.length}`);
  properties.forEach(p => console.log(`  - ${p.name} manager: ${p.manager?.user?.email}, org: ${p.organization?.name}`));
  
  // Check leases
  const leases = await prisma.lease.findMany({
    include: {
      tenant: true,
      property: { include: { manager: { include: { user: true } } } },
      unit: true
    }
  });
  console.log(`Leases: ${leases.length}`);
  leases.forEach(l => {
    console.log(`  - Lease ${l.id}`);
    console.log(`    Tenant: ${l.tenant?.email}`);
    console.log(`    Property: ${l.property?.name}`);
    console.log(`    Property Manager User: ${l.property?.manager?.user?.email}`);
    console.log(`    Unit: ${l.unit?.unitNumber}`);
  });
  
  // Check /api/tenants query simulation
  console.log('\n=== Simulating /api/tenants query ===');
  const allLeases = await prisma.lease.findMany({
    include: {
      tenant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
      invoices: { include: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  
  console.log(`Total leases in system: ${allLeases.length}`);
  
  // Simulate /api/lease query with manager filter
  console.log('\n=== Simulating /api/lease query (manager filtered) ===');
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@test.com' }
  });
  
  if (manager) {
    const filteredLeases = await prisma.lease.findMany({
      where: {
        property: {
          manager: {
            userId: manager.id,
          },
        },
      },
      include: {
        tenant: true,
        property: { include: { manager: { include: { user: true } } } },
      },
    });
    console.log(`Leases visible to manager ${manager.email}: ${filteredLeases.length}`);
  }
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});