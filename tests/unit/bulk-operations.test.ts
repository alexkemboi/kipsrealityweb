/**
 * Unit Tests: Bulk Operations
 * 
 * Tests bulk listing creation with mixed success/failure scenarios,
 * bulk listing removal with proper cleanup, and partial failure handling and recovery.
 * 
 * **Validates: Requirements 4.4, 4.5**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListingService } from '@/lib/listing-service'
import { 
  BulkListingOperation, 
  BulkListingActionType, 
  ListingStatus
} from '@/lib/listing-types'

// Mock Prisma
const mockPrisma = {
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

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma
}))

describe('Bulk Operations Unit Tests', () => {
  let listingService: ListingService
  
  beforeEach(() => {
    vi.clearAllMocks()
    listingService = new ListingService()
  })

  describe('Bulk listing creation with mixed success/failure scenarios', () => {
    it('should handle mixed success and failure results correctly', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: {
            unitId: 'unit-1',
            title: 'Unit 1',
            price: 1000
          }
        },
        {
          unitId: 'unit-2',
          action: BulkListingActionType.LIST,
          listingData: {
            unitId: 'unit-2',
            title: 'Unit 2',
            price: 1200
          }
        },
        {
          unitId: 'unit-3',
          action: BulkListingActionType.LIST,
          listingData: {
            unitId: 'unit-3',
            title: 'Unit 3',
            price: 1500
          }
        }
      ]

      // Mock createListing to return mixed results
      const mockCreateListing = vi.spyOn(listingService, 'createListing')
      mockCreateListing
        .mockResolvedValueOnce({ 
          success: true, 
          data: { listingId: 'listing-1', status: ListingStatus.ACTIVE } 
        })
        .mockResolvedValueOnce({ 
          success: false, 
          error: 'UNIT_HAS_ACTIVE_LEASE' as any, 
          message: 'Unit has active lease' 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          data: { listingId: 'listing-3', status: ListingStatus.ACTIVE } 
        })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.total).toBe(3)
        expect(result.data.summary.succeeded).toBe(2)
        expect(result.data.summary.failed).toBe(1)
        expect(result.data.successful).toEqual(['unit-1', 'unit-3'])
        expect(result.data.failed).toEqual([
          { unitId: 'unit-2', error: 'Unit has active lease' }
        ])
      }
    })

    it('should validate operations before processing', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          // Missing listingData
        },
        {
          unitId: '', // Invalid unit ID
          action: BulkListingActionType.LIST,
          listingData: { unitId: '', title: 'Test', price: 1000 }
        }
      ]

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_INPUT')
      expect(result.message).toContain('Validation errors')
    })

    it('should handle duplicate unit IDs in operations', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-1', title: 'Unit 1', price: 1000 }
        },
        {
          unitId: 'unit-1', // Duplicate
          action: BulkListingActionType.UNLIST
        }
      ]

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_INPUT')
      expect(result.message).toContain('Duplicate unit ID: unit-1')
    })
  })

  describe('Bulk listing removal with proper cleanup', () => {
    it('should remove multiple listings successfully', async () => {
      const operations: BulkListingOperation[] = [
        { unitId: 'unit-1', action: BulkListingActionType.UNLIST },
        { unitId: 'unit-2', action: BulkListingActionType.UNLIST },
        { unitId: 'unit-3', action: BulkListingActionType.UNLIST }
      ]

      const mockRemoveListing = vi.spyOn(listingService, 'removeListing')
      mockRemoveListing
        .mockResolvedValueOnce({ success: true, data: { success: true } })
        .mockResolvedValueOnce({ success: true, data: { success: true } })
        .mockResolvedValueOnce({ success: true, data: { success: true } })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.succeeded).toBe(3)
        expect(result.data.summary.failed).toBe(0)
        expect(result.data.successful).toEqual(['unit-1', 'unit-2', 'unit-3'])
      }

      expect(mockRemoveListing).toHaveBeenCalledTimes(3)
      expect(mockRemoveListing).toHaveBeenCalledWith('unit-1', 'user-1', 'Bulk unlist operation')
      expect(mockRemoveListing).toHaveBeenCalledWith('unit-2', 'user-1', 'Bulk unlist operation')
      expect(mockRemoveListing).toHaveBeenCalledWith('unit-3', 'user-1', 'Bulk unlist operation')
    })

    it('should handle suspension operations', async () => {
      const operations: BulkListingOperation[] = [
        { unitId: 'unit-1', action: BulkListingActionType.SUSPEND },
        { unitId: 'unit-2', action: BulkListingActionType.SUSPEND }
      ]

      const mockRemoveListing = vi.spyOn(listingService, 'removeListing')
      mockRemoveListing
        .mockResolvedValueOnce({ success: true, data: { success: true } })
        .mockResolvedValueOnce({ success: true, data: { success: true } })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.succeeded).toBe(2)
        expect(result.data.successful).toEqual(['unit-1', 'unit-2'])
      }

      expect(mockRemoveListing).toHaveBeenCalledWith('unit-1', 'user-1', 'Bulk suspend operation')
      expect(mockRemoveListing).toHaveBeenCalledWith('unit-2', 'user-1', 'Bulk suspend operation')
    })
  })

  describe('Partial failure handling and recovery', () => {
    it('should continue processing after individual failures', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-1', title: 'Unit 1', price: 1000 }
        },
        { unitId: 'unit-2', action: BulkListingActionType.UNLIST },
        {
          unitId: 'unit-3',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-3', title: 'Unit 3', price: 1500 }
        }
      ]

      const mockCreateListing = vi.spyOn(listingService, 'createListing')
      const mockRemoveListing = vi.spyOn(listingService, 'removeListing')

      mockCreateListing
        .mockResolvedValueOnce({ 
          success: false, 
          error: 'UNIT_NOT_FOUND' as any, 
          message: 'Unit not found' 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          data: { listingId: 'listing-3', status: ListingStatus.ACTIVE } 
        })

      mockRemoveListing.mockResolvedValueOnce({ 
        success: true, 
        data: { success: true } 
      })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.total).toBe(3)
        expect(result.data.summary.succeeded).toBe(2)
        expect(result.data.summary.failed).toBe(1)
        expect(result.data.successful).toEqual(['unit-2', 'unit-3'])
        expect(result.data.failed).toEqual([
          { unitId: 'unit-1', error: 'Unit not found' }
        ])
      }
    })

    it('should trigger rollback when failure rate exceeds threshold', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-1', title: 'Unit 1', price: 1000 }
        },
        {
          unitId: 'unit-2',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-2', title: 'Unit 2', price: 1200 }
        }
      ]

      // Mock validation to return rollback data
      mockPrisma.unit.findUnique
        .mockResolvedValueOnce({
          id: 'unit-1',
          property: {
            organization: {
              users: [{ userId: 'user-1' }]
            }
          },
          listing: null
        })
        .mockResolvedValueOnce({
          id: 'unit-2',
          property: {
            organization: {
              users: [{ userId: 'user-1' }]
            }
          },
          listing: null
        })

      const mockCreateListing = vi.spyOn(listingService, 'createListing')
      const mockRemoveListing = vi.spyOn(listingService, 'removeListing')

      // First operation succeeds, second fails (100% failure rate triggers rollback)
      mockCreateListing
        .mockResolvedValueOnce({ 
          success: true, 
          data: { listingId: 'listing-1', status: ListingStatus.ACTIVE } 
        })
        .mockResolvedValueOnce({ 
          success: false, 
          error: 'VALIDATION_FAILED' as any, 
          message: 'Validation failed' 
        })

      // Mock rollback removal
      mockRemoveListing.mockResolvedValueOnce({ 
        success: true, 
        data: { success: true } 
      })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('TRANSACTION_FAILED')
      expect(result.message).toContain('rolled back due to high failure rate')
    })

    it('should handle rollback failures gracefully', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-1', title: 'Unit 1', price: 1000 }
        },
        {
          unitId: 'unit-2',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-2', title: 'Unit 2', price: 1200 }
        }
      ]

      // Mock validation
      mockPrisma.unit.findUnique
        .mockResolvedValue({
          id: 'unit-1',
          property: {
            organization: {
              users: [{ userId: 'user-1' }]
            }
          },
          listing: null
        })

      const mockCreateListing = vi.spyOn(listingService, 'createListing')
      const mockRemoveListing = vi.spyOn(listingService, 'removeListing')

      // Operations: first succeeds, second fails
      mockCreateListing
        .mockResolvedValueOnce({ 
          success: true, 
          data: { listingId: 'listing-1', status: ListingStatus.ACTIVE } 
        })
        .mockResolvedValueOnce({ 
          success: false, 
          error: 'VALIDATION_FAILED' as any, 
          message: 'Validation failed' 
        })

      // Rollback fails
      mockRemoveListing.mockResolvedValueOnce({ 
        success: false, 
        error: 'CLEANUP_FAILED' as any, 
        message: 'Rollback failed' 
      })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('TRANSACTION_FAILED')
      expect(result.message).toContain('rollback also failed')
    })

    it('should handle empty operations array', async () => {
      const result = await listingService.bulkUpdateListings([], 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_INPUT')
      expect(result.message).toBe('No operations provided')
    })

    it('should handle unknown operation types', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: 'UNKNOWN_ACTION' as any
        }
      ]

      // Mock validation
      mockPrisma.unit.findUnique.mockResolvedValueOnce({
        id: 'unit-1',
        property: {
          organization: {
            users: [{ userId: 'user-1' }]
          }
        },
        listing: null
      })

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.failed).toBe(1)
        expect(result.data.failed[0].error).toContain('Unknown operation')
      }
    })

    it('should handle service method exceptions', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST,
          listingData: { unitId: 'unit-1', title: 'Unit 1', price: 1000 }
        }
      ]

      // Mock validation
      mockPrisma.unit.findUnique.mockResolvedValueOnce({
        id: 'unit-1',
        property: {
          organization: {
            users: [{ userId: 'user-1' }]
          }
        },
        listing: null
      })

      const mockCreateListing = vi.spyOn(listingService, 'createListing')
      mockCreateListing.mockRejectedValueOnce(new Error('Database connection failed'))

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.summary.failed).toBe(1)
        expect(result.data.failed[0].error).toBe('Database connection failed')
      }
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle null/undefined operations gracefully', async () => {
      const result = await listingService.bulkUpdateListings(null as any, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_INPUT')
    })

    it('should handle operations with missing required fields', async () => {
      const operations: BulkListingOperation[] = [
        {
          unitId: 'unit-1',
          action: BulkListingActionType.LIST
          // Missing listingData
        }
      ]

      const result = await listingService.bulkUpdateListings(operations, 'user-1', 'org-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_INPUT')
      expect(result.message).toContain('missing listing data')
    })
  })
})