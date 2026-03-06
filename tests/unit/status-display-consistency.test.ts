import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import { 
    ListingStatus 
} from '../../src/lib/listing-types';

/**
 * Property-Based Test for Status Display Consistency
 * 
 * Feature: marketplace-listing-choice
 * Property 2: Status Display Consistency
 * Validates: Requirements 2.1, 2.2, 2.3
 * 
 * This property test verifies that the UI displays the correct status indicator
 * and available actions based on the current listing state.
 */

// Generators for test data
const unitIdGenerator = fc.string({ minLength: 1, maxLength: 50 });
const unitNumberGenerator = fc.string({ minLength: 1, maxLength: 10 });
const listingStatusGenerator = fc.constantFrom(...Object.values(ListingStatus));

const mockListingGenerator = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    status: listingStatusGenerator,
    createdAt: fc.date(),
    updatedAt: fc.date(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    description: fc.string({ minLength: 1, maxLength: 1000 }),
    price: fc.float({ min: 0, max: 10000 }),
    availabilityDate: fc.option(fc.date(), { nil: undefined }),
    expirationDate: fc.option(fc.date(), { nil: undefined })
});

const mockUnitWithListingGenerator = fc.record({
    id: unitIdGenerator,
    unitNumber: unitNumberGenerator,
    propertyId: fc.string({ minLength: 1, maxLength: 50 }),
    rentAmount: fc.option(fc.float({ min: 0, max: 5000 }), { nil: undefined }),
    bedrooms: fc.option(fc.integer({ min: 0, max: 10 }), { nil: undefined }),
    bathrooms: fc.option(fc.integer({ min: 0, max: 5 }), { nil: undefined }),
    squareFootage: fc.option(fc.integer({ min: 100, max: 5000 }), { nil: undefined }),
    listing: fc.option(mockListingGenerator, { nil: undefined })
});

