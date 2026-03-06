/**
 * Property-Based Test: Bulk Operation Processing
 * 
 * **Feature: marketplace-listing-choice, Property 6: Bulk Operation Processing**
 * **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
 * 
 * Property: For any set of selected units and bulk action, each unit should be 
 * processed individually with success/failure tracking and summary reporting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import { ListingService } from '@/lib/listing-service'
import { 
  BulkListingOperation, 
  BulkListingActionType, 
  ListingStatus
} from '@/lib/listing-types'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    unit: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    listing: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

describe('Property Test: Bulk Operation Processing', () => {
  let listingService: ListingService
  
  beforeEach(() => {
    vi.clearAllMocks()
    listingService = new ListingService()
  })

  // Generators for property-based testing
  const unitIdGenerator = fc.string({ minLength: 1, maxLength: 50 })
  const userIdGenerator = fc.string({ minLength: 1, maxLength: 50 })
  const organizationIdGenerator = fc.string({ minLength: 1, maxLength: 50 })

  const listingDataGenerator = fc.record({
    unitId: unitIdGenerator,
    title: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
    description: fc.option(fc.string({ minLength: 1, maxLength: 1000 })),
    price: fc.option(fc.integer({ min: 0, max: 10000 })),
    availabilityDate: fc.option(fc.date()),
    expirationDate: fc.option(fc.date())
  })

  const bulkOperationGenerator = fc.record({
    unitId: unitIdGenerator,
    action: fc.constantFrom(
      BulkListingActionType.LIST,
      BulkListingActionType.UNLIST,
      BulkListingActionType.SUSPEND
    ),
    listingData: fc.option(listingDataGenerator)
  })

  const bulkOperationsArrayGenerator = fc.array(bulkOperationGenerator, { 
    minLength: 1, 
    maxLength: 20 
  })

  it('Property 6: Bulk operations should process each unit individually with proper tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        bulkOperationsArrayGenerator,
        userIdGenerator,
        organizationIdGenerator,
        async (operations: BulkListingOperation[], userId: string, organizationId: string) => {
          // Mock the individual operation methods to simulate various outcomes
          const mockCreateListing = vi.spyOn(listingService, 'createListing')
          const mockRemoveListing = vi.spyOn(listingService, 'removeListing')

          // Set up mock responses - some succeed, some fail
          operations.forEach((op, index) => {
            const shouldSucceed = index % 3 !== 0 // Fail every 3rd operation for testing
            
            if (op.action === BulkListingActionType.LIST) {
              mockCreateListing.mockResolvedValueOnce(
                shouldSucceed 
                  ? { success: true, data: { listingId: `listing-${op.unitId}`, status: ListingStatus.ACTIVE } }
                  : { success: false, error: 'VALIDATION_FAILED' as any, message: 'Mock validation error' }
              )
            } else {
              mockRemoveListing.mockResolvedValueOnce(
                shouldSucceed
                  ? { success: true, data: { success: true } }
                  : { success: false, error: 'LISTING_NOT_FOUND' as any, message: 'Mock listing not found' }
              )
            }
          })

          // Execute bulk operation
          const result = await listingService.bulkUpdateListings(operations, userId, organizationId)

          // Property assertions
          expect(result.success).toBe(true)
          
          if (result.success) {
            const bulkResult = result.data

            // 1. Each unit should be processed exactly once
            const processedUnits = [...bulkResult.successful, ...bulkResult.failed.map(f => f.unitId)]
            const uniqueProcessedUnits = new Set(processedUnits)
            expect(processedUnits.length).toBe(uniqueProcessedUnits.size)
            expect(processedUnits.length).toBe(operations.length)

            // 2. All original unit IDs should be accounted for
            const originalUnitIds = new Set(operations.map(op => op.unitId))
            expect(uniqueProcessedUnits).toEqual(originalUnitIds)

            // 3. Summary should accurately reflect results
            expect(bulkResult.summary.total).toBe(operations.length)
            expect(bulkResult.summary.succeeded).toBe(bulkResult.successful.length)
            expect(bulkResult.summary.failed).toBe(bulkResult.failed.length)
            expect(bulkResult.summary.succeeded + bulkResult.summary.failed).toBe(bulkResult.summary.total)

            // 4. Failed operations should include error messages
            bulkResult.failed.forEach(failure => {
              expect(failure.unitId).toBeTruthy()
              expect(failure.error).toBeTruthy()
              expect(typeof failure.error).toBe('string')
            })

            // 5. No unit should appear in both successful and failed arrays
            const successfulSet = new Set(bulkResult.successful)
            const failedSet = new Set(bulkResult.failed.map(f => f.unitId))
            const intersection = new Set([...successfulSet].filter(x => failedSet.has(x)))
            expect(intersection.size).toBe(0)

            // 6. Verify individual operations were called correctly
            const listOperations = operations.filter(op => op.action === BulkListingActionType.LIST)
            const unlinkOperations = operations.filter(op => 
              op.action === BulkListingActionType.UNLIST || op.action === BulkListingActionType.SUSPEND
            )

            expect(mockCreateListing).toHaveBeenCalledTimes(listOperations.length)
            expect(mockRemoveListing).toHaveBeenCalledTimes(unlinkOperations.length)

            // 7. LIST operations should have been called with proper listing data
            listOperations.forEach((op, index) => {
              const call = mockCreateListing.mock.calls[index]
              expect(call[0]).toBe(op.unitId)
              expect(call[1]).toEqual(op.listingData)
              expect(call[2]).toBe(userId)
              expect(call[3]).toBe(organizationId)
            })

            // 8. UNLIST/SUSPEND operations should have been called with proper parameters
            unlinkOperations.forEach((op, index) => {
              const call = mockRemoveListing.mock.calls[index]
              expect(call[0]).toBe(op.unitId)
              expect(call[1]).toBe(userId)
              expect(typeof call[2]).toBe('string') // reason
            })
          }
        }
      ),
      { 
        numRuns: 50,
        verbose: true
      }
    )
  })

  it('Property 6.1: Empty operations array should return appropriate result', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdGenerator,
        organizationIdGenerator,
        async (userId: string, organizationId: string) => {
          const result = await listingService.bulkUpdateListings([], userId, organizationId)
          
          expect(result.success).toBe(false)
          expect(result.error).toBe('INVALID_INPUT')
          expect(result.message).toContain('No operations provided')
        }
      ),
      { numRuns: 10 }
    )
  })

  it('Property 6.2: Operations with missing required data should be handled gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          unitId: unitIdGenerator,
          action: fc.constant(BulkListingActionType.LIST),
          // Intentionally omit listingData for LIST operations
        }), { minLength: 1, maxLength: 5 }),
        userIdGenerator,
        organizationIdGenerator,
        async (operations: BulkListingOperation[], userId: string, organizationId: string) => {
          const result = await listingService.bulkUpdateListings(operations, userId, organizationId)
          
          expect(result.success).toBe(true)
          
          if (result.success) {
            const bulkResult = result.data
            
            // All operations should fail due to missing listing data
            expect(bulkResult.summary.failed).toBe(operations.length)
            expect(bulkResult.summary.succeeded).toBe(0)
            
            // Each failed operation should have an error message about missing data
            bulkResult.failed.forEach(failure => {
              expect(failure.error).toContain('Listing data required')
            })
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 6.3: Bulk operations should maintain data consistency even with mixed results', async () => {
    await fc.assert(
      fc.asyncProperty(
        bulkOperationsArrayGenerator,
        userIdGenerator,
        organizationIdGenerator,
        async (operations: BulkListingOperation[], userId: string, organizationId: string) => {
          // Ensure we have a mix of different operation types
          const mixedOperations = [
            ...operations.slice(0, Math.ceil(operations.length / 3)).map(op => ({
              ...op,
              action: BulkListingActionType.LIST,
              listingData: {
                unitId: op.unitId,
                title: `Test Unit ${op.unitId}`,
                price: 1000
              }
            })),
            ...operations.slice(Math.ceil(operations.length / 3), Math.ceil(2 * operations.length / 3)).map(op => ({
              ...op,
              action: BulkListingActionType.UNLIST
            })),
            ...operations.slice(Math.ceil(2 * operations.length / 3)).map(op => ({
              ...op,
              action: BulkListingActionType.SUSPEND
            }))
          ]

          // Mock individual operations with mixed success/failure
          const mockCreateListing = vi.spyOn(listingService, 'createListing')
          const mockRemoveListing = vi.spyOn(listingService, 'removeListing')

          mixedOperations.forEach((op, index) => {
            const shouldSucceed = index % 2 === 0 // Alternate success/failure
            
            if (op.action === BulkListingActionType.LIST) {
              mockCreateListing.mockResolvedValueOnce(
                shouldSucceed 
                  ? { success: true, data: { listingId: `listing-${op.unitId}`, status: ListingStatus.ACTIVE } }
                  : { success: false, error: 'VALIDATION_FAILED' as any, message: 'Mock error' }
              )
            } else {
              mockRemoveListing.mockResolvedValueOnce(
                shouldSucceed
                  ? { success: true, data: { success: true } }
                  : { success: false, error: 'LISTING_NOT_FOUND' as any, message: 'Mock error' }
              )
            }
          })

          const result = await listingService.bulkUpdateListings(mixedOperations, userId, organizationId)

          expect(result.success).toBe(true)
          
          if (result.success) {
            const bulkResult = result.data

            // Verify data consistency properties
            expect(bulkResult.summary.total).toBe(mixedOperations.length)
            
            // No duplicate processing
            const allProcessedUnits = [
              ...bulkResult.successful,
              ...bulkResult.failed.map(f => f.unitId)
            ]
            expect(new Set(allProcessedUnits).size).toBe(allProcessedUnits.length)
            
            // All units accounted for
            expect(allProcessedUnits.length).toBe(mixedOperations.length)
            
            // Summary matches actual results
            expect(bulkResult.summary.succeeded + bulkResult.summary.failed).toBe(bulkResult.summary.total)
          }
        }
      ),
      { numRuns: 30 }
    )
  })
})