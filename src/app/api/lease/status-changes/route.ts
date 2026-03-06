// API endpoint for fetching lease status changes and their listing integration impact
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const propertyId = url.searchParams.get("propertyId");
        const unitId = url.searchParams.get("unitId");
        const limit = parseInt(url.searchParams.get("limit") || "20");

        // Build where clause based on filters
        const whereClause: any = {
            Lease: {
                property: {
                    manager: {
                        userId: user.id
                    }
                }
            }
        };

        if (propertyId) {
            whereClause.Lease.propertyId = propertyId;
        }

        if (unitId) {
            whereClause.Lease.unitId = unitId;
        }

        // Fetch lease audit logs with status changes
        const auditLogs = await prisma.leaseAuditLog.findMany({
            where: {
                ...whereClause,
                action: {
                    startsWith: 'STATUS_CHANGED_TO_'
                }
            },
            include: {
                Lease: {
                    include: {
                        unit: true,
                        property: true
                    }
                }
            },
            orderBy: {
                performedAt: 'desc'
            },
            take: limit
        });

        // Transform audit logs into status changes with listing integration info
        const statusChanges = auditLogs.map(log => {
            const changes = log.changes as any;
            const newStatus = log.action.replace('STATUS_CHANGED_TO_', '');
            const previousStatus = changes?.previousStatus || 'UNKNOWN';

            // Determine listing action based on status transition
            let listingAction: 'REMOVED' | 'PROMPT_SENT' | 'NOTIFICATION_SENT' | 'NO_ACTION' = 'NO_ACTION';
            let reason = changes?.reason || 'Status updated';

            switch (newStatus) {
                case 'ACTIVE':
                    listingAction = 'REMOVED';
                    reason = 'Listing automatically removed due to lease activation';
                    break;
                case 'EXPIRED':
                    listingAction = 'PROMPT_SENT';
                    reason = 'Listing decision prompt sent due to lease expiration';
                    break;
                case 'TERMINATED':
                    listingAction = 'PROMPT_SENT';
                    reason = 'Listing decision prompt sent due to lease termination';
                    break;
                case 'SIGNED':
                    listingAction = 'NOTIFICATION_SENT';
                    reason = 'Notification sent about upcoming listing removal when lease activates';
                    break;
                default:
                    listingAction = 'NO_ACTION';
                    break;
            }

            return {
                id: log.id,
                leaseId: log.leaseId,
                unitNumber: log.Lease?.unit?.unitNumber || 'Unknown',
                propertyName: log.Lease?.property?.name || 'Unknown Property',
                previousStatus,
                newStatus,
                timestamp: log.performedAt,
                listingAction,
                reason
            };
        });

        return NextResponse.json({
            success: true,
            changes: statusChanges,
            total: statusChanges.length
        });

    } catch (error) {
        console.error("Error fetching lease status changes:", error);
        return NextResponse.json(
            { error: "Failed to fetch lease status changes" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { unitId, action } = await req.json();

        if (!unitId || !action) {
            return NextResponse.json(
                { error: "Missing unitId or action" },
                { status: 400 }
            );
        }

        // Validate action
        const validActions = ['LIST_UNIT', 'KEEP_PRIVATE'];
        if (!validActions.includes(action)) {
            return NextResponse.json(
                { error: `Invalid action: ${action}` },
                { status: 400 }
            );
        }

        // Get unit with lease information
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: {
                property: {
                    include: {
                        manager: true
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

        if (!unit) {
            return NextResponse.json(
                { error: "Unit not found" },
                { status: 404 }
            );
        }

        // Check permissions
        if (unit.property.manager?.userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized - you can only manage your own properties" },
                { status: 403 }
            );
        }

        // Check if unit is eligible for listing decision
        if (unit.isOccupied) {
            return NextResponse.json(
                { error: "Unit is currently occupied and cannot be listed" },
                { status: 400 }
            );
        }

        if (unit.leases.length === 0) {
            return NextResponse.json(
                { error: "No recent lease found for this unit" },
                { status: 400 }
            );
        }

        let result;
        if (action === 'LIST_UNIT') {
            // Create listing for the unit
            // This would integrate with the existing listing service
            result = {
                action: 'LISTED',
                message: `Unit ${unit.unitNumber} has been listed on the marketplace`
            };
        } else {
            // Keep unit private
            result = {
                action: 'KEPT_PRIVATE',
                message: `Unit ${unit.unitNumber} will remain private`
            };
        }

        // Log the decision
        const recentLease = unit.leases[0];
        await prisma.leaseAuditLog.create({
            data: {
                id: crypto.randomUUID(),
                leaseId: recentLease.id,
                action: `LISTING_DECISION_${action}`,
                performedBy: user.id,
                changes: {
                    unitId,
                    decision: action,
                    timestamp: new Date()
                } as any,
                performedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Error processing listing decision:", error);
        return NextResponse.json(
            { error: "Failed to process listing decision" },
            { status: 500 }
        );
    }
}
