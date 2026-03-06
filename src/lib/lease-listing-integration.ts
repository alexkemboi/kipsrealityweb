// src/lib/lease-listing-integration.ts
import { prisma } from "@/lib/db";
import { ListingService } from "@/lib/listing-service";
import { ListingAction, ListingStatus } from "@/lib/listing-types";
import { auditService } from "@/lib/audit-service";
import { leaseNotificationService } from "@/lib/lease-notification-service";
import { Lease_leaseStatus } from "@prisma/client";

export class LeaseListingIntegration {
    private listingService: ListingService;

    constructor() {
        this.listingService = new ListingService();
    }

    /**
     * Handle lease activation - automatically remove unit from marketplace
     */
    async handleLeaseActivation(leaseId: string, userId?: string): Promise<void> {
        try {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                include: {
                    unit: {
                        include: {
                            listing: {
                                include: {
                                    status: true
                                }
                            }
                        }
                    },
                    property: {
                        include: {
                            manager: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            if (!lease || !lease.unit) {
                console.warn(`Lease ${leaseId} or associated unit not found`);
                return;
            }

            // If unit has an active listing, remove it
            if (lease.unit.listing && lease.unit.listing.status?.name === ListingStatus.ACTIVE) {
                const removeResult = await this.listingService.removeListing(
                    lease.unit.id,
                    userId || 'system',
                    'Automatic removal due to lease activation'
                );

                if (removeResult.success) {
                    // Send notification to property manager
                    const managerEmail = lease.property.manager?.user?.email;
                    if (managerEmail) {
                        await leaseNotificationService.sendLeaseActivationNotification(
                            managerEmail,
                            lease.unit.unitNumber,
                            lease.property.name || 'Property',
                            leaseId
                        );
                    }

                    // Create audit entry for the automatic removal
                    await auditService.createAuditEntry({
                        unitId: lease.unit.id,
                        listingId: lease.unit.listing.id,
                        action: ListingAction.REMOVE,
                        previousStatus: ListingStatus.ACTIVE,
                        newStatus: ListingStatus.PRIVATE,
                        userId: userId || 'system',
                        reason: 'Automatic removal due to lease activation',
                        metadata: { leaseId, trigger: 'lease_activation' }
                    });

                    console.log(`Removed listing for unit ${lease.unit.unitNumber} due to lease activation`);
                } else {
                    console.error(`Failed to remove listing for unit ${lease.unit.unitNumber}:`, removeResult.message);
                }
            }

            // Mark unit as occupied
            await prisma.unit.update({
                where: { id: lease.unit.id },
                data: { isOccupied: true }
            });

        } catch (error) {
            console.error(`Error handling lease activation for lease ${leaseId}:`, error);
            throw error;
        }
    }

    /**
     * Handle lease expiration - prompt property manager for listing decision
     */
    async handleLeaseExpiration(leaseId: string, userId?: string): Promise<void> {
        try {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                include: {
                    unit: true,
                    property: {
                        include: {
                            manager: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            if (!lease || !lease.unit) {
                console.warn(`Lease ${leaseId} or associated unit not found`);
                return;
            }

            // Mark unit as not occupied
            await prisma.unit.update({
                where: { id: lease.unit.id },
                data: { isOccupied: false }
            });

            // Create audit entry for lease expiration
            await auditService.createAuditEntry({
                unitId: lease.unit.id,
                action: ListingAction.UPDATE,
                previousStatus: ListingStatus.PRIVATE,
                newStatus: ListingStatus.PRIVATE,
                userId: userId || 'system',
                reason: 'Unit available due to lease expiration',
                metadata: { leaseId, trigger: 'lease_expiration' }
            });

            // Send listing decision prompt to property manager
            const managerEmail = lease.property.manager?.user?.email;
            if (managerEmail) {
                await leaseNotificationService.sendLeaseExpirationNotification(
                    managerEmail,
                    lease.unit.unitNumber,
                    lease.property.name || 'Property',
                    lease.unit.id,
                    leaseId
                );
            }

            console.log(`Processed lease expiration for unit ${lease.unit.unitNumber}`);

        } catch (error) {
            console.error(`Error handling lease expiration for lease ${leaseId}:`, error);
            throw error;
        }
    }

    /**
     * Handle lease termination (early termination)
     */
    async handleLeaseTermination(leaseId: string, userId?: string): Promise<void> {
        try {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                include: {
                    unit: true,
                    property: {
                        include: {
                            manager: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            if (!lease || !lease.unit) {
                console.warn(`Lease ${leaseId} or associated unit not found`);
                return;
            }

            // Mark unit as not occupied
            await prisma.unit.update({
                where: { id: lease.unit.id },
                data: { isOccupied: false }
            });

            // Create audit entry for lease termination
            await auditService.createAuditEntry({
                unitId: lease.unit.id,
                action: ListingAction.UPDATE,
                previousStatus: ListingStatus.PRIVATE,
                newStatus: ListingStatus.PRIVATE,
                userId: userId || 'system',
                reason: 'Unit available due to lease termination',
                metadata: { leaseId, trigger: 'lease_termination' }
            });

            // Send listing decision prompt to property manager
            const managerEmail = lease.property.manager?.user?.email;
            if (managerEmail) {
                await leaseNotificationService.sendLeaseTerminationNotification(
                    managerEmail,
                    lease.unit.unitNumber,
                    lease.property.name || 'Property',
                    lease.unit.id,
                    leaseId
                );
            }

            console.log(`Processed lease termination for unit ${lease.unit.unitNumber}`);

        } catch (error) {
            console.error(`Error handling lease termination for lease ${leaseId}:`, error);
            throw error;
        }
    }

    /**
     * Handle any lease status change - main entry point for lease lifecycle management
     */
    async handleLeaseStatusChange(
        leaseId: string, 
        newStatus: Lease_leaseStatus, 
        previousStatus: Lease_leaseStatus | null,
        userId?: string
    ): Promise<void> {
        try {
            console.log(`Processing lease status change: ${leaseId} from ${previousStatus} to ${newStatus}`);

            switch (newStatus) {
                case 'ACTIVE':
                    // When lease becomes active, remove unit from marketplace
                    await this.handleLeaseActivation(leaseId, userId);
                    break;

                case 'EXPIRED':
                    // When lease expires, prompt for listing decision
                    await this.handleLeaseExpiration(leaseId, userId);
                    break;

                case 'TERMINATED':
                    // When lease is terminated, prompt for listing decision
                    await this.handleLeaseTermination(leaseId, userId);
                    break;

                case 'SIGNED':
                    // When lease is signed but not yet active, prepare for activation
                    await this.prepareForLeaseActivation(leaseId, userId);
                    break;

                default:
                    // For other statuses (DRAFT, PENDING_APPROVAL, etc.), no action needed
                    console.log(`No listing action required for lease status: ${newStatus}`);
                    break;
            }

        } catch (error) {
            console.error(`Error handling lease status change for lease ${leaseId}:`, error);
            throw error;
        }
    }

    /**
     * Prepare for lease activation (when lease is signed but not yet active)
     */
    private async prepareForLeaseActivation(leaseId: string, userId?: string): Promise<void> {
        try {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                include: {
                    unit: {
                        include: {
                            listing: {
                                include: {
                                    status: true
                                }
                            }
                        }
                    },
                    property: {
                        include: {
                            manager: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            if (!lease || !lease.unit) {
                console.warn(`Lease ${leaseId} or associated unit not found`);
                return;
            }

            // If unit has an active listing, send notification that it will be removed when lease activates
            if (lease.unit.listing) {
                const managerEmail = lease.property.manager?.user?.email;
                if (managerEmail) {
                    await leaseNotificationService.sendLeaseSignedNotification(
                        managerEmail,
                        lease.unit.unitNumber,
                        lease.property.name || 'Property',
                        lease.startDate,
                        leaseId
                    );
                }
            }

            console.log(`Prepared for lease activation for unit ${lease.unit.unitNumber}`);

        } catch (error) {
            console.error(`Error preparing for lease activation for lease ${leaseId}:`, error);
            throw error;
        }
    }

    /**
     * Check for units that need listing decisions after lease changes
     * This can be called periodically or triggered by lease status changes
     */
    async processUnitsNeedingListingDecisions(): Promise<void> {
        try {
            // Find units that are not occupied, have no active listing, and had a recent lease change
            const unitsNeedingDecision = await prisma.unit.findMany({
                where: {
                    isOccupied: false,
                    listing: null,
                    leases: {
                        some: {
                            leaseStatus: { in: ['EXPIRED', 'TERMINATED'] },
                            updatedAt: {
                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Within last 7 days
                            }
                        }
                    }
                },
                include: {
                    property: {
                        include: {
                            manager: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    leases: {
                        where: {
                            leaseStatus: { in: ['EXPIRED', 'TERMINATED'] }
                        },
                        orderBy: {
                            updatedAt: 'desc'
                        },
                        take: 1
                    }
                }
            });

            // Batch process notifications
            const notifications = unitsNeedingDecision
                .filter(unit => unit.property.manager?.user?.email)
                .map(unit => ({
                    type: unit.leases[0]?.leaseStatus === 'EXPIRED' ? 'expiration' as const : 'termination' as const,
                    managerEmail: unit.property.manager!.user!.email,
                    unitNumber: unit.unitNumber,
                    propertyName: unit.property.name || 'Property',
                    unitId: unit.id,
                    leaseId: unit.leases[0].id
                }));

            if (notifications.length > 0) {
                await leaseNotificationService.sendBatchNotifications(notifications);
            }

            console.log(`Processed ${unitsNeedingDecision.length} units needing listing decisions`);

        } catch (error) {
            console.error('Error processing units needing listing decisions:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const leaseListingIntegration = new LeaseListingIntegration();
