import { prisma } from "@/lib/db";

async function createTestLease() {
  try {
    console.log("🔍 Fetching test data...");

    // Use the provided property ID
    const propertyId = "103a2e7f-2563-49ed-9344-4fa75b813269";
    
    // Get the property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      console.error(
        "❌ Property not found with ID: " + propertyId
      );
      process.exit(1);
    }
    console.log(`✓ Property: ${property.address} (${property.id})`);

    // Prefer unit number 5 for this test. If it doesn't exist, create it.
    const preferredUnitNumber = "5";
    let unit = await prisma.unit.findFirst({
      where: { propertyId: property.id, unitNumber: preferredUnitNumber },
    });

    if (!unit) {
      console.log(`ℹ️ Unit ${preferredUnitNumber} not found; creating it.`);
      unit = await prisma.unit.create({
        data: {
          propertyId: property.id,
          unitNumber: preferredUnitNumber,
          rentAmount: 1500,
        },
      });
      console.log(`✓ Created Unit: ${unit.unitNumber} (${unit.id})`);
    } else {
      console.log(`✓ Unit: ${unit.unitNumber} (${unit.id})`);
    }

    // Get a user (property manager or any user)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("❌ No user found. Please create a user first.");
      process.exit(1);
    }
    console.log(`✓ User: ${user.email} (${user.id})`);

    // Create a tenant application (required for lease)
    const application = await prisma.tenantapplication.create({
      data: {
        fullName: "Test Tenant 2",
        email: "test-tenant-2@example.com",
        phone: "555-0002",
        dob: new Date("1990-01-15"),
        leaseType: "Fixed Term",
        occupancyType: "Residential",
        moveInDate: new Date("2025-12-01"),
        leaseDuration: "12 months",
        occupants: 2,
        propertyId: property.id,
        unitId: unit.id,
        status: "APPROVED" as any,
      },
    });
    console.log(`✓ Tenant Application created: ${application.id}`);

    // Create the lease
    const lease = await prisma.lease.create({
      data: {
        applicationId: application.id,
        propertyId: property.id,
        unitId: unit.id,
        startDate: new Date("2025-12-01"),
        endDate: new Date("2026-11-30"),
        leaseTerm: "12 months",
        rentAmount: 1500,
        paymentDueDay: 1,
        paymentFrequency: "MONTHLY",
        securityDeposit: 1500,
        lateFeeFlat: 50,
        lateFeeDaily: 5,
        gracePeriodDays: 5,
        landlordResponsibilities: "Maintain property structure and utilities",
        tenantResponsibilities: "Keep property clean and report damages",
        tenantPaysElectric: true,
        tenantPaysWater: false,
        tenantPaysTrash: false,
        tenantPaysInternet: false,
        usageType: "Residential",
        earlyTerminationFee: 300,
        terminationNoticeDays: 30,
        leaseStatus: "DRAFT",
      },
    });

    console.log("\n✅ Test lease created successfully!");
    console.log(`\nLease Details:
  ID: ${lease.id}
  Property: ${property.address}
  Unit: ${unit.unitNumber}
  Rent Amount: $${lease.rentAmount}/month
  Start Date: ${lease.startDate.toISOString().split("T")[0]}
  End Date: ${lease.endDate.toISOString().split("T")[0]}
  Status: ${lease.leaseStatus}
\n📋 Use this lease ID to send tenant invites:
  Lease ID: ${lease.id}`);
  } catch (error) {
    console.error("❌ Error creating test lease:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestLease();
