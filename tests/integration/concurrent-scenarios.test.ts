import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/lib/db";
import { ListingService } from "@/lib/listing-service";
import { AuditService } from "@/lib/audit-service";
import { ListingStatus } from "@/lib/listing-types";

// Compatibility helpers
type FnAny = (...args: any[]) => any;

async function callByArity<T>(
  fn: FnAny,
  args2: [any, any],
  args3: [any, any, any],
  args4: [any, any, any, any]
): Promise<T> {
  if (fn.length <= 2) return fn(...args2);
  if (fn.length === 3) return fn(...args3);
  return fn(...args4);
}

function pickListingId(result: any): string {
  return result?.id ?? result?.listingId ?? result?.listing?.id ?? "";
}

describe("Concurrent User Scenarios Integration Tests", () => {
  let listingService: ListingService;
  let auditService: AuditService;
  let testPropertyId: string;
  let testUnitIds: string[] = [];
  let testUserIds: string[] = [];

  beforeEach(async () => {
    listingService = new ListingService();
    auditService = new AuditService();

    // Create multiple test users (property managers)
    for (let i = 1; i <= 3; i++) {
      const testUser = await db.user.create({
        data: {
          email: `test-pm${i}@example.com`,
          firstName: `Test${i}`,
          lastName: "PropertyManager",
          role: "PROPERTY_MANAGER",
          emailVerified: new Date(),
        }
      });
      testUserIds.push(testUser.id);
    }

    // Create test property
    const testProperty = await db.property.create({
      data: {
        name: "Concurrent Test Property",
        address: "123 Concurrent St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        propertyManagerId: testUserIds[0],
        propertyType: "APARTMENT_COMPLEX"
      }
    });
    testPropertyId = testProperty.id;

    // Create multiple test units
    for (let i = 1; i <= 5; i++) {
      const testUnit = await db.unit.create({
        data: {
          unitNumber: `10${i}`,
          bedrooms: 2,
          bathrooms: 1,
          // rent: 1500 + (i * 100),
          propertyId: testPropertyId
        }
      });
      testUnitIds.push(testUnit.id);
    }
  });

  afterEach(async () => {
    // Clean up test data
    await db.listing.deleteMany({
      where: { unitId: { in: testUnitIds } }
    });
    await db.unit.deleteMany({
      where: { id: { in: testUnitIds } }
    });
    await db.property.deleteMany({
      where: { id: testPropertyId }
    });
    await db.user.deleteMany({
      where: { id: { in: testUserIds } }
    });
    testUnitIds = [];
    testUserIds = [];
  });

  describe("Concurrent Listing Creation", () => {
    it("should handle multiple users creating listings simultaneously", async () => {
      // Simulate multiple users creating listings for different units at the same time
      const concurrentCreations = testUnitIds.slice(0, 3).map((unitId, index) => 
        listingService.createListing(unitId, {
          title: `Concurrent Listing ${index + 1}`,
          description: `Created by user ${index + 1}`,
          price: 1500 + (index * 100)
        })
      );

      const results = await Promise.allSettled(concurrentCreations);

      // All should succeed since they're for different units
      const successfulCreations = results.filter(r => r.status === "fulfilled");
      expect(successfulCreations).toHaveLength(3);

      // Verify all listings were created
      const listings = await db.listing.findMany({
        where: { unitId: { in: testUnitIds.slice(0, 3) } }
      });
      expect(listings).toHaveLength(3);

      // Verify audit entries
      for (const unitId of testUnitIds.slice(0, 3)) {
        const auditEntries = await auditService.getListingHistory(unitId);
        expect(auditEntries.length).toBeGreaterThan(0);
        expect(auditEntries[0].action).toBe("LISTING_CREATED");
      }
    });

    it("should prevent race conditions when creating listings for the same unit", async () => {
      const unitId = testUnitIds[0];

      // Simulate multiple users trying to create listings for the same unit
      const concurrentCreations = Array(3).fill(null).map((_, index) => 
        listingService.createListing(unitId, {
          title: `Race Condition Listing ${index + 1}`,
          description: `Attempt ${index + 1}`,
          price: 1500
        })
      );

      const results = await Promise.allSettled(concurrentCreations);

      // Only one should succeed
      const successfulCreations = results.filter(r => r.status === "fulfilled");
      const failedCreations = results.filter(r => r.status === "rejected");

      expect(successfulCreations).toHaveLength(1);
      expect(failedCreations).toHaveLength(2);

      // Verify only one listing exists
      const listings = await db.listing.findMany({
        where: { unitId }
      });
      expect(listings).toHaveLength(1);
    });
  });

  describe("Concurrent Status Updates", () => {
    let testListingId: string;

    beforeEach(async () => {
      const listing = await listingService.createListing(testUnitIds[0], {
        title: "Concurrent Status Test",
        price: 1500
      });
      testListingId = listing.id;
    });

    it("should handle concurrent status updates gracefully", async () => {
      // Simulate multiple users updating status simultaneously
      const statusUpdates = [
        ListingStatus.SUSPENDED,
        ListingStatus.ACTIVE,
        ListingStatus.SUSPENDED
      ];

      const concurrentUpdates = statusUpdates.map(status => 
        listingService.updateListingStatus(testListingId, status)
      );

      const results = await Promise.allSettled(concurrentUpdates);

      // At least one should succeed
      const successfulUpdates = results.filter(r => r.status === "fulfilled");
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // Verify final state is consistent
      const finalListing = await db.listing.findUnique({
        where: { id: testListingId }
      });
      expect(finalListing).toBeDefined();
      expect([ListingStatus.SUSPENDED, ListingStatus.ACTIVE]).toContain(
        finalListing!.status as ListingStatus
      );

      // Verify audit trail captures changes
      const auditEntries = await auditService.getListingHistory(testUnitIds[0]);
      expect(auditEntries.length).toBeGreaterThan(1); // Creation + at least one status change
    });

    it("should maintain audit trail integrity during concurrent updates", async () => {
      // Perform multiple concurrent operations
      const operations = [
        () => listingService.updateListingStatus(testListingId, ListingStatus.SUSPENDED),
        () => listingService.updateListingStatus(testListingId, ListingStatus.ACTIVE),
        () => listingService.updateListingStatus(testListingId, ListingStatus.SUSPENDED)
      ];

      await Promise.allSettled(operations.map(op => op()));

      // Verify audit trail completeness
      const auditEntries = await auditService.getListingHistory(testUnitIds[0]);
      
      // Should have creation entry plus status changes
      expect(auditEntries.length).toBeGreaterThan(1);
      
      // Verify audit entries are properly ordered
      const timestamps = auditEntries.map(entry => entry.timestamp.getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => b - a); // Descending order
      expect(timestamps).toEqual(sortedTimestamps);

      // Verify no duplicate audit entries
      const uniqueEntries = new Set(auditEntries.map(entry => 
        `${entry.action}-${entry.timestamp.getTime()}`
      ));
      expect(uniqueEntries.size).toBe(auditEntries.length);
    });
  });

  describe("Concurrent Bulk Operations", () => {
    it("should handle overlapping bulk operations", async () => {
      // Create two overlapping sets of units
      const set1 = testUnitIds.slice(0, 3);
      const set2 = testUnitIds.slice(1, 4); // Overlaps with set1

      const bulkOp1 = listingService.bulkUpdateListings(
        set1.map(unitId => ({
          unitId,
          action: "LIST" as const,
          listingData: { title: "Bulk Op 1", price: 1600 }
        }))
      );

      const bulkOp2 = listingService.bulkUpdateListings(
        set2.map(unitId => ({
          unitId,
          action: "LIST" as const,
          listingData: { title: "Bulk Op 2", price: 1700 }
        }))
      );

      const [result1, result2] = await Promise.allSettled([bulkOp1, bulkOp2]);

      // Both operations should complete, but overlapping units should only be processed once
      expect(result1.status).toBe("fulfilled");
      expect(result2.status).toBe("fulfilled");

      if (result1.status === "fulfilled" && result2.status === "fulfilled") {
        const totalSuccessful = result1.value.summary.succeeded + result2.value.summary.succeeded;
        const totalFailed = result1.value.summary.failed + result2.value.summary.failed;
        
        // Total attempts should equal sum of both operations
        expect(totalSuccessful + totalFailed).toBe(6); // 3 + 3 units
        
        // But only 4 unique units should have listings (due to overlap)
        const allListings = await db.listing.findMany({
          where: { unitId: { in: testUnitIds.slice(0, 4) } }
        });
        expect(allListings.length).toBeLessThanOrEqual(4);
      }
    });

    it("should handle concurrent bulk operations on same units", async () => {
      const unitIds = testUnitIds.slice(0, 3);

      // First create listings
      await listingService.bulkUpdateListings(
        unitIds.map(unitId => ({
          unitId,
          action: "LIST" as const,
          listingData: { title: "Initial Listing", price: 1500 }
        }))
      );

      // Then perform concurrent bulk status updates
      const suspendOp = listingService.bulkUpdateListings(
        unitIds.map(unitId => ({
          unitId,
          action: "SUSPEND" as const
        }))
      );

      const activateOp = listingService.bulkUpdateListings(
        unitIds.map(unitId => ({
          unitId,
          action: "ACTIVATE" as const
        }))
      );

      const [suspendResult, activateResult] = await Promise.allSettled([suspendOp, activateOp]);

      // Both operations should complete
      expect(suspendResult.status).toBe("fulfilled");
      expect(activateResult.status).toBe("fulfilled");

      // Verify final states are consistent
      const finalListings = await db.listing.findMany({
        where: { unitId: { in: unitIds } }
      });

      finalListings.forEach(listing => {
        expect([ListingStatus.SUSPENDED, ListingStatus.ACTIVE]).toContain(
          listing.status as ListingStatus
        );
      });
    });
  });

  describe("Concurrent Cross-System Operations", () => {
    it("should handle concurrent listing and lease operations", async () => {
      const unitId = testUnitIds[0];

      // Simulate concurrent listing creation and lease activation
      const listingCreation = listingService.createListing(unitId, {
        title: "Concurrent Test Listing",
        price: 1500
      });

      const leaseCreation = db.lease.create({
        data: {
          unitId,
          tenantId: testUserIds[1],
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          monthlyRent: 1500,
          status: "ACTIVE"
        }
      });

      const [listingResult, leaseResult] = await Promise.allSettled([
        listingCreation,
        leaseCreation
      ]);

      // One should succeed, the other should fail due to business rules
      const successCount = [listingResult, leaseResult].filter(r => r.status === "fulfilled").length;
      expect(successCount).toBeLessThanOrEqual(1);

      // Verify data consistency
      const unit = await db.unit.findUnique({
        where: { id: unitId },
        include: {
          listing: true,
          lease: { where: { status: "ACTIVE" } }
        }
      });

      // Unit should not have both active listing and active lease
      const hasActiveListing = unit?.listing?.status === "ACTIVE";
      const hasActiveLease = unit?.lease && unit.lease.length > 0;
      
      expect(hasActiveListing && hasActiveLease).toBe(false);
    });

    it("should handle concurrent application submissions for same unit", async () => {
      const unitId = testUnitIds[0];

      // Create listing first
      await listingService.createListing(unitId, {
        title: "Application Test Listing",
        price: 1500
      });

      // Simulate multiple tenants applying simultaneously
      const applicationCreations = testUserIds.slice(0, 3).map((tenantId, index) => 
        db.tenantApplication.create({
          data: {
            unitId,
            tenantId,
            firstName: `Tenant${index + 1}`,
            lastName: "Applicant",
            email: `tenant${index + 1}@example.com`,
            phone: `555-012${index}`,
            status: "PENDING"
          }
        })
      );

      const results = await Promise.allSettled(applicationCreations);

      // All applications should be created successfully
      const successfulApplications = results.filter(r => r.status === "fulfilled");
      expect(successfulApplications).toHaveLength(3);

      // Verify all applications exist
      const applications = await db.tenantApplication.findMany({
        where: { unitId }
      });
      expect(applications).toHaveLength(3);

      // Verify applications are properly linked to the listing
      const unit = await db.unit.findUnique({
        where: { id: unitId },
        include: {
          listing: true,
          applications: true
        }
      });

      expect(unit?.listing).toBeDefined();
      expect(unit?.applications).toHaveLength(3);
    });
  });

  describe("Performance Under Concurrent Load", () => {
    it("should maintain performance with high concurrent operations", async () => {
      const startTime = Date.now();

      // Create many concurrent operations
      const operations = [];
      
      // Concurrent listing creations
      for (let i = 0; i < testUnitIds.length; i++) {
        operations.push(
          listingService.createListing(testUnitIds[i], {
            title: `Performance Test ${i}`,
            price: 1500 + i
          })
        );
      }

      // Concurrent status updates (will fail for units without listings, but that's expected)
      for (let i = 0; i < 10; i++) {
        operations.push(
          listingService.updateListingStatus("non-existent-id", ListingStatus.SUSPENDED)
            .catch(() => null) // Ignore expected failures
        );
      }

      // Concurrent bulk operations
      operations.push(
        listingService.bulkUpdateListings([
          { unitId: testUnitIds[0], action: "SUSPEND" as const }
        ]).catch(() => null)
      );

      await Promise.allSettled(operations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds

      // Verify data integrity after high load
      const listings = await db.listing.findMany({
        where: { unitId: { in: testUnitIds } }
      });

      // Should have created listings for all units
      expect(listings.length).toBe(testUnitIds.length);

      // Verify audit trail integrity
      for (const unitId of testUnitIds) {
        const auditEntries = await auditService.getListingHistory(unitId);
        expect(auditEntries.length).toBeGreaterThan(0);
      }
    });
  });
});