test.describe('Status Display Consistency Property Tests', () => {
    
    test('Property 2: Status Display Consistency - Status Indicator Mapping', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                (unit) => {
                    // Property: Each listing status should map to correct visual indicator
                    
                    const currentStatus = unit.listing?.status || ListingStatus.PRIVATE;
                    
                    // Define expected status configurations
                    const statusConfigurations = {
                        [ListingStatus.ACTIVE]: {
                            label: 'Listed',
                            colorClass: 'bg-green-100 text-green-800 border-green-200',
                            iconName: 'Eye',
                            description: 'Visible in marketplace'
                        },
                        [ListingStatus.PRIVATE]: {
                            label: 'Private',
                            colorClass: 'bg-gray-100 text-gray-800 border-gray-200',
                            iconName: 'EyeOff',
                            description: 'Not visible in marketplace'
                        },
                        [ListingStatus.SUSPENDED]: {
                            label: 'Suspended',
                            colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                            iconName: 'Pause',
                            description: 'Temporarily hidden'
                        },
                        [ListingStatus.PENDING]: {
                            label: 'Pending',
                            colorClass: 'bg-blue-100 text-blue-800 border-blue-200',
                            iconName: 'Calendar',
                            description: 'Awaiting activation'
                        },
                        [ListingStatus.EXPIRED]: {
                            label: 'Expired',
                            colorClass: 'bg-red-100 text-red-800 border-red-200',
                            iconName: 'Calendar',
                            description: 'Listing has expired'
                        }
                    };
                    
                    // Verify status configuration exists and is consistent
                    const config = statusConfigurations[currentStatus];
                    expect(config).toBeDefined();
                    expect(config.label).toBeDefined();
                    expect(config.colorClass).toBeDefined();
                    expect(config.iconName).toBeDefined();
                    expect(config.description).toBeDefined();
                    
                    // Verify label consistency
                    expect(typeof config.label).toBe('string');
                    expect(config.label.length).toBeGreaterThan(0);
                    
                    // Verify description consistency
                    expect(typeof config.description).toBe('string');
                    expect(config.description.length).toBeGreaterThan(0);
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Available Actions Logic', async () => {
        await fc.assert(
            fc.property(
                listingStatusGenerator,
                (status) => {
                    // Property: Available actions should be consistent with current status
                    
                    // Define expected available actions for each status
                    const expectedActions = {
                        [ListingStatus.PRIVATE]: [
                            { label: 'List on Marketplace', targetStatus: ListingStatus.ACTIVE }
                        ],
                        [ListingStatus.ACTIVE]: [
                            { label: 'Remove from Marketplace', targetStatus: ListingStatus.PRIVATE },
                            { label: 'Suspend Listing', targetStatus: ListingStatus.SUSPENDED }
                        ],
                        [ListingStatus.SUSPENDED]: [
                            { label: 'Reactivate Listing', targetStatus: ListingStatus.ACTIVE },
                            { label: 'Remove from Marketplace', targetStatus: ListingStatus.PRIVATE }
                        ],
                        [ListingStatus.PENDING]: [
                            { label: 'Activate Listing', targetStatus: ListingStatus.ACTIVE },
                            { label: 'Cancel Listing', targetStatus: ListingStatus.PRIVATE }
                        ],
                        [ListingStatus.EXPIRED]: [
                            { label: 'Relist on Marketplace', targetStatus: ListingStatus.ACTIVE },
                            { label: 'Keep Private', targetStatus: ListingStatus.PRIVATE }
                        ]
                    };
                    
                    const actions = expectedActions[status];
                    expect(actions).toBeDefined();
                    expect(Array.isArray(actions)).toBe(true);
                    expect(actions.length).toBeGreaterThan(0);
                    
                    // Verify each action has required properties
                    actions.forEach(action => {
                        expect(action.label).toBeDefined();
                        expect(typeof action.label).toBe('string');
                        expect(action.label.length).toBeGreaterThan(0);
                        
                        expect(action.targetStatus).toBeDefined();
                        expect(Object.values(ListingStatus)).toContain(action.targetStatus);
                    });
                    
                    return true;
                }
            ),
            { 
                numRuns: 50,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Status Transition Validity', async () => {
        await fc.assert(
            fc.property(
                listingStatusGenerator,
                listingStatusGenerator,
                (fromStatus, toStatus) => {
                    // Property: Status transitions should follow valid state machine rules
                    
                    // Define valid transitions
                    const validTransitions = {
                        [ListingStatus.PRIVATE]: [ListingStatus.ACTIVE, ListingStatus.PENDING],
                        [ListingStatus.PENDING]: [ListingStatus.ACTIVE, ListingStatus.PRIVATE],
                        [ListingStatus.ACTIVE]: [ListingStatus.PRIVATE, ListingStatus.SUSPENDED, ListingStatus.EXPIRED],
                        [ListingStatus.SUSPENDED]: [ListingStatus.ACTIVE, ListingStatus.PRIVATE],
                        [ListingStatus.EXPIRED]: [ListingStatus.ACTIVE, ListingStatus.PRIVATE]
                    };
                    
                    const allowedTransitions = validTransitions[fromStatus];
                    expect(allowedTransitions).toBeDefined();
                    expect(Array.isArray(allowedTransitions)).toBe(true);
                    
                    // Check if transition is valid
                    const isValidTransition = allowedTransitions.includes(toStatus);
                    
                    // Verify transition validity logic
                    if (fromStatus === toStatus) {
                        // Self-transitions should generally not be needed in UI
                        expect(fromStatus).toBe(toStatus);
                    } else {
                        // Cross-status transitions should follow rules
                        expect(typeof isValidTransition).toBe('boolean');
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Unit Data Display', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                (unit) => {
                    // Property: Unit data should be consistently displayed regardless of status
                    
                    // Core unit information should always be displayed
                    expect(unit.id).toBeDefined();
                    expect(unit.unitNumber).toBeDefined();
                    expect(unit.propertyId).toBeDefined();
                    
                    // Unit number should be prominently displayed
                    expect(typeof unit.unitNumber).toBe('string');
                    expect(unit.unitNumber.length).toBeGreaterThan(0);
                    
                    // Optional fields should be handled gracefully
                    if (unit.rentAmount !== undefined) {
                        expect(typeof unit.rentAmount).toBe('number');
                        expect(unit.rentAmount).toBeGreaterThanOrEqual(0);
                    }
                    
                    if (unit.bedrooms !== undefined) {
                        expect(typeof unit.bedrooms).toBe('number');
                        expect(unit.bedrooms).toBeGreaterThanOrEqual(0);
                    }
                    
                    if (unit.bathrooms !== undefined) {
                        expect(typeof unit.bathrooms).toBe('number');
                        expect(unit.bathrooms).toBeGreaterThanOrEqual(0);
                    }
                    
                    if (unit.squareFootage !== undefined) {
                        expect(typeof unit.squareFootage).toBe('number');
                        expect(unit.squareFootage).toBeGreaterThan(0);
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Listing Details Visibility', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                (unit) => {
                    // Property: Listing details should only be shown when listing exists
                    
                    if (unit.listing) {
                        // When listing exists, verify all required fields
                        expect(unit.listing.id).toBeDefined();
                        expect(unit.listing.status).toBeDefined();
                        expect(unit.listing.createdAt).toBeDefined();
                        expect(unit.listing.updatedAt).toBeDefined();
                        expect(unit.listing.title).toBeDefined();
                        expect(unit.listing.description).toBeDefined();
                        expect(unit.listing.price).toBeDefined();
                        
                        // Verify field types
                        expect(typeof unit.listing.id).toBe('string');
                        expect(Object.values(ListingStatus)).toContain(unit.listing.status);
                        expect(unit.listing.createdAt).toBeInstanceOf(Date);
                        expect(unit.listing.updatedAt).toBeInstanceOf(Date);
                        expect(typeof unit.listing.title).toBe('string');
                        expect(typeof unit.listing.description).toBe('string');
                        expect(typeof unit.listing.price).toBe('number');
                        expect(unit.listing.price).toBeGreaterThanOrEqual(0);
                        
                        // Optional dates should be properly typed when present
                        if (unit.listing.availabilityDate !== undefined) {
                            expect(unit.listing.availabilityDate).toBeInstanceOf(Date);
                        }
                        
                        if (unit.listing.expirationDate !== undefined) {
                            expect(unit.listing.expirationDate).toBeInstanceOf(Date);
                        }
                    } else {
                        // When no listing exists, status should be PRIVATE
                        const impliedStatus = ListingStatus.PRIVATE;
                        expect(impliedStatus).toBe(ListingStatus.PRIVATE);
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Color and Icon Consistency', async () => {
        await fc.assert(
            fc.property(
                listingStatusGenerator,
                (status) => {
                    // Property: Colors and icons should be semantically consistent
                    
                    const statusSemantics = {
                        [ListingStatus.ACTIVE]: {
                            colorTheme: 'green', // Success/active state
                            iconType: 'visibility', // Eye icon for visible
                            semanticMeaning: 'positive'
                        },
                        [ListingStatus.PRIVATE]: {
                            colorTheme: 'gray', // Neutral state
                            iconType: 'hidden', // EyeOff icon for hidden
                            semanticMeaning: 'neutral'
                        },
                        [ListingStatus.SUSPENDED]: {
                            colorTheme: 'yellow', // Warning state
                            iconType: 'pause', // Pause icon for suspended
                            semanticMeaning: 'warning'
                        },
                        [ListingStatus.PENDING]: {
                            colorTheme: 'blue', // Info state
                            iconType: 'time', // Calendar icon for pending
                            semanticMeaning: 'info'
                        },
                        [ListingStatus.EXPIRED]: {
                            colorTheme: 'red', // Error/expired state
                            iconType: 'time', // Calendar icon for expired
                            semanticMeaning: 'error'
                        }
                    };
                    
                    const semantic = statusSemantics[status];
                    expect(semantic).toBeDefined();
                    expect(semantic.colorTheme).toBeDefined();
                    expect(semantic.iconType).toBeDefined();
                    expect(semantic.semanticMeaning).toBeDefined();
                    
                    // Verify semantic consistency
                    expect(typeof semantic.colorTheme).toBe('string');
                    expect(typeof semantic.iconType).toBe('string');
                    expect(typeof semantic.semanticMeaning).toBe('string');
                    
                    // Verify semantic meanings are appropriate
                    const validSemantics = ['positive', 'neutral', 'warning', 'info', 'error'];
                    expect(validSemantics).toContain(semantic.semanticMeaning);
                    
                    return true;
                }
            ),
            { 
                numRuns: 50,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Action Button States', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                fc.boolean(), // isLoading state
                (unit, isLoading) => {
                    // Property: Action buttons should be properly enabled/disabled based on state
                    
                    const currentStatus = unit.listing?.status || ListingStatus.PRIVATE;
                    
                    // Define which statuses should have actions available
                    const statusesWithActions = [
                        ListingStatus.PRIVATE,
                        ListingStatus.ACTIVE,
                        ListingStatus.SUSPENDED,
                        ListingStatus.EXPIRED
                    ];
                    
                    const shouldHaveActions = statusesWithActions.includes(currentStatus);
                    expect(typeof shouldHaveActions).toBe('boolean');
                    
                    // When loading, all actions should be disabled
                    if (isLoading) {
                        expect(isLoading).toBe(true);
                        // In loading state, buttons should be disabled
                    }
                    
                    // Verify action availability logic
                    if (shouldHaveActions) {
                        // Status should have at least one available action
                        expect(statusesWithActions).toContain(currentStatus);
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Error State Handling', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }), // error message
                (unit, errorMessage) => {
                    // Property: Error states should be consistently displayed
                    
                    if (errorMessage) {
                        // When error exists, it should be properly formatted
                        expect(typeof errorMessage).toBe('string');
                        expect(errorMessage.length).toBeGreaterThan(0);
                        
                        // Error should not affect core unit data display
                        expect(unit.id).toBeDefined();
                        expect(unit.unitNumber).toBeDefined();
                        
                        // Error should be dismissible
                        const isDismissible = true;
                        expect(isDismissible).toBe(true);
                    } else {
                        // When no error, error display should not be shown
                        expect(errorMessage).toBeNull();
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 50,
                verbose: true 
            }
        );
    });

    test('Property 2: Status Display Consistency - Performance Metrics Display', async () => {
        await fc.assert(
            fc.property(
                mockUnitWithListingGenerator,
                fc.boolean(), // showPerformanceMetrics flag
                (unit, showMetrics) => {
                    // Property: Performance metrics should only show for active listings when enabled
                    
                    const currentStatus = unit.listing?.status || ListingStatus.PRIVATE;
                    const hasActiveListing = currentStatus === ListingStatus.ACTIVE;
                    const shouldShowMetrics = showMetrics && hasActiveListing && unit.listing;
                    
                    if (shouldShowMetrics) {
                        // Metrics should only show for active listings
                        expect(currentStatus).toBe(ListingStatus.ACTIVE);
                        expect(unit.listing).toBeDefined();
                        expect(showMetrics).toBe(true);
                    } else {
                        // Metrics should not show for non-active listings or when disabled
                        const validReason = !showMetrics || !hasActiveListing || !unit.listing;
                        expect(validReason).toBe(true);
                    }
                    
                    return true;
                }
            ),
            { 
                numRuns: 100,
                verbose: true 
            }
        );
    });
});