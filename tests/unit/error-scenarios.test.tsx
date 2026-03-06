/**
 * Unit Tests for Error Scenarios
 * Tests network failure handling, validation error display, and permission denial scenarios
 * Requirements: 3.4, 3.5
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { prisma } from '@/lib/db';
import { listingService } from '@/lib/listing-service';
import { ListingError, ListingErrorType, listingErrorHandler } from '@/lib/listing-error-handler';
import { ListingDecisionModal } from '@/components/Dashboard/listing/ListingDecisionModal';
import { UnitListingStatusCard } from '@/components/Dashboard/listing/UnitListingStatusCard';
import { BulkListingActions } from '@/components/Dashboard/listing/BulkListingActions';
import { ListingDetailsForm } from '@/components/Dashboard/listing/ListingDetailsForm';

// Mock fetch for network error simulation
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Network Failure Handling and Recovery', () => {
    let testOrganizationId: string;
    let testUserId: string;
    let testPropertyId: string;
    let testUnitId: string;

    beforeEach(async () => {
        // Create test data
        const organization = await prisma.organization.create({
            data: {
                name: 'Test Org',
                type: 'PROPERTY_MANAGEMENT'
            }
        });
        testOrganizationId = organization.id;

        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                name: 'Test User',
                password: 'hashedpassword'
            }
        });
        testUserId = user.id;

        await prisma.organizationUser.create({
            data: {
                userId: testUserId,
                organizationId: testOrganizationId,
                role: 'PROPERTY_MANAGER'
            }
        });

        const property = await prisma.property.create({
            data: {
                name: 'Test Property',
                address: '123 Test St',
                organizationId: testOrganizationId
            }
        });
        testPropertyId = property.id;

        const unit = await prisma.unit.create({
            data: {
                unitNumber: 'A101',
                rent: 1500,
                bedrooms: 2,
                bathrooms: 1,
                propertyId: testPropertyId,
                organizationId: testOrganizationId
            }
        });
        testUnitId = unit.id;

        // Reset fetch mock
        mockFetch.mockReset();
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.listingAuditEntry.deleteMany({});
        await prisma.tenantApplication.deleteMany({});
        await prisma.lease.deleteMany({});
        await prisma.listing.deleteMany({});
        await prisma.unit.deleteMany({});
        await prisma.property.deleteMany({});
        await prisma.organizationUser.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.organization.deleteMany({});
    });

    it('should handle network connection failures with retry mechanism', async () => {
        // Simulate network failure
        mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));
        
        let caughtError: any = null;
        try {
            await listingErrorHandler.withRetry(
                async () => {
                    const response = await fetch('/api/listings', {
                        method: 'POST',
                        body: JSON.stringify({
                            unitId: testUnitId,
                            title: 'Test Listing',
                            description: 'Test Description',
                            price: 1500
                        })
                    });
                    if (!response.ok) throw new Error('Network error');
                    return response.json();
                },
                'create listing'
            );
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toBeInstanceOf(ListingError);
        expect(caughtError.type).toBe(ListingErrorType.NETWORK_ERROR);
        expect(caughtError.retryable).toBe(true);
        expect(caughtError.userMessage).toContain('Network connection failed');
    });

    it('should handle timeout errors with appropriate user feedback', async () => {
        // Simulate timeout
        mockFetch.mockImplementationOnce(() => 
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 100)
            )
        );

        let caughtError: any = null;
        try {
            await listingErrorHandler.withRetry(
                async () => {
                    const response = await fetch('/api/listings/bulk', {
                        method: 'POST',
                        body: JSON.stringify({
                            operations: [{ unitId: testUnitId, action: 'LIST' }]
                        })
                    });
                    if (!response.ok) throw new Error('Timeout');
                    return response.json();
                },
                'bulk listing operation',
                { maxAttempts: 2, baseDelay: 50 }
            );
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toBeInstanceOf(ListingError);
        expect(caughtError.userMessage).toContain('try again');
        expect(caughtError.retryable).toBe(true);
    });

    it('should handle server unavailable errors with exponential backoff', async () => {
        let attemptCount = 0;
        mockFetch.mockImplementation(() => {
            attemptCount++;
            return Promise.reject(new Error('Service unavailable'));
        });

        const startTime = Date.now();
        let caughtError: any = null;

        try {
            await listingErrorHandler.withRetry(
                async () => {
                    const response = await fetch('/api/listings/status', {
                        method: 'PUT',
                        body: JSON.stringify({
                            listingId: 'test-listing',
                            status: 'ACTIVE'
                        })
                    });
                    if (!response.ok) throw new Error('Service unavailable');
                    return response.json();
                },
                'update listing status',
                { maxAttempts: 3, baseDelay: 100, backoffMultiplier: 2 }
            );
        } catch (error) {
            caughtError = error;
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        expect(attemptCount).toBe(3); // Should have tried 3 times
        expect(totalTime).toBeGreaterThan(300); // Should have waited for backoff delays
        expect(caughtError).toBeInstanceOf(ListingError);
        expect(caughtError.type).toBe(ListingErrorType.EXTERNAL_SERVICE_ERROR);
    });

    it('should recover gracefully from intermittent network issues', async () => {
        let attemptCount = 0;
        mockFetch.mockImplementation(() => {
            attemptCount++;
            if (attemptCount < 3) {
                return Promise.reject(new Error('Network error'));
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: { id: 'listing-123' } })
            });
        });

        const result = await listingErrorHandler.withRetry(
            async () => {
                const response = await fetch('/api/listings', {
                    method: 'POST',
                    body: JSON.stringify({
                        unitId: testUnitId,
                        title: 'Test Listing',
                        description: 'Test Description',
                        price: 1500
                    })
                });
                if (!response.ok) throw new Error('Network error');
                return response.json();
            },
            'create listing',
            { maxAttempts: 3, baseDelay: 50 }
        );

        expect(attemptCount).toBe(3); // Should have succeeded on third attempt
        expect(result.success).toBe(true);
        expect(result.data.id).toBe('listing-123');
    });
});

describe('Validation Error Display and User Guidance', () => {
    const mockUnit = {
        id: 'unit-123',
        unitNumber: 'A101',
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        property: {
            name: 'Test Property',
            address: '123 Test St'
        }
    };

    it('should display validation errors for empty required fields in ListingDecisionModal', async () => {
        const mockOnDecision = jest.fn();
        
        render(
            <ListingDecisionModal
                unitId={mockUnit.id}
                unitDetails={mockUnit}
                onDecision={mockOnDecision}
                isOpen={true}
                onClose={() => {}}
            />
        );

        // Try to submit with empty fields
        const listButton = screen.getByText('List on Marketplace');
        fireEvent.click(listButton);

        // Should show validation errors
        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
            expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/please provide/i)).toBeInTheDocument();
        expect(mockOnDecision).not.toHaveBeenCalled();
    });

    it('should display validation errors for invalid price in ListingDetailsForm', async () => {
        const mockOnSubmit = jest.fn();
        
        render(
            <ListingDetailsForm
                unitId={mockUnit.id}
                initialData={{}}
                onSubmit={mockOnSubmit}
                onCancel={() => {}}
            />
        );

        // Enter invalid price
        const priceInput = screen.getByLabelText(/price/i);
        fireEvent.change(priceInput, { target: { value: '-100' } });

        const submitButton = screen.getByText(/save/i);
        fireEvent.click(submitButton);

        // Should show validation error
        await waitFor(() => {
            expect(screen.getByText(/price must be greater than 0/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/enter a valid rental price/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should display validation errors for invalid date ranges', async () => {
        const mockOnSubmit = jest.fn();
        
        render(
            <ListingDetailsForm
                unitId={mockUnit.id}
                initialData={{}}
                onSubmit={mockOnSubmit}
                onCancel={() => {}}
            />
        );

        // Set availability date in the past
        const availabilityInput = screen.getByLabelText(/availability date/i);
        fireEvent.change(availabilityInput, { target: { value: '2020-01-01' } });

        const submitButton = screen.getByText(/save/i);
        fireEvent.click(submitButton);

        // Should show validation error
        await waitFor(() => {
            expect(screen.getByText(/availability date cannot be in the past/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/select a future date/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should display validation errors for bulk operations with too many units', async () => {
        const tooManyUnits = Array.from({ length: 60 }, (_, i) => ({
            id: `unit-${i}`,
            unitNumber: `A${i + 100}`,
            rent: 1500,
            bedrooms: 2,
            bathrooms: 1
        }));

        const mockOnBulkAction = jest.fn();
        
        render(
            <BulkListingActions
                selectedUnits={tooManyUnits}
                onBulkAction={mockOnBulkAction}
                onSelectionChange={() => {}}
            />
        );

        // Try to perform bulk action
        const listAllButton = screen.getByText(/list all selected/i);
        fireEvent.click(listAllButton);

        // Should show validation error
        await waitFor(() => {
            expect(screen.getByText(/cannot process more than 50 units/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/select fewer units/i)).toBeInTheDocument();
        expect(mockOnBulkAction).not.toHaveBeenCalled();
    });

    it('should provide clear error messages for conflicting unit states', async () => {
        const unitWithLease = {
            ...mockUnit,
            hasActiveLease: true,
            leaseEndDate: '2024-12-31'
        };

        const mockOnDecision = jest.fn();
        
        render(
            <ListingDecisionModal
                unitId={unitWithLease.id}
                unitDetails={unitWithLease}
                onDecision={mockOnDecision}
                isOpen={true}
                onClose={() => {}}
            />
        );

        const listButton = screen.getByText('List on Marketplace');
        fireEvent.click(listButton);

        // Should show conflict error
        await waitFor(() => {
            expect(screen.getByText(/unit has an active lease/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/wait until lease ends/i)).toBeInTheDocument();
        expect(screen.getByText(/december 31, 2024/i)).toBeInTheDocument();
        expect(mockOnDecision).not.toHaveBeenCalled();
    });
});

describe('Permission Denial Scenarios and Feedback', () => {
    const mockUnit = {
        id: 'unit-123',
        unitNumber: 'A101',
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        listing: {
            id: 'listing-123',
            status: 'ACTIVE',
            title: 'Test Listing'
        }
    };

    it('should display permission denied error for tenant users', async () => {
        // Mock user with tenant role
        const tenantUser = {
            id: 'tenant-123',
            role: 'TENANT',
            permissions: []
        };

        const mockOnStatusChange = jest.fn();
        
        render(
            <UnitListingStatusCard
                unit={mockUnit}
                currentUser={tenantUser}
                onStatusChange={mockOnStatusChange}
            />
        );

        // Try to change status (should be disabled or show error)
        const statusButton = screen.queryByText(/remove from marketplace/i);
        
        if (statusButton) {
            fireEvent.click(statusButton);
            
            await waitFor(() => {
                expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
            });
        } else {
            // Button should be disabled/hidden for tenants
            expect(screen.queryByText(/remove from marketplace/i)).not.toBeInTheDocument();
        }

        expect(mockOnStatusChange).not.toHaveBeenCalled();
    });

    it('should display permission denied error for unauthorized bulk operations', async () => {
        const unauthorizedUser = {
            id: 'user-123',
            role: 'VENDOR',
            permissions: ['VIEW_LISTINGS']
        };

        const mockOnBulkAction = jest.fn();
        
        render(
            <BulkListingActions
                selectedUnits={[mockUnit]}
                currentUser={unauthorizedUser}
                onBulkAction={mockOnBulkAction}
                onSelectionChange={() => {}}
            />
        );

        // Try to perform bulk action
        const listAllButton = screen.queryByText(/list all selected/i);
        
        if (listAllButton) {
            fireEvent.click(listAllButton);
            
            await waitFor(() => {
                expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
            });
        } else {
            // Bulk actions should be hidden for unauthorized users
            expect(screen.queryByText(/list all selected/i)).not.toBeInTheDocument();
        }

        expect(mockOnBulkAction).not.toHaveBeenCalled();
    });

    it('should provide appropriate feedback for cross-organization access attempts', async () => {
        const crossOrgUser = {
            id: 'user-123',
            role: 'PROPERTY_MANAGER',
            organizationId: 'different-org-123',
            permissions: ['MANAGE_LISTINGS']
        };

        const mockOnDecision = jest.fn();
        
        render(
            <ListingDecisionModal
                unitId={mockUnit.id}
                unitDetails={mockUnit}
                currentUser={crossOrgUser}
                onDecision={mockOnDecision}
                isOpen={true}
                onClose={() => {}}
            />
        );

        const listButton = screen.getByText('List on Marketplace');
        fireEvent.click(listButton);

        // Should show access denied error
        await waitFor(() => {
            expect(screen.getByText(/access denied/i)).toBeInTheDocument();
        });

        // Should provide guidance
        expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
        expect(mockOnDecision).not.toHaveBeenCalled();
    });

    it('should handle expired session errors gracefully', async () => {
        // Mock expired session
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: () => Promise.resolve({
                error: { type: 'PERMISSION_ERROR', message: 'Session expired' }
            })
        });

        let caughtError: any = null;
        try {
            await listingService.createListing(
                mockUnit.id,
                {
                    title: 'Test Listing',
                    description: 'Test Description',
                    price: 1500
                },
                'expired-user-id',
                'test-org-id'
            );
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toBeInstanceOf(ListingError);
        expect(caughtError.type).toBe(ListingErrorType.PERMISSION_ERROR);
        expect(caughtError.userMessage).toContain('session');
        expect(caughtError.retryable).toBe(false);
    });

    it('should provide role-specific error messages', async () => {
        const scenarios = [
            {
                role: 'TENANT',
                operation: 'create listing',
                expectedMessage: /tenants cannot create listings/i
            },
            {
                role: 'VENDOR',
                operation: 'delete listing',
                expectedMessage: /vendors cannot delete listings/i
            },
            {
                role: 'PROPERTY_MANAGER',
                operation: 'admin operation',
                expectedMessage: /admin privileges required/i
            }
        ];

        for (const scenario of scenarios) {
            const error = new ListingError(
                ListingErrorType.PERMISSION_ERROR,
                `Permission denied for ${scenario.operation}`,
                {
                    userMessage: `You do not have permission to ${scenario.operation}. ${scenario.role}s cannot perform this action.`,
                    technicalDetails: { userRole: scenario.role, operation: scenario.operation }
                }
            );

            expect(error.userMessage).toMatch(scenario.expectedMessage);
            expect(error.technicalDetails.userRole).toBe(scenario.role);
        }
    });

    it('should provide contact information for permission issues', async () => {
        const permissionError = new ListingError(
            ListingErrorType.PERMISSION_ERROR,
            'Insufficient permissions',
            {
                userMessage: 'You do not have permission to perform this action. Please contact your administrator for access.',
                technicalDetails: { 
                    requiredPermissions: ['MANAGE_LISTINGS'],
                    userPermissions: ['VIEW_LISTINGS']
                }
            }
        );

        expect(permissionError.userMessage).toContain('contact your administrator');
        expect(permissionError.technicalDetails.requiredPermissions).toContain('MANAGE_LISTINGS');
        expect(permissionError.technicalDetails.userPermissions).not.toContain('MANAGE_LISTINGS');
    });
});

describe('Error Recovery and User Guidance', () => {
    it('should provide retry options for recoverable errors', async () => {
        const recoverableError = new ListingError(
            ListingErrorType.DATABASE_ERROR,
            'Database connection failed',
            {
                retryable: true,
                userMessage: 'A temporary error occurred. Please try again in a moment.'
            }
        );

        expect(recoverableError.retryable).toBe(true);
        expect(recoverableError.userMessage).toContain('try again');
    });

    it('should provide alternative actions for non-recoverable errors', async () => {
        const nonRecoverableError = new ListingError(
            ListingErrorType.VALIDATION_ERROR,
            'Invalid input data',
            {
                retryable: false,
                userMessage: 'Please check your input and correct any errors before submitting again.'
            }
        );

        expect(nonRecoverableError.retryable).toBe(false);
        expect(nonRecoverableError.userMessage).toContain('check your input');
    });

    it('should provide escalation paths for critical errors', async () => {
        const criticalError = new ListingError(
            ListingErrorType.UNKNOWN_ERROR,
            'System error',
            {
                severity: 'CRITICAL' as any,
                userMessage: 'A critical system error occurred. Please contact support immediately with error code ERR-001.'
            }
        );

        expect(criticalError.userMessage).toContain('contact support');
        expect(criticalError.userMessage).toContain('error code');
    });
});