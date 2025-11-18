const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 6;

  for (const property of properties) {
    // Get all units for this property
    const units = await prisma.unit.findMany({ where: { propertyId: property.id } });
    const totalUnits = units.length;

    // Count occupied units by scanning tenant applications with status Approved
    const approvedApplications = await prisma.tenantapplication.findMany({
      where: {
        propertyId: property.id,
        status: 'APPROVED',
        unitId: { not: null },
      },
    });
    const occupiedUnits = approvedApplications.length;

    // Calculate occupancy rate
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Insert into OccupancyHistory
    await prisma.occupancyHistory.create({
      data: {
        id: `${property.id}-${year}-${month}`,
        propertyId: property.id,
        year,
        month,
        occupancyRate,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });