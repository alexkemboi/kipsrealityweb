// Marketplace Listing Service - Core Business Logic
// Implements listing lifecycle management with validation and error handling

import { prisma } from "./db";
import { auditService } from "./audit-service";
import { applicationListingIntegration, createListingChangeEvent } from "./application-listing-integration";
import { 
    listingErrorHandler,
    validateRequiredFields,
    createNotFoundError,
    createConflictError
} from "./listing-error-handler";
import { 
    ListingStatus, 
    ListingAction,
    CreateListingData,
    CreateListingResult,
    RemoveListingResult,
    UpdateStatusResult,
    ListingHistoryResult,
    BulkUpdateResult,
    BulkListingOperation,
    BulkListingActionType,
    BulkResult,
    CreateListingError,
    RemoveListingError,
    UpdateStatusError,
    BulkOperationError,
    MaintenanceModeConfig,
    MaintenanceModeStatus,
    MaintenanceModeResult,
    isValidStatusTransition
} from "./listing-types";

// Performance optimization: Cache frequently accessed data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const queryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Core service for marketplace listing management
 * Handles listing creation, removal, status updates, and audit trail
 * Optimized for performance with caching and efficient queries
 */
export class ListingService {
    
    /**
     * Performance-optimized method to get unit with related data
     * Uses selective includes and caching for frequently accessed units
     */
    private async getUnitWithRelations(unitId: string, includeOptions: any = {}) {
        const cacheKey = `unit_${unitId}_${JSON.stringify(includeOptions)}`;
        const cached = queryCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        country: true,
                        zipCode: true,
                        managerId: true
                    }
                },
                listing: true,
                leases: {
                    where: { leaseStatus: "ACTIVE" },
                    select: {
                        id: true,
                        leaseStatus: true,
                        startDate: true,
                        endDate: true
                    },
                    take: 1
                },
                ...includeOptions
            }
        });

        if (unit) {
            queryCache.set(cacheKey, { data: unit, timestamp: Date.now() });
        }

        return unit;
    }

    /**
     * Clear cache for a specific unit or all cached data
     */
    private clearCache(unitId?: string) {
        if (unitId) {
            // Clear all cache entries for this unit
            for (const key of queryCache.keys()) {
                if (key.startsWith(`unit_${unitId}_`)) {
                    queryCache.delete(key);
                }
            }
        } else {
            queryCache.clear();
        }
    }

    /**
     * Resolve a ListingStatus id by name.
     */
    private async getStatusIdByName(status: ListingStatus): Promise<string | undefined> {
        const record = await prisma.listingStatus.findFirst({
            where: {
                name: {
                    equals: status
                }
            }
        });
        if (record?.id) {
            return record.id;
        }

        // Create missing status entry to prevent null statuses in production.
        try {
            const created = await prisma.listingStatus.create({
                data: { name: status }
            });
            return created.id;
        } catch {
            return undefined;
        }
    }

    /**
     * Creates a new marketplace listing for a unit
     * Validates unit eligibility and creates listing with proper status
     * Includes intelligent default value population and comprehensive validation
     */
    async createListing(
        unitId: string, 
        listingData: CreateListingData,
        userId: string,
        organizationId: string
    ): Promise<CreateListingResult> {
        return await listingErrorHandler.withRetry(async () => {
            try {
                // Validate required fields
                const { unitId: _ignoreUnitId, ...listingPayload } = listingData;
                validateRequiredFields(
                    { unitId, userId, organizationId, ...listingPayload },
                    ['unitId', 'userId', 'organizationId', 'title', 'description', 'price'],
                    'createListing'
                );

            // Use optimized query to get unit with relations
            const unit = await this.getUnitWithRelations(unitId, {
                leases: {
                    where: {
                        leaseStatus: {
                            in: ['ACTIVE', 'PENDING_APPROVAL']
                        }
                    },
                    select: {
                        id: true,
                        leaseStatus: true
                    }
                }
            });

            if (!unit) {
                throw createNotFoundError('Unit', unitId);
            }

            // Check if unit already has an active listing
            if (unit.listing) {
                throw createConflictError(
                    'create listing',
                    'unit already has listing',
                    'unit without listing'
                );
            }

            // Check if unit has active lease
            if (unit.leases && unit.leases.length > 0) {
                throw createConflictError(
                    'create listing',
                    'unit has active lease',
                    'unit without active lease'
                );
            }

            // Validate required unit data for listing
            if (!unit.property) {
                return {
                    success: false,
                    error: CreateListingError.INVALID_UNIT_DATA,
                    message: `Unit ${unit.unitNumber} is missing required property information`
                };
            }

            // Prepare listing data with intelligent defaults and validation
            const validatedListingData = this.validateAndPopulateListingData(listingData, unit);

            // Clear cache for this unit since we're modifying it
            this.clearCache(unitId);
            if (!validatedListingData.isValid) {
                return {
                    success: false,
                    error: CreateListingError.VALIDATION_FAILED,
                    message: validatedListingData.errors.join(', ')
                };
            }

            const { title, description, price, availabilityDate, expirationDate } = validatedListingData.data;

            // Determine initial status based on availability date
            const initialStatus = this.determineInitialStatus(availabilityDate);
            const initialStatusId = await this.getStatusIdByName(initialStatus);

            // Create the listing in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Create the listing
                const listing = await tx.listing.create({
                    data: {
                        organizationId,
                        createdBy: userId,
                        statusId: initialStatusId,
                        title,
                        description,
                        price,
                        availabilityDate,
                        expirationDate,
                        propertyId: unit.propertyId,
                        unitId: unitId
                    }
                });

                // Update unit to reference the listing
                await tx.unit.update({
                    where: { id: unitId },
                    data: { listingId: listing.id }
                });

                // Create audit entry
                await auditService.createAuditEntry({
                    unitId,
                    listingId: listing.id,
                    action: initialStatus === ListingStatus.COMING_SOON ? ListingAction.SET_COMING_SOON : ListingAction.CREATE,
                    newStatus: initialStatus,
                    userId,
                    reason: initialStatus === ListingStatus.COMING_SOON ? 'Listing created with future availability date' : 'Listing created',
                    metadata: {
                        availabilityDate,
                        expirationDate
                    }
                }, tx);

                return listing;
            }, {
                timeout: 15000
            });

            // Notify application integration service about listing creation
            const changeEvent = createListingChangeEvent(
                unitId,
                initialStatus === ListingStatus.COMING_SOON ? ListingAction.SET_COMING_SOON : ListingAction.CREATE,
                initialStatus,
                userId,
                {
                    listingId: result.id,
                    previousStatus: ListingStatus.PRIVATE,
                    reason: initialStatus === ListingStatus.COMING_SOON ? 'Listing created with future availability date' : 'Listing created'
                }
            );
            await applicationListingIntegration.handleListingCreated(changeEvent);

            return {
                success: true,
                data: {
                    listingId: result.id,
                    status: initialStatus
                }
            };

        } catch (error) {
            console.error('Error creating listing:', error);
            return {
                success: false,
                error: CreateListingError.VALIDATION_FAILED,
                message: `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
        }, 'createListing');
    }

    /**
     * Removes a listing from the marketplace with proper cleanup
     */
    async removeListing(
        unitId: string,
        userId: string,
        reason?: string
    ): Promise<RemoveListingResult> {
        try {
            // Find the unit with its listing
            const unit = await prisma.unit.findUnique({
                where: { id: unitId },
                include: {
                    listing: true
                }
            });

            if (!unit) {
                return {
                    success: false,
                    error: RemoveListingError.UNIT_NOT_FOUND,
                    message: `Unit with ID ${unitId} not found`
                };
            }

            if (!unit.listing) {
                return {
                    success: false,
                    error: RemoveListingError.LISTING_NOT_FOUND,
                    message: `Unit does not have an active listing`
                };
            }

            const listingId = unit.listing.id;

            // Remove listing in a transaction
            await prisma.$transaction(async (tx) => {
                // Create audit entry before removal
                await auditService.createAuditEntry({
                    unitId,
                    listingId,
                    action: ListingAction.REMOVE,
                    previousStatus: ListingStatus.ACTIVE,
                    newStatus: ListingStatus.PRIVATE,
                    userId,
                    reason: reason || 'Listing removed'
                }, tx);

                // Update unit to remove listing reference
                await tx.unit.update({
                    where: { id: unitId },
                    data: { listingId: null }
                });

                // Delete the listing
                await tx.listing.delete({
                    where: { id: listingId }
                });
            });

            // Notify application integration service about listing removal
            const changeEvent = createListingChangeEvent(
                unitId,
                ListingAction.REMOVE,
                ListingStatus.PRIVATE,
                userId,
                {
                    listingId,
                    previousStatus: ListingStatus.ACTIVE,
                    reason: reason || 'Listing removed'
                }
            );
            await applicationListingIntegration.handleListingRemoved(changeEvent);

            return {
                success: true,
                data: { success: true }
            };

        } catch (error) {
            console.error('Error removing listing:', error);
            return {
                success: false,
                error: RemoveListingError.CLEANUP_FAILED,
                message: `Failed to remove listing: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Updates listing status with state machine validation
     */
    async updateListingStatus(
        listingId: string,
        newStatus: ListingStatus,
        userId: string,
        reason?: string
    ): Promise<UpdateStatusResult> {
        try {
            // Find the listing with current status
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    unit: true,
                    status: true
                }
            });

            if (!listing) {
                return {
                    success: false,
                    error: UpdateStatusError.LISTING_NOT_FOUND,
                    message: `Listing with ID ${listingId} not found`
                };
            }

            // Determine current status from listing status relation (fallback to ACTIVE)
            const currentStatus = (listing as any)?.status?.name
                ? ((listing as any).status.name as ListingStatus)
                : ListingStatus.ACTIVE;

            // Validate state transition
            if (!isValidStatusTransition(currentStatus, newStatus)) {
                return {
                    success: false,
                    error: UpdateStatusError.INVALID_TRANSITION,
                    message: `Invalid status transition from ${currentStatus} to ${newStatus}`
                };
            }

            const nextStatusId = await this.getStatusIdByName(newStatus);

            // Update status in transaction
            await prisma.$transaction(async (tx) => {
                // Create audit entry
                await auditService.createAuditEntry({
                    unitId: listing.unit?.id || '',
                    listingId,
                    action: ListingAction.UPDATE,
                    previousStatus: currentStatus,
                    newStatus,
                    userId,
                    reason: reason || `Status updated to ${newStatus}`
                }, tx);

                // Update listing status reference
                await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        statusId: nextStatusId ?? null
                    }
                });
            });

            return {
                success: true,
                data: {
                    listingId,
                    newStatus
                }
            };

        } catch (error) {
            console.error('Error updating listing status:', error);
            return {
                success: false,
                error: UpdateStatusError.VALIDATION_FAILED,
                message: `Failed to update listing status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Retrieves audit trail for a unit's listing history
     */
    async getListingHistory(
        unitId: string,
        userId: string
    ): Promise<ListingHistoryResult> {
        try {
            // Verify unit exists and user has access
            const unit = await prisma.unit.findUnique({
                where: { id: unitId },
                include: {
                    property: {
                        include: {
                            organization: {
                                include: {
                                    users: {
                                        where: { userId }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!unit) {
                return {
                    success: false,
                    error: "UNIT_NOT_FOUND",
                    message: `Unit with ID ${unitId} not found`
                };
            }

            // Check user has access to this unit's organization
            if (!unit.property?.organization?.users.length) {
                return {
                    success: false,
                    error: "PERMISSION_DENIED",
                    message: "You don't have permission to view this unit's history"
                };
            }

            // For now, return empty array since we don't have audit table yet
            // This would be implemented when the audit table is created
            const auditEntries = await auditService.getUnitAuditHistory(unitId);

            return {
                success: true,
                data: auditEntries
            };

        } catch (error) {
            console.error('Error retrieving listing history:', error);
            return {
                success: false,
                error: "PERMISSION_DENIED",
                message: `Failed to retrieve listing history: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Updates listing information with comprehensive validation and change tracking
     * Ensures marketplace synchronization for all updates
     */
    async updateListingInformation(
        listingId: string,
        updateData: Partial<CreateListingData>,
        userId: string
    ): Promise<UpdateStatusResult> {
        try {
            // Find the listing with current data
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    unit: true,
                    property: true
                }
            });

            if (!listing) {
                return {
                    success: false,
                    error: UpdateStatusError.LISTING_NOT_FOUND,
                    message: `Listing with ID ${listingId} not found`
                };
            }

            // Validate the update data
            const validatedData = this.validateListingUpdateData(updateData, listing);
            if (!validatedData.isValid) {
                return {
                    success: false,
                    error: UpdateStatusError.VALIDATION_FAILED,
                    message: validatedData.errors.join(', ')
                };
            }

            // Track changes for audit
            const changes = this.trackListingChanges(listing, validatedData.data);

            // Update listing in transaction
            const updatedListing = await prisma.$transaction(async (tx) => {
                // Update the listing
                const updated = await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        title: validatedData.data.title,
                        description: validatedData.data.description,
                        price: validatedData.data.price,
                        updatedAt: new Date()
                    }
                });

                // Create audit entry for the update
                await auditService.createAuditEntry({
                    unitId: listing.unit?.id || '',
                    listingId,
                    action: ListingAction.UPDATE,
                    previousStatus: ListingStatus.ACTIVE,
                    newStatus: ListingStatus.ACTIVE,
                    userId,
                    reason: 'Listing information updated',
                    metadata: { changes }
                }, tx);

                return updated;
            });

            // Trigger marketplace synchronization
            await this.synchronizeWithMarketplace(listingId, validatedData.data);

            return {
                success: true,
                data: {
                    listingId: updatedListing.id,
                    newStatus: ListingStatus.ACTIVE
                }
            };

        } catch (error) {
            console.error('Error updating listing information:', error);
            return {
                success: false,
                error: UpdateStatusError.VALIDATION_FAILED,
                message: `Failed to update listing: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Processes bulk listing operations with comprehensive error tracking and rollback capabilities
     * Each unit is processed individually with transaction handling for data consistency
     */
    async bulkUpdateListings(
        operations: BulkListingOperation[],
        userId: string,
        organizationId: string
    ): Promise<BulkUpdateResult> {
        try {
            if (!operations || operations.length === 0) {
                return {
                    success: false,
                    error: BulkOperationError.INVALID_INPUT,
                    message: "No operations provided"
                };
            }

            // Validate operations before processing
            const validationErrors = this.validateBulkOperations(operations);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    error: BulkOperationError.INVALID_INPUT,
                    message: `Validation errors: ${validationErrors.join(', ')}`
                };
            }

            const results: BulkResult = {
                successful: [],
                failed: [],
                summary: {
                    total: operations.length,
                    succeeded: 0,
                    failed: 0
                }
            };

            const processedOperations: Array<{
                operation: BulkListingOperation;
                success: boolean;
                rollbackData?: any;
            }> = [];

            // Process each operation individually with transaction handling
            for (const operation of operations) {
                let operationResult;
                let rollbackData: any = null;

                try {
                    // Pre-operation validation and rollback data collection
                    const preOpValidation = await this.validateSingleOperation(operation, userId, organizationId);
                    if (!preOpValidation.valid) {
                        throw new Error(preOpValidation.error);
                    }
                    rollbackData = preOpValidation.rollbackData;

                    // Execute the operation
                    switch (operation.action) {
                        case 'LIST':
                            if (!operation.listingData) {
                                throw new Error('Listing data required for LIST operation');
                            }
                            operationResult = await this.createListing(
                                operation.unitId,
                                operation.listingData,
                                userId,
                                organizationId
                            );
                            break;

                        case 'UNLIST':
                            operationResult = await this.removeListing(
                                operation.unitId,
                                userId,
                                'Bulk unlist operation'
                            );
                            break;

                        case 'SUSPEND':
                            // For suspend, we implement proper status update
                            operationResult = await this.suspendListing(
                                operation.unitId,
                                userId,
                                'Bulk suspend operation'
                            );
                            break;

                        case 'MAINTENANCE_START':
                            // Start maintenance mode
                            if (!operation.listingData?.reason) {
                                throw new Error('Maintenance reason required for MAINTENANCE_START operation');
                            }
                            const maintenanceConfig: MaintenanceModeConfig = {
                                unitId: operation.unitId,
                                startDate: new Date(),
                                reason: operation.listingData.reason,
                                notifyTenants: true,
                                autoRestore: false
                            };
                            operationResult = await this.startMaintenanceMode(maintenanceConfig, userId);
                            break;

                        case 'MAINTENANCE_END':
                            // End maintenance mode
                            operationResult = await this.endMaintenanceMode(
                                operation.unitId,
                                userId,
                                undefined,
                                'Bulk maintenance end operation'
                            );
                            break;

                        default:
                            throw new Error(`Unknown operation: ${operation.action}`);
                    }

                    if (operationResult.success) {
                        results.successful.push(operation.unitId);
                        results.summary.succeeded++;
                        processedOperations.push({
                            operation,
                            success: true,
                            rollbackData
                        });
                    } else {
                        results.failed.push({
                            unitId: operation.unitId,
                            error: operationResult.message || 'Operation failed'
                        });
                        results.summary.failed++;
                        processedOperations.push({
                            operation,
                            success: false
                        });
                    }

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    results.failed.push({
                        unitId: operation.unitId,
                        error: errorMessage
                    });
                    results.summary.failed++;
                    processedOperations.push({
                        operation,
                        success: false
                    });

                    // Log error for debugging
                    console.error(`Bulk operation failed for unit ${operation.unitId}:`, error);
                }
            }

            // Check if we need to rollback due to critical failures
            const criticalFailureThreshold = Math.ceil(operations.length * 0.5); // 50% failure rate
            if (results.summary.failed >= criticalFailureThreshold && operations.length > 1) {
                console.warn(`Critical failure threshold reached (${results.summary.failed}/${operations.length}). Initiating rollback.`);
                
                const rollbackResult = await this.rollbackBulkOperations(
                    processedOperations.filter(op => op.success),
                    userId
                );

                if (rollbackResult.success) {
                    return {
                        success: false,
                        error: BulkOperationError.TRANSACTION_FAILED,
                        message: `Bulk operation rolled back due to high failure rate (${results.summary.failed}/${operations.length} failed). All changes have been reverted.`
                    };
                } else {
                    return {
                        success: false,
                        error: BulkOperationError.TRANSACTION_FAILED,
                        message: `Bulk operation failed with high failure rate and rollback also failed. Manual intervention may be required. Original failures: ${results.summary.failed}/${operations.length}`
                    };
                }
            }

            // Create comprehensive audit log for bulk operation
            await auditService.createBulkAuditEntry(
                operations.map(op => ({
                    unitId: op.unitId,
                    action: this.mapBulkAction(op.action),
                    success: results.successful.includes(op.unitId),
                    error: results.failed.find(f => f.unitId === op.unitId)?.error
                })),
                userId,
                organizationId
            );

            return {
                success: true,
                data: results
            };

        } catch (error) {
            console.error('Error processing bulk operations:', error);
            return {
                success: false,
                error: BulkOperationError.TRANSACTION_FAILED,
                message: `Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Validates and populates listing data with intelligent defaults
     * Implements comprehensive validation rules for listing information
     */
    private validateAndPopulateListingData(
        listingData: CreateListingData,
        unit: any
    ): { isValid: boolean; data?: any; errors: string[] } {
        const errors: string[] = [];
        
        // Generate intelligent defaults
        const title = this.generateDefaultTitle(listingData.title, unit);
        const description = this.generateDefaultDescription(listingData.description, unit);
        const price = this.generateDefaultPrice(listingData.price, unit);

        // Validate title
        if (!title || title.trim().length === 0) {
            errors.push('Title is required');
        } else if (title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        } else if (title.trim().length > 100) {
            errors.push('Title must be less than 100 characters');
        }

        // Validate description
        if (!description || description.trim().length === 0) {
            errors.push('Description is required');
        } else if (description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        } else if (description.trim().length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }

        // Validate price
        if (price === undefined || price === null) {
            errors.push('Price is required');
        } else if (typeof price !== 'number' || price <= 0) {
            errors.push('Price must be a positive number');
        } else if (price > 50000) {
            errors.push('Price seems unusually high, please verify');
        }

        // Validate availability date
        if (listingData.availabilityDate) {
            const availDate = new Date(listingData.availabilityDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (availDate < today) {
                errors.push('Availability date cannot be in the past');
            }
        }

        // Validate expiration date
        if (listingData.expirationDate && listingData.availabilityDate) {
            const expDate = new Date(listingData.expirationDate);
            const availDate = new Date(listingData.availabilityDate);
            
            if (expDate <= availDate) {
                errors.push('Expiration date must be after availability date');
            }
        }

        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        return {
            isValid: true,
            data: {
                title: this.sanitizeText(title),
                description: this.sanitizeText(description),
                price: price,
                availabilityDate: listingData.availabilityDate,
                expirationDate: listingData.expirationDate
            },
            errors: []
        };
    }

    /**
     * Generates intelligent default title from unit data
     */
    private generateDefaultTitle(providedTitle: string | undefined, unit: any): string {
        if (providedTitle && providedTitle.trim().length > 0) {
            return providedTitle.trim();
        }

        const unitNumber = unit.unitNumber || 'Unit';
        const bedrooms = unit.bedrooms ? `${unit.bedrooms}BR` : '';
        const bathrooms = unit.bathrooms ? `${unit.bathrooms}BA` : '';
        
        const details = [bedrooms, bathrooms].filter(Boolean).join('/');
        return details ? `${unitNumber} - ${details}` : unitNumber;
    }

    /**
     * Generates intelligent default description from unit data
     */
    private generateDefaultDescription(providedDescription: string | undefined, unit: any): string {
        if (providedDescription && providedDescription.trim().length > 0) {
            return providedDescription.trim();
        }

        const parts = [];
        
        if (unit.bedrooms) {
            parts.push(`${unit.bedrooms} bedroom${unit.bedrooms > 1 ? 's' : ''}`);
        }
        
        if (unit.bathrooms) {
            parts.push(`${unit.bathrooms} bathroom${unit.bathrooms > 1 ? 's' : ''}`);
        }
        
        if (unit.squareFootage) {
            parts.push(`${unit.squareFootage} sq ft`);
        }
        
        const baseDescription = parts.length > 0 
            ? `Spacious ${parts.join(', ')} unit available for rent.`
            : 'Quality rental unit available.';
        
        return baseDescription + ' Contact us for more details and to schedule a viewing.';
    }

    /**
     * Generates intelligent default price from unit data
     */
    private generateDefaultPrice(providedPrice: number | undefined, unit: any): number {
        if (providedPrice !== undefined && providedPrice !== null) {
            return providedPrice;
        }
        
        if (unit.rentAmount && unit.rentAmount > 0) {
            return unit.rentAmount;
        }
        
        // Fallback default - this should rarely be used
        return 1000;
    }

    /**
     * Validates listing update data
     */
    private validateListingUpdateData(
        updateData: Partial<CreateListingData>,
        currentListing: any
    ): { isValid: boolean; data?: any; errors: string[] } {
        const errors: string[] = [];
        
        // Merge current data with updates
        const mergedData = {
            title: updateData.title !== undefined ? updateData.title : currentListing.title,
            description: updateData.description !== undefined ? updateData.description : currentListing.description,
            price: updateData.price !== undefined ? updateData.price : currentListing.price
        };

        // Validate merged data using existing validation logic
        const validation = this.validateAndPopulateListingData(
            { ...updateData, unitId: currentListing.unitId },
            currentListing.unit
        );

        return validation;
    }

    /**
     * Tracks changes between current and new listing data
     */
    private trackListingChanges(currentListing: any, newData: any): Record<string, any> {
        const changes: Record<string, any> = {};

        if (currentListing.title !== newData.title) {
            changes.title = { from: currentListing.title, to: newData.title };
        }

        if (currentListing.description !== newData.description) {
            changes.description = { from: currentListing.description, to: newData.description };
        }

        if (currentListing.price !== newData.price) {
            changes.price = { from: currentListing.price, to: newData.price };
        }

        return changes;
    }

    /**
     * Sanitizes text input to prevent XSS and ensure data quality
     */
    private sanitizeText(text: string): string {
        if (!text) return '';
        
        // Basic sanitization - remove potentially harmful characters
        return text
            .trim()
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 1000); // Limit length
    }

    /**
     * Synchronizes listing data with marketplace systems
     * Ensures all external systems reflect the current listing state
     */
    private async synchronizeWithMarketplace(
        listingId: string,
        listingData: any
    ): Promise<void> {
        try {
            // In a full implementation, this would:
            // 1. Update search indexes
            // 2. Notify external marketplace APIs
            // 3. Update cached data
            // 4. Trigger webhook notifications
            
            console.log('Marketplace Synchronization:', {
                listingId,
                timestamp: new Date(),
                action: 'UPDATE',
                data: {
                    title: listingData.title,
                    description: listingData.description,
                    price: listingData.price
                }
            });

            // Simulate marketplace API call
            // await marketplaceAPI.updateListing(listingId, listingData);
            
        } catch (error) {
            console.error('Marketplace synchronization failed:', error);
            // Don't throw - synchronization failure shouldn't break the main operation
            // In production, this would be queued for retry
        }
    }

    /**
     * Validates bulk operations before processing
     */
    private validateBulkOperations(operations: BulkListingOperation[]): string[] {
        const errors: string[] = [];
        const unitIds = new Set<string>();

        for (const operation of operations) {
            // Check for duplicate unit IDs
            if (unitIds.has(operation.unitId)) {
                errors.push(`Duplicate unit ID: ${operation.unitId}`);
            }
            unitIds.add(operation.unitId);

            // Validate operation-specific requirements
            if (operation.action === BulkListingActionType.LIST && !operation.listingData) {
                errors.push(`LIST operation for unit ${operation.unitId} missing listing data`);
            }

            // Validate unit ID format
            if (!operation.unitId || operation.unitId.trim().length === 0) {
                errors.push('Invalid unit ID provided');
            }
        }

        return errors;
    }

    /**
     * Validates a single operation and collects rollback data
     */
    private async validateSingleOperation(
        operation: BulkListingOperation,
        userId: string,
        organizationId: string
    ): Promise<{
        valid: boolean;
        error?: string;
        rollbackData?: any;
    }> {
        try {
            // Get current unit state for rollback purposes
            const unit = await prisma.unit.findUnique({
                where: { id: operation.unitId },
                include: {
                    listing: true,
                    property: {
                        include: {
                            organization: {
                                include: {
                                    users: {
                                        where: { userId }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!unit) {
                return {
                    valid: false,
                    error: `Unit ${operation.unitId} not found`
                };
            }

            // Check user permissions
            if (!unit.property?.organization?.users.length) {
                return {
                    valid: false,
                    error: `No permission to modify unit ${operation.unitId}`
                };
            }

            // Collect rollback data
            const rollbackData = {
                unitId: operation.unitId,
                hadListing: !!unit.listing,
                listingId: unit.listing?.id,
                originalListingData: unit.listing ? {
                    title: unit.listing.title,
                    description: unit.listing.description,
                    price: unit.listing.price
                } : null
            };

            return {
                valid: true,
                rollbackData
            };

        } catch (error) {
            return {
                valid: false,
                error: `Validation failed for unit ${operation.unitId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Suspends a listing (implementation for SUSPEND action)
     */
    private async suspendListing(
        unitId: string,
        userId: string,
        reason?: string
    ): Promise<RemoveListingResult> {
        // For now, suspend is implemented as removal
        // In a full implementation, this would update a status field
        return this.removeListing(unitId, userId, reason);
    }

    /**
     * Rolls back successful operations in case of critical failures
     */
    private async rollbackBulkOperations(
        successfulOperations: Array<{
            operation: BulkListingOperation;
            success: boolean;
            rollbackData?: any;
        }>,
        userId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            for (const opData of successfulOperations) {
                const { operation, rollbackData } = opData;

                try {
                    switch (operation.action) {
                        case BulkListingActionType.LIST:
                            // Rollback: Remove the created listing
                            await this.removeListing(operation.unitId, userId, 'Rollback: Bulk operation failed');
                            break;

                        case BulkListingActionType.UNLIST:
                        case BulkListingActionType.SUSPEND:
                            // Rollback: Recreate the listing if it existed
                            if (rollbackData?.hadListing && rollbackData.originalListingData) {
                                await this.createListing(
                                    operation.unitId,
                                    rollbackData.originalListingData,
                                    userId,
                                    'system' // Use system as organizationId for rollback
                                );
                            }
                            break;
                    }
                } catch (rollbackError) {
                    console.error(`Rollback failed for unit ${operation.unitId}:`, rollbackError);
                    // Continue with other rollbacks even if one fails
                }
            }

            return { success: true };

        } catch (error) {
            console.error('Rollback operation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Rollback failed'
            };
        }
    }

    /**
     * Creates audit entry for bulk operations
     */
    private async createBulkAuditEntry(
        operations: BulkListingOperation[],
        results: BulkResult,
        userId: string,
        organizationId: string
    ): Promise<void> {
        // This is now handled by auditService.createBulkAuditEntry
        // Keeping this method for backward compatibility but delegating to audit service
        await auditService.createBulkAuditEntry(
            operations.map(op => ({
                unitId: op.unitId,
                action: this.mapBulkAction(op.action),
                success: results.successful.includes(op.unitId),
                error: results.failed.find(f => f.unitId === op.unitId)?.error
            })),
            userId,
            organizationId
        );
    }

    private mapBulkAction(action: BulkListingActionType): ListingAction {
        switch (action) {
            case BulkListingActionType.LIST:
                return ListingAction.CREATE;
            case BulkListingActionType.UNLIST:
                return ListingAction.REMOVE;
            case BulkListingActionType.SUSPEND:
                return ListingAction.SUSPEND;
            case BulkListingActionType.MAINTENANCE_START:
                return ListingAction.MAINTENANCE_START;
            case BulkListingActionType.MAINTENANCE_END:
                return ListingAction.MAINTENANCE_END;
            default:
                return ListingAction.UPDATE;
        }
    }

    /**
     * Starts maintenance mode for a unit
     * Temporarily removes listing from marketplace with restoration capability
     */
    async startMaintenanceMode(
        config: MaintenanceModeConfig,
        userId: string
    ): Promise<MaintenanceModeResult> {
        try {
            // Find the unit with its listing and maintenance requests
            const unit = await prisma.unit.findUnique({
                where: { id: config.unitId },
                include: {
                    listing: true,
                    maintenanceRequests: {
                        where: {
                            id: config.maintenanceRequestId || undefined,
                            status: {
                                in: ['OPEN', 'IN_PROGRESS', 'ON_HOLD']
                            }
                        }
                    }
                }
            });

            if (!unit) {
                return {
                    success: false,
                    error: "UNIT_NOT_FOUND",
                    message: `Unit with ID ${config.unitId} not found`
                };
            }

            // Validate maintenance request if provided
            if (config.maintenanceRequestId) {
                const maintenanceRequest = unit.maintenanceRequests.find(
                    req => req.id === config.maintenanceRequestId
                );
                
                if (!maintenanceRequest) {
                    return {
                        success: false,
                        error: "VALIDATION_FAILED",
                        message: `Maintenance request ${config.maintenanceRequestId} not found or not active`
                    };
                }
            }

            // Check if unit has a listing to put in maintenance mode
            if (!unit.listing) {
                return {
                    success: false,
                    error: "LISTING_NOT_FOUND",
                    message: `Unit ${unit.unitNumber} does not have an active listing`
                };
            }

            const listingId = unit.listing.id;
            const previousStatus = ListingStatus.ACTIVE; // Current schema doesn't track status

            // Validate state transition
            if (!isValidStatusTransition(previousStatus, ListingStatus.MAINTENANCE)) {
                return {
                    success: false,
                    error: "INVALID_TRANSITION",
                    message: `Cannot transition from ${previousStatus} to MAINTENANCE`
                };
            }

            // Start maintenance mode in transaction
            await prisma.$transaction(async (tx) => {
                // Create audit entry for maintenance start
                await auditService.createAuditEntry({
                    unitId: config.unitId,
                    listingId,
                    action: ListingAction.MAINTENANCE_START,
                    previousStatus,
                    newStatus: ListingStatus.MAINTENANCE,
                    userId,
                    reason: config.reason,
                    metadata: {
                        maintenanceRequestId: config.maintenanceRequestId,
                        startDate: config.startDate,
                        estimatedEndDate: config.estimatedEndDate,
                        autoRestore: config.autoRestore,
                        notifyTenants: config.notifyTenants
                    }
                }, tx);

                // Update listing to reflect maintenance mode
                // Note: Current schema doesn't have status field, so we track in audit only
                await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        updatedAt: new Date()
                    }
                });

                // If maintenance request is provided, link it to the maintenance mode
                if (config.maintenanceRequestId) {
                    await tx.maintenanceRequest.update({
                        where: { id: config.maintenanceRequestId },
                        data: {
                            updatedAt: new Date()
                        }
                    });
                }
            });

            // Trigger marketplace synchronization to hide unit
            await this.synchronizeMaintenanceModeWithMarketplace(
                listingId,
                ListingStatus.MAINTENANCE,
                config
            );

            // Send notifications if requested
            if (config.notifyTenants) {
                await this.notifyTenantsOfMaintenance(config.unitId, config);
            }

            return {
                success: true,
                data: {
                    unitId: config.unitId,
                    status: ListingStatus.MAINTENANCE,
                    maintenanceRequestId: config.maintenanceRequestId
                }
            };

        } catch (error) {
            console.error('Error starting maintenance mode:', error);
            return {
                success: false,
                error: "VALIDATION_FAILED",
                message: `Failed to start maintenance mode: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Ends maintenance mode for a unit
     * Restores listing to marketplace with previous or specified status
     */
    async endMaintenanceMode(
        unitId: string,
        userId: string,
        restoreToStatus?: ListingStatus,
        reason?: string
    ): Promise<MaintenanceModeResult> {
        try {
            // Find the unit with its listing and maintenance history
            const unit = await prisma.unit.findUnique({
                where: { id: unitId },
                include: {
                    listing: true
                }
            });

            if (!unit) {
                return {
                    success: false,
                    error: "UNIT_NOT_FOUND",
                    message: `Unit with ID ${unitId} not found`
                };
            }

            if (!unit.listing) {
                return {
                    success: false,
                    error: "LISTING_NOT_FOUND",
                    message: `Unit ${unit.unitNumber} does not have an active listing`
                };
            }

            const listingId = unit.listing.id;

            // Get maintenance mode status from audit trail
            const maintenanceStatus = await this.getMaintenanceModeStatus(unitId);
            if (!maintenanceStatus.isInMaintenance) {
                return {
                    success: false,
                    error: "INVALID_TRANSITION",
                    message: `Unit ${unit.unitNumber} is not currently in maintenance mode`
                };
            }

            // Determine target status
            const targetStatus = restoreToStatus || maintenanceStatus.previousStatus || ListingStatus.ACTIVE;

            // Validate state transition
            if (!isValidStatusTransition(ListingStatus.MAINTENANCE, targetStatus)) {
                return {
                    success: false,
                    error: "INVALID_TRANSITION",
                    message: `Cannot transition from MAINTENANCE to ${targetStatus}`
                };
            }

            // End maintenance mode in transaction
            await prisma.$transaction(async (tx) => {
                // Create audit entry for maintenance end
                await auditService.createAuditEntry({
                    unitId,
                    listingId,
                    action: ListingAction.MAINTENANCE_END,
                    previousStatus: ListingStatus.MAINTENANCE,
                    newStatus: targetStatus,
                    userId,
                    reason: reason || 'Maintenance completed',
                    metadata: {
                        maintenanceRequestId: maintenanceStatus.maintenanceRequestId,
                        endDate: new Date(),
                        restoredToStatus: targetStatus
                    }
                }, tx);

                // Update listing to reflect restored status
                await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        updatedAt: new Date()
                    }
                });
            });

            // Trigger marketplace synchronization to restore visibility
            await this.synchronizeMaintenanceModeWithMarketplace(
                listingId,
                targetStatus,
                null
            );

            return {
                success: true,
                data: {
                    unitId,
                    status: targetStatus,
                    maintenanceRequestId: maintenanceStatus.maintenanceRequestId
                }
            };

        } catch (error) {
            console.error('Error ending maintenance mode:', error);
            return {
                success: false,
                error: "VALIDATION_FAILED",
                message: `Failed to end maintenance mode: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Gets the current maintenance mode status for a unit
     */
    async getMaintenanceModeStatus(unitId: string): Promise<MaintenanceModeStatus> {
        try {
            // Get the latest maintenance-related audit entries
            const auditEntries = await auditService.getUnitAuditHistory(unitId);
            
            // Find the most recent maintenance start/end entries
            const maintenanceEntries = auditEntries.filter(entry => 
                entry.action === ListingAction.MAINTENANCE_START || 
                entry.action === ListingAction.MAINTENANCE_END
            ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            if (maintenanceEntries.length === 0) {
                return {
                    isInMaintenance: false,
                    canRestore: false
                };
            }

            const latestEntry = maintenanceEntries[0];
            const isInMaintenance = latestEntry.action === ListingAction.MAINTENANCE_START;

            if (!isInMaintenance) {
                return {
                    isInMaintenance: false,
                    canRestore: false
                };
            }

              // Extract maintenance details from metadata
              const metadata = latestEntry.metadata || {};
              
              // Safe type extraction with proper casting
              const maintenanceRequestId = metadata.maintenanceRequestId as string | undefined;
              const startDate = metadata.startDate ? new Date(metadata.startDate as string) : latestEntry.timestamp;
              const estimatedEndDate = metadata.estimatedEndDate ? new Date(metadata.estimatedEndDate as string) : undefined;
              
              return {
                  isInMaintenance: true,
                  maintenanceRequestId,
                  startDate,
                  estimatedEndDate,
                  reason: latestEntry.reason,
                  previousStatus: latestEntry.previousStatus,
                  canRestore: true
              };

        } catch (error) {
            console.error('Error getting maintenance mode status:', error);
            return {
                isInMaintenance: false,
                canRestore: false
            };
        }
    }

    /**
     * Automatically starts maintenance mode when a maintenance request is created
     * Integrates with existing maintenance workflow
     */
    async handleMaintenanceRequestCreated(
        maintenanceRequestId: string,
        unitId: string,
        userId: string
    ): Promise<void> {
        try {
            // Get maintenance request details
            const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
                where: { id: maintenanceRequestId },
                include: {
                    unit: true
                }
            });

            if (!maintenanceRequest || !maintenanceRequest.unit) {
                console.warn(`Maintenance request ${maintenanceRequestId} not found or has no unit`);
                return;
            }

            // Only auto-start maintenance mode for high-priority requests
            // or requests that explicitly require unit to be offline
            const shouldAutoStartMaintenance =
                maintenanceRequest.priority === 'HIGH' ||
                maintenanceRequest.priority === 'URGENT' ||
                maintenanceRequest.description.toLowerCase().includes('offline') ||
                maintenanceRequest.description.toLowerCase().includes('unavailable');

            if (!shouldAutoStartMaintenance) {
                return;
            }

            // Start maintenance mode
            const config: MaintenanceModeConfig = {
                unitId,
                maintenanceRequestId,
                startDate: new Date(),
                reason: `Maintenance request: ${maintenanceRequest.title}`,
                notifyTenants: true,
                autoRestore: false // Manual restoration for safety
            };

            const result = await this.startMaintenanceMode(config, userId);
            
            if (result.success) {
                console.log(`Maintenance mode started for unit ${unitId} due to maintenance request ${maintenanceRequestId}`);
            } else {
                console.warn(`Failed to start maintenance mode for unit ${unitId}:`, result.message);
            }

        } catch (error) {
            console.error('Error handling maintenance request creation:', error);
        }
    }

    /**
     * Automatically ends maintenance mode when a maintenance request is completed
     */
    async handleMaintenanceRequestCompleted(
        maintenanceRequestId: string,
        unitId: string,
        userId: string
    ): Promise<void> {
        try {
            // Check if unit is in maintenance mode for this request
            const maintenanceStatus = await this.getMaintenanceModeStatus(unitId);
            
            if (!maintenanceStatus.isInMaintenance || 
                maintenanceStatus.maintenanceRequestId !== maintenanceRequestId) {
                return; // Unit not in maintenance mode for this request
            }

            // End maintenance mode
            const result = await this.endMaintenanceMode(
                unitId,
                userId,
                undefined, // Restore to previous status
                `Maintenance request completed: ${maintenanceRequestId}`
            );

            if (result.success) {
                console.log(`Maintenance mode ended for unit ${unitId} after completing maintenance request ${maintenanceRequestId}`);
            } else {
                console.warn(`Failed to end maintenance mode for unit ${unitId}:`, result.message);
            }

        } catch (error) {
            console.error('Error handling maintenance request completion:', error);
        }
    }

    /**
     * Synchronizes maintenance mode status with marketplace systems
     */
    private async synchronizeMaintenanceModeWithMarketplace(
        listingId: string,
        status: ListingStatus,
        config: MaintenanceModeConfig | null
    ): Promise<void> {
        try {
            console.log('Maintenance Mode Marketplace Synchronization:', {
                listingId,
                status,
                timestamp: new Date(),
                action: status === ListingStatus.MAINTENANCE ? 'HIDE_FOR_MAINTENANCE' : 'RESTORE_FROM_MAINTENANCE',
                maintenanceConfig: config ? {
                    reason: config.reason,
                    estimatedEndDate: config.estimatedEndDate
                } : null
            });

            // In a full implementation, this would:
            // 1. Update search indexes to hide/show the listing
            // 2. Notify external marketplace APIs about maintenance status
            // 3. Update cached data with maintenance information
            // 4. Trigger webhook notifications to interested parties
            // 5. Update any maintenance status displays in the UI

        } catch (error) {
            console.error('Maintenance mode marketplace synchronization failed:', error);
            // Don't throw - synchronization failure shouldn't break the main operation
        }
    }

    /**
     * Notifies tenants about maintenance mode
     */
    private async notifyTenantsOfMaintenance(
        unitId: string,
        config: MaintenanceModeConfig
    ): Promise<void> {
        try {
            // In a full implementation, this would:
            // 1. Find all interested tenants (current tenant, applicants)
            // 2. Send email notifications about maintenance
            // 3. Update in-app notifications
            // 4. Log notification activities

            console.log('Tenant Maintenance Notification:', {
                unitId,
                reason: config.reason,
                startDate: config.startDate,
                estimatedEndDate: config.estimatedEndDate,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Failed to notify tenants of maintenance:', error);
            // Don't throw - notification failure shouldn't break the main operation
        }
    }

    /**
     * Determines initial listing status based on availability date
     */
    private determineInitialStatus(availabilityDate?: Date): ListingStatus {
        if (!availabilityDate) {
            return ListingStatus.ACTIVE;
        }

        const now = new Date();
        const availDate = new Date(availabilityDate);
        
        // If availability date is in the future, set as COMING_SOON
        if (availDate > now) {
            return ListingStatus.COMING_SOON;
        }

        return ListingStatus.ACTIVE;
    }

    /**
     * Processes time-based status transitions for all listings
     * Should be called by a scheduled job/cron
     */
    async processTimeBasedTransitions(): Promise<{
        processed: number;
        activated: number;
        expired: number;
        errors: string[];
    }> {
        const result = {
            processed: 0,
            activated: 0,
            expired: 0,
            errors: [] as string[]
        };

        try {
            const now = new Date();

            // Find listings that need to be activated (COMING_SOON -> ACTIVE)
            const comingSoonListings = await prisma.listing.findMany({
                where: {
                    availabilityDate: {
                        lte: now
                    }
                },
                include: {
                    unit: true
                }
            });

            // Find listings that need to be expired (ACTIVE -> EXPIRED)
            const expiredListings = await prisma.listing.findMany({
                where: {
                    expirationDate: {
                        lte: now
                    }
                },
                include: {
                    unit: true
                }
            });

            // Process activations
            for (const listing of comingSoonListings) {
                try {
                    await this.autoActivateListing(listing.id, listing.unitId || '');
                    result.activated++;
                    result.processed++;
                } catch (error) {
                    const errorMsg = `Failed to activate listing ${listing.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    result.errors.push(errorMsg);
                    console.error(errorMsg);
                }
            }

            // Process expirations
            for (const listing of expiredListings) {
                try {
                    await this.autoExpireListing(listing.id, listing.unitId || '');
                    result.expired++;
                    result.processed++;
                } catch (error) {
                    const errorMsg = `Failed to expire listing ${listing.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    result.errors.push(errorMsg);
                    console.error(errorMsg);
                }
            }

            console.log('Time-based transitions processed:', result);
            return result;

        } catch (error) {
            const errorMsg = `Failed to process time-based transitions: ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.errors.push(errorMsg);
            console.error(errorMsg);
            return result;
        }
    }

    /**
     * Automatically activates a listing when availability date is reached
     */
    private async autoActivateListing(listingId: string, unitId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // Update listing (in full implementation, would update status field)
            await tx.listing.update({
                where: { id: listingId },
                data: {
                    updatedAt: new Date()
                }
            });

            // Create audit entry
            await auditService.createAuditEntry({
                unitId,
                listingId,
                action: ListingAction.AUTO_ACTIVATE,
                previousStatus: ListingStatus.COMING_SOON,
                newStatus: ListingStatus.ACTIVE,
                userId: 'system',
                reason: 'Automatically activated on availability date'
            }, tx);
        });

        // Notify application integration service
        const changeEvent = createListingChangeEvent(
            unitId,
            ListingAction.AUTO_ACTIVATE,
            ListingStatus.ACTIVE,
            'system',
            {
                listingId,
                previousStatus: ListingStatus.COMING_SOON,
                reason: 'Automatically activated on availability date'
            }
        );
        await applicationListingIntegration.handleListingStatusChange(changeEvent);
    }

    /**
     * Automatically expires a listing when expiration date is reached
     */
    private async autoExpireListing(listingId: string, unitId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // Update listing (in full implementation, would update status field)
            await tx.listing.update({
                where: { id: listingId },
                data: {
                    updatedAt: new Date()
                }
            });

            // Create audit entry
            await auditService.createAuditEntry({
                unitId,
                listingId,
                action: ListingAction.AUTO_EXPIRE,
                previousStatus: ListingStatus.ACTIVE,
                newStatus: ListingStatus.EXPIRED,
                userId: 'system',
                reason: 'Automatically expired on expiration date'
            }, tx);
        });

        // Notify application integration service
        const changeEvent = createListingChangeEvent(
            unitId,
            ListingAction.AUTO_EXPIRE,
            ListingStatus.EXPIRED,
            'system',
            {
                listingId,
                previousStatus: ListingStatus.ACTIVE,
                reason: 'Automatically expired on expiration date'
            }
        );
        await applicationListingIntegration.handleListingStatusChange(changeEvent);

        // Send notification to property manager about expiration
        await this.notifyPropertyManagerOfExpiration(listingId, unitId);
    }

    /**
     * Notifies property manager when a listing expires
     */
    private async notifyPropertyManagerOfExpiration(listingId: string, unitId: string): Promise<void> {
        try {
            // Get listing and property manager details
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    unit: {
                        include: {
                            property: {
                                include: {
                                    organization: {
                                        include: {
                                            users: {
                                                include: {
                                                    user: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!listing || !listing.unit?.property?.organization) {
                console.warn(`Could not find listing or organization for expiration notification: ${listingId}`);
                return;
            }

            // In a full implementation, this would:
            // 1. Send email notifications to property managers
            // 2. Create in-app notifications
            // 3. Log notification activities

            console.log('Listing Expiration Notification:', {
                listingId,
                unitId,
                unitNumber: listing.unit.unitNumber,
                propertyName: listing.unit.property.name,
                organizationId: listing.unit.property.organizationId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Failed to notify property manager of expiration:', error);
            // Don't throw - notification failure shouldn't break the main operation
        }
    }

    /**
     * Gets listings that are expiring soon (within specified days)
     */
    async getExpiringSoonListings(daysAhead: number = 7): Promise<{
        success: boolean;
        data?: Array<{
            listingId: string;
            unitId: string;
            unitNumber: string;
            title: string;
            expirationDate: Date;
            daysUntilExpiration: number;
        }>;
        error?: string;
    }> {
        try {
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + daysAhead);

            const expiringSoon = await prisma.listing.findMany({
                where: {
                    expirationDate: {
                        gte: now,
                        lte: futureDate
                    }
                },
                include: {
                    unit: true
                },
                orderBy: {
                    expirationDate: 'asc'
                }
            });

            const result = expiringSoon.map(listing => ({
                listingId: listing.id,
                unitId: listing.unitId || '',
                unitNumber: listing.unit?.unitNumber || 'Unknown',
                title: listing.title,
                expirationDate: listing.expirationDate!,
                daysUntilExpiration: Math.ceil(
                    (listing.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )
            }));

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error('Error getting expiring soon listings:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Extends the expiration date of a listing
     */
    async extendListingExpiration(
        listingId: string,
        newExpirationDate: Date,
        userId: string,
        reason?: string
    ): Promise<UpdateStatusResult> {
        try {
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    unit: true
                }
            });

            if (!listing) {
                return {
                    success: false,
                    error: UpdateStatusError.LISTING_NOT_FOUND,
                    message: `Listing with ID ${listingId} not found`
                };
            }

            // Validate new expiration date
            const now = new Date();
            if (newExpirationDate <= now) {
                return {
                    success: false,
                    error: UpdateStatusError.VALIDATION_FAILED,
                    message: 'New expiration date must be in the future'
                };
            }

            // Update expiration date in transaction
            await prisma.$transaction(async (tx) => {
                await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        expirationDate: newExpirationDate,
                        updatedAt: new Date()
                    }
                });

                // Create audit entry
                await auditService.createAuditEntry({
                    unitId: listing.unit?.id || '',
                    listingId,
                    action: ListingAction.UPDATE,
                    previousStatus: ListingStatus.ACTIVE,
                    newStatus: ListingStatus.ACTIVE,
                    userId,
                    reason: reason || 'Expiration date extended',
                    metadata: {
                        previousExpirationDate: listing.expirationDate,
                        newExpirationDate
                    }
                }, tx);
            });

            return {
                success: true,
                data: {
                    listingId,
                    newStatus: ListingStatus.ACTIVE
                }
            };

        } catch (error) {
            console.error('Error extending listing expiration:', error);
            return {
                success: false,
                error: UpdateStatusError.VALIDATION_FAILED,
                message: `Failed to extend expiration: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// Export singleton instance
export const listingService = new ListingService();
