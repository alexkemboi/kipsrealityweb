// Cron job endpoint for automated lease integration processing
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leaseListingIntegration } from "@/lib/lease-listing-integration";

export async function POST(req: NextRequest) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = req.headers.get('authorization');
        const expectedToken = process.env.CRON_SECRET;
        
        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("🤖 Starting automated lease integration processing...");

        const results = {
            leasesToExpire: 0,
            leasesToActivate: 0,
            unitsNeedingDecisions: 0,
            errors: [] as string[]
        };

        try {
            // 1. Process leases that should expire
            await processExpiringLeases(results);
            
            // 2. Process leases that should activate
            await processActivatingLeases(results);
            
            // 3. Process units needing listing decisions
            await processUnitsNeedingDecisions(results);

            console.log("✅ Lease integration processing completed:", results);

            return NextResponse.json({
                success: true,
                message: "Lease integration processing completed",
                results
            });

        } catch (error) {
            console.error("❌ Lease integration processing error:", error);
            results.errors.push(error instanceof Error ? error.message : 'Unknown error');
            
            return NextResponse.json({
                success: false,
                message: "Lease integration processing completed with errors",
                results
            }, { status: 500 });
        }

    } catch (error) {
        console.error("❌ Cron job error:", error);
        return NextResponse.json(
            { error: "Failed to process lease integration" },
            { status: 500 }
        );
    }
}

async function processExpiringLeases(results: any): Promise<void> {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Find leases that should be expired
    const leasesToExpire = await prisma.lease.findMany({
        where: { 
            endDate: { lt: today }, 
            leaseStatus: { in: ["ACTIVE", "EXPIRING_SOON"] } 
        },
        select: { id: true, leaseStatus: true }
    });

    results.leasesToExpire = leasesToExpire.length;

    // Process each lease individually
    for (const lease of leasesToExpire) {
        try {
            const previousStatus = lease.leaseStatus;
            
            // Update lease status
            await prisma.lease.update({
                where: { id: lease.id },
                data: { leaseStatus: "EXPIRED" }
            });

            // Handle listing integration
            await leaseListingIntegration.handleLeaseStatusChange(
                lease.id,
                "EXPIRED",
                previousStatus,
                'system'
            );

            console.log(`✅ Processed expired lease: ${lease.id}`);

        } catch (error) {
            console.error(`❌ Error processing expired lease ${lease.id}:`, error);
            results.errors.push(`Failed to process expired lease ${lease.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

async function processActivatingLeases(results: any): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find leases that should be activated
    const leasesToActivate = await prisma.lease.findMany({
        where: {
            startDate: { lte: today },
            leaseStatus: "SIGNED",
            landlordSignedAt: { not: null },
            tenantSignedAt: { not: null },
        },
        select: { id: true, leaseStatus: true }
    });

    results.leasesToActivate = leasesToActivate.length;

    // Process each lease individually
    for (const lease of leasesToActivate) {
        try {
            const previousStatus = lease.leaseStatus;
            
            // Update lease status
            await prisma.lease.update({
                where: { id: lease.id },
                data: { leaseStatus: "ACTIVE" }
            });

            // Handle listing integration
            await leaseListingIntegration.handleLeaseStatusChange(
                lease.id,
                "ACTIVE",
                previousStatus,
                'system'
            );

            console.log(`✅ Processed activated lease: ${lease.id}`);

        } catch (error) {
            console.error(`❌ Error processing activated lease ${lease.id}:`, error);
            results.errors.push(`Failed to process activated lease ${lease.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

async function processUnitsNeedingDecisions(results: any): Promise<void> {
    try {
        // Use the existing method from lease listing integration
        await leaseListingIntegration.processUnitsNeedingListingDecisions();
        
        // Count units that need decisions (for reporting)
        const unitsNeedingDecision = await prisma.unit.count({
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
            }
        });

        results.unitsNeedingDecisions = unitsNeedingDecision;
        console.log(`✅ Processed ${unitsNeedingDecision} units needing listing decisions`);

    } catch (error) {
        console.error(`❌ Error processing units needing decisions:`, error);
        results.errors.push(`Failed to process units needing decisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// GET endpoint for manual testing/monitoring
export async function GET(req: NextRequest) {
    try {
        const today = new Date();
        
        // Get counts for monitoring
        const stats = {
            activeLeasesCount: await prisma.lease.count({
                where: { leaseStatus: "ACTIVE" }
            }),
            expiringLeases: await prisma.lease.count({
                where: { 
                    endDate: { lt: today }, 
                    leaseStatus: { in: ["ACTIVE", "EXPIRING_SOON"] } 
                }
            }),
            signedLeasesToActivate: await prisma.lease.count({
                where: {
                    startDate: { lte: today },
                    leaseStatus: "SIGNED",
                    landlordSignedAt: { not: null },
                    tenantSignedAt: { not: null },
                }
            }),
            unitsNeedingDecisions: await prisma.unit.count({
                where: {
                    isOccupied: false,
                    listing: null,
                    leases: {
                        some: {
                            leaseStatus: { in: ['EXPIRED', 'TERMINATED'] },
                            updatedAt: {
                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    }
                }
            })
        };

        return NextResponse.json({
            success: true,
            message: "Lease integration status",
            stats,
            timestamp: new Date()
        });

    } catch (error) {
        console.error("Error getting lease integration status:", error);
        return NextResponse.json(
            { error: "Failed to get status" },
            { status: 500 }
        );
    }
}