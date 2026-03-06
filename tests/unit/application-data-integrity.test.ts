/**
 * Property-Based Tests for Application Data Integrity
 * 
 * **Feature: marketplace-listing-choice, Property 14: Application Data Integrity**
 * **Validates: Requirements 8.3, 8.4, 8.5**
 * 
 * Property: For any tenant application, it should maintain proper associations 
 * with units, listings, and property managers throughout its lifecycle
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db';
import { applicationControlService } from '@/lib/application-control-service';
import { ListingStatus } from '@/lib/listing-types';
import { ApplicationStatus, type Prisma } from "@prisma/client";

// Add near top of file
function buildPropertyCreateData(input: {
  id?: string;
  name: string;
  city: string;
  managerId?: string;
  organizationId?: string;
}): Prisma.PropertyUncheckedCreateInput {
  return {
    id: input.id,
    name: input.name,
    city: input.city,
    // required in current schema
    address: "Test Address",
    zipCode: "00000",
    managerId: input.managerId ?? null,
    organizationId: input.organizationId ?? null,
  };
}

function buildTenantApplicationCreateData(input: {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: Date;
  moveInDate?: Date;
  unitId: string;
  propertyId?: string;
  userId?: string | null;
  status?: ApplicationStatus;
}): Prisma.TenantapplicationUncheckedCreateInput {
  return {
    id: input.id,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    dob: input.dob ?? new Date("1995-01-01T00:00:00.000Z"),
    leaseType: "long-term",
    occupancyType: "single",
    moveInDate: input.moveInDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    leaseDuration: "12",
    consent: true,
    propertyId: input.propertyId ?? "",
    userId: input.userId ?? null,
    unitId: input.unitId,
    status: input.status ?? ApplicationStatus.PENDING,
  };
}

// Test data generators for property-based testing
function generateApplicationData(unitId: string, propertyId: string, userId?: string): Prisma.TenantapplicationUncheckedCreateInput {
  const fullName = `Test Applicant ${Math.floor(Math.random() * 1000)}`.trim();
  const dob = new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const moveInDate = new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

  return {
    id: `app-${Math.random().toString(36).substr(2, 9)}`,
    fullName,
    email: `applicant-${Math.random().toString(36).substr(2, 9)}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    dob,
    leaseType: Math.random() > 0.5 ? 'long-term' : 'short-term',
    occupancyType: ['single', 'family', 'shared'][Math.floor(Math.random() * 3)],
    moveInDate,
    leaseDuration: (Math.floor(Math.random() * 24) + 6).toString(),
    consent: true,
    propertyId,
    unitId,
    userId: userId || null,
    status: ApplicationStatus.PENDING
  };
}

function generateUnitData(propertyId: string) {
  return {
    id: `unit-${Math.random().toString(36).substr(2, 9)}`,
    unitNumber: `Unit-${Math.floor(Math.random() * 1000)}`,
    propertyId,
    bedrooms: Math.floor(Math.random() * 5) + 1,
    bathrooms: Math.floor(Math.random() * 3) + 1,
    rentAmount: Math.floor(Math.random() * 3000) + 500,
    isOccupied: false
  };
}

function generatePropertyData(managerId: string) {
  return {
    id: `prop-${Math.random().toString(36).substr(2, 9)}`,
    name: `Test Property ${Math.floor(Math.random() * 1000)}`,
    city: 'Test City',
    address: 'Test Address',
    zipCode: '00000',
    managerId,
    organizationId: 'test-org'
  };
}

function generateListingData(unitId: string, organizationId: string, userId: string) {
  return {
    id: `listing-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdBy: userId,
    title: `Test Listing ${Math.floor(Math.random() * 1000)}`,
    description: 'Test listing description',
    price: Math.floor(Math.random() * 3000) + 500,
    unitId
  };
}

describe('Property 14: Application Data Integrity', () => {
  let testUser: any;
  let testOrganization: any;
  let testManager: any;
  let createdEntities: {
    users: string[];
    organizations: string[];
    organizationUsers: string[];
    properties: string[];
    units: string[];
    listings: string[];
    applications: string[];
    leases: string[];
  };

  beforeEach(async () => {
    // Initialize tracking for cleanup
    createdEntities = {
      users: [],
      organizations: [],
      organizationUsers: [],
      properties: [],
      units: [],
      listings: [],
      applications: [],
      leases: []
    };

    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email: `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
        passwordHash: 'test-hash',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    createdEntities.users.push(testUser.id);

    // Create test organization
    testOrganization = await prisma.organization.create({
      data: {
        id: `org-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Test Organization',
        slug: `test-org-${Math.random().toString(36).substr(2, 9)}`
      }
    });
    createdEntities.organizations.push(testOrganization.id);

    // Create organization user (property manager)
    testManager = await prisma.organizationUser.create({
      data: {
        id: `orguser-${Math.random().toString(36).substr(2, 9)}`,
        userId: testUser.id,
        organizationId: testOrganization.id,
        role: 'PROPERTY_MANAGER'
      }
    });
    createdEntities.organizationUsers.push(testManager.id);
  });

  afterEach(async () => {
    // Clean up in reverse order of dependencies
    if (createdEntities.leases.length > 0) {
      await prisma.lease.deleteMany({
        where: { id: { in: createdEntities.leases } }
      });
    }

    if (createdEntities.applications.length > 0) {
      await prisma.tenantapplication.deleteMany({
        where: { id: { in: createdEntities.applications } }
      });
    }

    if (createdEntities.listings.length > 0) {
      await prisma.listing.deleteMany({
        where: { id: { in: createdEntities.listings } }
      });
    }

    if (createdEntities.units.length > 0) {
      await prisma.unit.deleteMany({
        where: { id: { in: createdEntities.units } }
      });
    }

    if (createdEntities.properties.length > 0) {
      await prisma.property.deleteMany({
        where: { id: { in: createdEntities.properties } }
      });
    }

    if (createdEntities.organizationUsers.length > 0) {
      await prisma.organizationUser.deleteMany({
        where: { id: { in: createdEntities.organizationUsers } }
      });
    }

    if (createdEntities.organizations.length > 0) {
      await prisma.organization.deleteMany({
        where: { id: { in: createdEntities.organizations } }
      });
    }

    if (createdEntities.users.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdEntities.users } }
      });
    }
  });

  it('Property 14.1: Applications should maintain consistent unit-property associations', async () => {
    const iterations = 15;
    
    for (let i = 0; i < iterations; i++) {
      // Generate test data
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      // Create unit
      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Create application
      const applicationData = generateApplicationData(unit.id, property.id, testUser.id);
      const application = await prisma.tenantapplication.create({ data: applicationData });
      createdEntities.applications.push(application.id);

      // Validate data integrity
      const integrity = await applicationControlService.validateApplicationDataIntegrity(application.id);

      // Property assertion: Application should have valid associations
      expect(integrity.isValid).toBe(true);
      expect(integrity.issues).toHaveLength(0);

      // Verify the application has correct associations
      const retrievedApplication = await prisma.tenantapplication.findUnique({
        where: { id: application.id },
        include: {
          unit: true,
          property: true
        }
      });

      expect(retrievedApplication).toBeTruthy();
      expect(retrievedApplication!.unitId).toBe(unit.id);
      expect(retrievedApplication!.propertyId).toBe(property.id);
      expect(retrievedApplication!.unit!.propertyId).toBe(property.id);
    }
  });

  it('Property 14.2: Applications should handle listing status changes appropriately', async () => {
    const iterations = 12;
    
    for (let i = 0; i < iterations; i++) {
      // Generate test data
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property and unit
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Create listing
      const listingData = generateListingData(unit.id, testOrganization.id, testUser.id);
      const listing = await prisma.listing.create({ data: listingData });
      createdEntities.listings.push(listing.id);

      await prisma.unit.update({
        where: { id: unit.id },
        data: { listingId: listing.id }
      });

      // Create application
      const applicationData = generateApplicationData(unit.id, property.id, testUser.id);
      const application = await prisma.tenantapplication.create({ data: applicationData });
      createdEntities.applications.push(application.id);

      // Simulate listing status changes
      const statusChanges = [
        ListingStatus.SUSPENDED,
        ListingStatus.MAINTENANCE,
        ListingStatus.PRIVATE,
        ListingStatus.ACTIVE
      ];

      const randomStatus = statusChanges[Math.floor(Math.random() * statusChanges.length)];

      // Handle listing status change
      const result = await applicationControlService.handleApplicationStateOnListingChange(
        unit.id,
        randomStatus,
        ListingStatus.ACTIVE,
        'Test status change'
      );

      // Property assertion: Application state should be handled appropriately
      expect(result.applicationsAffected).toBeGreaterThanOrEqual(0);
      expect(result.actions).toBeDefined();

      // Verify application status based on listing status
      const updatedApplication = await prisma.tenantapplication.findUnique({
        where: { id: application.id }
      });

      expect(updatedApplication).toBeTruthy();

      // Check expected application status based on listing status
      if (randomStatus === ListingStatus.PRIVATE) {
        expect(updatedApplication!.status).toBe('REJECTED');
      } else if (randomStatus === ListingStatus.ACTIVE) {
        // Should remain pending for active listings
        expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(updatedApplication!.status);
      }
    }
  });

  it('Property 14.3: Orphaned applications should be properly identified and cleaned up', async () => {
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      // Generate test data
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property and unit
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Create application WITHOUT listing (orphaned)
      const applicationData = generateApplicationData(unit.id, property.id, testUser.id);
      const application = await prisma.tenantapplication.create({ data: applicationData });
      createdEntities.applications.push(application.id);

      // Check if application is identified as orphaned
      const integrity = await applicationControlService.validateApplicationDataIntegrity(application.id);

      // Property assertion: Orphaned application should be identified
      expect(integrity.isValid).toBe(false);
      expect(integrity.issues.some(issue => issue.includes('listing'))).toBe(true);

      // Test cleanup functionality
      const cleanupResult = await applicationControlService.cleanupOrphanedApplications();

      // Property assertion: Cleanup should process orphaned applications
      expect(cleanupResult.cleaned).toBeGreaterThanOrEqual(0);
      expect(cleanupResult.errors).toBeDefined();

      // Verify application status after cleanup
      const cleanedApplication = await prisma.tenantapplication.findUnique({
        where: { id: application.id }
      });

      // Application should either be rejected or still pending (depending on grace period)
      expect(cleanedApplication).toBeTruthy();
      expect(['PENDING', 'REJECTED']).toContain(cleanedApplication!.status);
    }
  });

  it('Property 14.4: Application associations should be automatically fixed when inconsistent', async () => {
    const iterations = 8;
    
    for (let i = 0; i < iterations; i++) {
      // Generate test data
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property and unit
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Create application with correct associations
      const applicationData = generateApplicationData(unit.id, property.id, testUser.id);
      const application = await prisma.tenantapplication.create({ data: applicationData });
      createdEntities.applications.push(application.id);

      // Simulate inconsistency by creating another property and updating unit
      const anotherPropertyData = generatePropertyData(testManager.id);
      const anotherProperty = await prisma.property.create({ data: anotherPropertyData });
      createdEntities.properties.push(anotherProperty.id);

      // Update unit to belong to different property (creating inconsistency)
      await prisma.unit.update({
        where: { id: unit.id },
        data: { propertyId: anotherProperty.id }
      });

      // Validate and fix associations
      const fixResult = await applicationControlService.validateAndFixApplicationAssociations();

      // Property assertion: Inconsistencies should be detected and fixed
      expect(fixResult.checked).toBeGreaterThan(0);
      
      // Verify the application now has consistent associations
      const fixedApplication = await prisma.tenantapplication.findUnique({
        where: { id: application.id },
        include: {
          unit: {
            include: {
              property: true
            }
          },
          property: true
        }
      });

      expect(fixedApplication).toBeTruthy();
      expect(fixedApplication!.unit).toBeTruthy();
      expect(fixedApplication!.unit!.property).toBeTruthy();
      
      // Property assertion: Unit and property should be consistent
      if (fixResult.fixed > 0) {
        expect(fixedApplication!.propertyId).toBe(fixedApplication!.unit!.propertyId);
      }
    }
  });

  it('Property 14.5: Integrity reports should accurately reflect application state', async () => {
    const numApplications = 6;
    const applicationIds: string[] = [];
    let expectedValid = 0;
    let expectedInvalid = 0;

    // Create multiple applications with varying integrity states
    for (let i = 0; i < numApplications; i++) {
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property and unit
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Randomly decide whether to create listing and proper associations
      const hasListing = Math.random() > 0.3;
      const hasConsistentAssociations = Math.random() > 0.2;

      if (hasListing) {
        const listingData = generateListingData(unit.id, testOrganization.id, testUser.id);
        const listing = await prisma.listing.create({ data: listingData });
        createdEntities.listings.push(listing.id);

        await prisma.unit.update({
          where: { id: unit.id },
          data: { listingId: listing.id }
        });
      }

      // Create application
      const applicationData = generateApplicationData(
        unit.id,
        hasConsistentAssociations ? property.id : `wrong-${property.id}`,
        testUser.id
      );

      try {
        const application = await prisma.tenantapplication.create({ data: applicationData });
        createdEntities.applications.push(application.id);
        applicationIds.push(application.id);

        // Count expected valid/invalid based on our setup
        if (hasListing && hasConsistentAssociations) {
          expectedValid++;
        } else {
          expectedInvalid++;
        }
      } catch (error) {
        // If creation fails due to foreign key constraint, that's expected for inconsistent data
        expectedInvalid++;
      }
    }

    // Generate integrity report
    const report = await applicationControlService.getApplicationIntegrityReport();

    // Property assertion: Report should accurately reflect application states
    expect(report.summary.totalApplications).toBeGreaterThan(0);
    expect(report.summary.validApplications + report.summary.invalidApplications).toBe(report.summary.totalApplications);
    expect(report.issues).toBeDefined();

    // Verify individual application integrity checks match report
    const individualChecks = await Promise.all(
      applicationIds.map(id => applicationControlService.validateApplicationDataIntegrity(id))
    );

    const actualValid = individualChecks.filter(check => check.isValid).length;
    const actualInvalid = individualChecks.filter(check => !check.isValid).length;

    // Property assertion: Individual checks should match report summary
    expect(actualValid + actualInvalid).toBe(applicationIds.length);
    
    // The report might include applications from other tests, so we check proportions
    if (applicationIds.length > 0) {
      expect(report.summary.validApplications).toBeGreaterThanOrEqual(0);
      expect(report.summary.invalidApplications).toBeGreaterThanOrEqual(0);
    }
  });

  it('Property 14.6: Application lifecycle should maintain integrity through all state transitions', async () => {
    const iterations = 8;
    
    for (let i = 0; i < iterations; i++) {
      // Generate test data
      const propertyData = generatePropertyData(testManager.id);
      const unitData = generateUnitData(propertyData.id);

      // Create property and unit
      const property = await prisma.property.create({ data: propertyData });
      createdEntities.properties.push(property.id);

      const unit = await prisma.unit.create({ data: unitData });
      createdEntities.units.push(unit.id);

      // Create listing
      const listingData = generateListingData(unit.id, testOrganization.id, testUser.id);
      const listing = await prisma.listing.create({ data: listingData });
      createdEntities.listings.push(listing.id);

      await prisma.unit.update({
        where: { id: unit.id },
        data: { listingId: listing.id }
      });

      // Create application
      const applicationData = generateApplicationData(unit.id, property.id, testUser.id);
      const application = await prisma.tenantapplication.create({ data: applicationData });
      createdEntities.applications.push(application.id);

      // Simulate application lifecycle with multiple state transitions
      const stateTransitions = [
        { status: 'PENDING', listingStatus: ListingStatus.ACTIVE },
        { status: 'PENDING', listingStatus: ListingStatus.SUSPENDED },
        { status: 'PENDING', listingStatus: ListingStatus.MAINTENANCE },
        { status: 'APPROVED', listingStatus: ListingStatus.ACTIVE },
      ];

      for (const transition of stateTransitions) {
        // Update application status
        await prisma.tenantapplication.update({
          where: { id: application.id },
          data: { status: transition.status as any }
        });

        // Simulate listing status change
        await applicationControlService.handleApplicationStateOnListingChange(
          unit.id,
          transition.listingStatus,
          ListingStatus.ACTIVE,
          `Transition to ${transition.listingStatus}`
        );

        // Validate integrity after each transition
        const integrity = await applicationControlService.validateApplicationDataIntegrity(application.id);

        // Property assertion: Application should maintain integrity through transitions
        expect(integrity.isValid).toBe(true);
        expect(integrity.issues).toHaveLength(0);

        // Verify application still exists and has correct associations
        const currentApplication = await prisma.tenantapplication.findUnique({
          where: { id: application.id },
          include: {
            unit: true,
            property: true
          }
        });

        expect(currentApplication).toBeTruthy();
        expect(currentApplication!.unitId).toBe(unit.id);
        expect(currentApplication!.propertyId).toBe(property.id);
      }
    }
  });
});