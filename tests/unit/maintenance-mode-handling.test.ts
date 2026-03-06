/**
 * Property-Based Tests for Maintenance Mode Handling
 * 
 * **Feature: marketplace-listing-choice, Property 11: Maintenance Mode Handling**
 * **Validates: Requirements 7.3**
 * 
 * For any unit under maintenance, temporary marketplace removal should be possible with restoration capability
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/db';
import { listingService } from '@/lib/listing-service';
import { maintenanceListingIntegration } from '@/lib/maintenance-listing-integration';
import { ListingStatus, MaintenanceModeConfig } from '@/lib/listing-types';
import { MaintenanceRequest_status, Priority, RequestCategory } from '@prisma/client';

// Test data generators
const maintenanceReasonGen = fc.oneof(
  fc.constant('Plumbing repair'),
  fc.constant('Electrical work'),
  fc.constant('HVAC maintenance'),
  fc.constant('Flooring replacement'),
  fc.constant('Painting and touch-ups'),
  fc.constant('Appliance repair'),
  fc.constant('Emergency repair'),
  fc.constant('Routine maintenance')
);

const priorityGen = fc.oneof(
  fc.constant(Priority.LOW),
  fc.constant(Priority.NORMAL),
  fc.constant(Priority.HIGH),
  fc.constant(Priority.EMERGENCY)
);

const maintenanceConfigGen = fc.record({
  reason: maintenanceReasonGen,
  estimatedDays: fc.integer({ min: 1, max: 30 }),
  notifyTenants: fc.boolean(),
  autoRestore: fc.boolean()
});

// Test setup helpers
async function createTestOrganization() {
  return await prisma.organization.create({
    data: {
      name: `Test Org ${Date.now()}`,
      slug: `test-org-${Date.now()}`,
      isActive: true
    }
  });
}

async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE'
    }
  });
}

async function createTestProperty(organizationId: string) {
  return await prisma.property.create({
    data: {
      organizationId,
      name: `Test Property ${Date.now()}`,
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      propertyType: 'APARTMENT_COMPLEX'
    }
  });
}

async function createTestUnit(propertyId: string) {
  return await prisma.unit.create({
    data: {
      propertyId,
      unitNumber: `Unit-${Date.now()}`,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 1000,
      rentAmount: 1500
    }
  });
}

async function createTestListing(unitId: string, organizationId: string, userId: string) {
  const result = await listingService.createListing(
    unitId,
    {
      unitId,
      title: 'Test Listing',
      description: 'Test listing description',
      price: 1500
    },
    userId,
    organizationId
  );
  
  if (!result.success) {
    throw new Error(`Failed to create listing: ${result.message}`);
  }
  
  return result.data.listingId;
}

async function createMaintenanceRequest(
  organizationId: string,
  propertyId: string,
  unitId: string,
  requestedById: string,
  priority: Priority = Priority.NORMAL
) {
  return await prisma.maintenanceRequest.create({
    data: {
      organizationId,
      propertyId,
      unitId,
      requestedById,
      title: 'Test Maintenance Request',
      description: 'Test maintenance description',
      priority,
      status: MaintenanceRequest_status.OPEN,
      category: RequestCategory.ROUTINE
    }
  });
}

// Cleanup helper
async function cleanupTestData(organizationId: string) {
  try {
    // Delete in dependency order
    await prisma.maintenanceRequest.deleteMany({ where: { organizationId } });
    await prisma.listing.deleteMany({ where: { organizationId } });
    await prisma.unit.deleteMany({ 
      where: { property: { organizationId } }
    });
    await prisma.property.deleteMany({ where: { organizationId } });
    await prisma.organizationUser.deleteMany({ where: { organizationId } });
    await prisma.organization.delete({ where: { id: organizationId } });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('Maintenance Mode Handling Property Tests', () => {
  let testOrganization: any;
  let testUser: any;
  let testProperty: any;

  beforeEach(async () => {
    testOrganization = await createTestOrganization();
    testUser = await createTestUser();
    testProperty = await createTestProperty(testOrganization.id);
    
    // Create organization user relationship
    await prisma.organizationUser.create({
      data: {
        userId: testUser.id,
        organizationId: testOrganization.id,
        role: 'PROPERTY_MANAGER'
      }
    });
  });

  afterEach(async () => {
    if (testOrganization) {
      await cleanupTestData(testOrganization.id);
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  /**
   * Property 11: Maintenance Mode Handling
   * For any unit under maintenance, temporary marketplace removal should be possible with restoration capability
   */
  it('should handle maintenance mode transitions correctly for any valid configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        maintenanceConfigGen,
        async (config) => {
          // Create test unit and listing
          const unit = await createTestUnit(testProperty.id);
          const listingId = await createTestListing(unit.id, testOrganization.id, testUser.id);

          // Verify initial state - unit should be listed
          const initialStatus = await maintenanceListingIntegration.getMaintenanceListingStatus(unit.id);
          expect(initialStatus.isInMaintenance).toBe(false);

          // Start maintenance mode
          const maintenanceConfig: MaintenanceModeConfig = {
            unitId: unit.id,
            startDate: new Date(),
            estimatedEndDate: config.estimatedDays ? 
              new Date(Date.now() + config.estimatedDays * 24 * 60 * 60 * 1000) : undefined,
            reason: config.reason,
            notifyTenants: config.notifyTenants,
            autoRestore: config.autoRestore
          };

          const startResult = await listingService.startMaintenanceMode(maintenanceConfig, testUser.id);
          
          // Property: Starting maintenance mode should succeed for any valid configuration
          expect(startResult.success).toBe(true);
          expect(startResult.data?.status).toBe(ListingStatus.MAINTENANCE);

          // Verify maintenance mode status
          const maintenanceStatus = await maintenanceListingIntegration.getMaintenanceListingStatus(unit.id);
          expect(maintenanceStatus.isInMaintenance).toBe(true);
          expect(maintenanceStatus.canRestore).toBe(true);
          expect(maintenanceStatus.reason).toBe(config.reason);

          // Property: Unit should be temporarily removed from marketplace
          // (In a full implementation, this would check marketplace visibility)
          
          // End maintenance mode
          const endResult = await listingService.endMaintenanceMode(
            unit.id,
            testUser.id,
            ListingStatus.ACTIVE,
            'Maintenance completed'
          );

          // Property: Ending maintenance mode should succeed and restore capability
          expect(endResult.success).toBe(true);
          expect(endResult.data?.status).toBe(ListingStatus.ACTIVE);

          // Verify restoration
          const restoredStatus = await maintenanceListingIntegration.getMaintenanceListingStatus(unit.id);
          expect(restoredStatus.isInMaintenance).toBe(false);

          // Cleanup
          await prisma.unit.delete({ where: { id: unit.id } });
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should integrate maintenance requests with listing management correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        priorityGen,
        maintenanceReasonGen,
        async (priority, reason) => {
          // Create test unit and listing
          const unit = await createTestUnit(testProperty.id);
          const listingId = await createTestListing(unit.id, testOrganization.id, testUser.id);

          // Create maintenance request
          const maintenanceRequest = await createMaintenanceRequest(
            testOrganization.id,
            testProperty.id,
            unit.id,
            testUser.id,
            priority
          );

          // Update maintenance request description to include reason
          await prisma.maintenanceRequest.update({
            where: { id: maintenanceRequest.id },
            data: { description: reason }
          });

          // Handle maintenance request status change
          await maintenanceListingIntegration.handleMaintenanceStatusChange(
            maintenanceRequest.id,
            MaintenanceRequest_status.IN_PROGRESS,
            testUser.id
          );

          // Check if maintenance mode was started based on priority/reason
          const maintenanceStatus = await maintenanceListingIntegration.getMaintenanceListingStatus(unit.id);
          
          const shouldStartMaintenance = 
            priority === Priority.HIGH || 
            priority === Priority.EMERGENCY ||
            reason.toLowerCase().includes('offline') ||
            reason.toLowerCase().includes('electrical') ||
            reason.toLowerCase().includes('plumbing');

          // Property: High priority or unit-affecting maintenance should start maintenance mode
          if (shouldStartMaintenance) {
            expect(maintenanceStatus.isInMaintenance).toBe(true);
            expect(maintenanceStatus.maintenanceRequestId).toBe(maintenanceRequest.id);
          }

          // Complete maintenance request
          await maintenanceListingIntegration.handleMaintenanceStatusChange(
            maintenanceRequest.id,
            MaintenanceRequest_status.COMPLETED,
            testUser.id
          );

          // Property: Completing maintenance should end maintenance mode if it was started
          if (shouldStartMaintenance) {
            const completedStatus = await maintenanceListingIntegration.getMaintenanceListingStatus(unit.id);
            expect(completedStatus.isInMaintenance).toBe(false);
          }

          // Cleanup
          await prisma.maintenanceRequest.delete({ where: { id: maintenanceRequest.id } });
          await prisma.unit.delete({ where: { id: unit.id } });
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should maintain data consistency during maintenance mode transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(maintenanceConfigGen, { minLength: 1, maxLength: 5 }),
        async (configs) => {
          const units = [];
          
          // Create multiple units and listings
          for (let i = 0; i < configs.length; i++) {
            const unit = await createTestUnit(testProperty.id);
            await createTestListing(unit.id, testOrganization.id, testUser.id);
            units.push(unit);
          }

          // Start maintenance mode for all units
          const startResults = [];
          for (let i = 0; i < units.length; i++) {
            const config: MaintenanceModeConfig = {
              unitId: units[i].id,
              startDate: new Date(),
              reason: configs[i].reason,
              notifyTenants: configs[i].notifyTenants,
              autoRestore: configs[i].autoRestore
            };
            
            const result = await listingService.startMaintenanceMode(config, testUser.id);
            startResults.push(result);
          }

          // Property: All maintenance mode starts should succeed
          startResults.forEach(result => {
            expect(result.success).toBe(true);
          });

          // Get units in maintenance mode
          const maintenanceUnits = await maintenanceListingIntegration.getUnitsInMaintenanceMode(
            testOrganization.id
          );

          // Property: All units should be reported as in maintenance mode
          expect(maintenanceUnits.length).toBe(units.length);
          
          // Verify each unit is properly tracked
          units.forEach(unit => {
            const maintenanceUnit = maintenanceUnits.find(mu => mu.unitId === unit.id);
            expect(maintenanceUnit).toBeDefined();
            expect(maintenanceUnit?.unitNumber).toBe(unit.unitNumber);
          });

          // End maintenance mode for all units
          const endResults = [];
          for (const unit of units) {
            const result = await listingService.endMaintenanceMode(
              unit.id,
              testUser.id,
              ListingStatus.ACTIVE,
              'Bulk maintenance completion'
            );
            endResults.push(result);
          }

          // Property: All maintenance mode ends should succeed
          endResults.forEach(result => {
            expect(result.success).toBe(true);
          });

          // Verify no units are in maintenance mode
          const finalMaintenanceUnits = await maintenanceListingIntegration.getUnitsInMaintenanceMode(
            testOrganization.id
          );
          expect(finalMaintenanceUnits.length).toBe(0);

          // Cleanup
          for (const unit of units) {
            await prisma.unit.delete({ where: { id: unit.id } });
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});