// API endpoint for maintenance-listing integration operations
import { NextRequest, NextResponse } from "next/server";
import { maintenanceListingIntegration } from "@/lib/maintenance-listing-integration";
import { getCurrentUser } from "@/lib/Getcurrentuser";

/**
 * GET /api/maintenance/listing-integration
 * Get maintenance mode status for units
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unitId = searchParams.get('unitId');
        const organizationId = searchParams.get('organizationId');

        if (unitId) {
            // Get status for specific unit
            const status = await maintenanceListingIntegration.getMaintenanceListingStatus(unitId);
            return NextResponse.json(status);
        }

        if (organizationId) {
            // Get all units in maintenance mode for organization
            const units = await maintenanceListingIntegration.getUnitsInMaintenanceMode(organizationId);
            return NextResponse.json({ units });
        }

        return NextResponse.json({ error: "unitId or organizationId required" }, { status: 400 });

    } catch (error) {
        console.error("Error getting maintenance listing status:", error);
        return NextResponse.json(
            { error: "Failed to get maintenance status" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/maintenance/listing-integration
 * Start or end maintenance mode manually
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, unitId, reason, estimatedEndDate, maintenanceRequestId } = body;

        if (!action || !unitId) {
            return NextResponse.json(
                { error: "action and unitId are required" },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'start':
                if (!reason) {
                    return NextResponse.json(
                        { error: "reason is required for starting maintenance mode" },
                        { status: 400 }
                    );
                }
                
                result = await maintenanceListingIntegration.startMaintenanceModeManually(
                    unitId,
                    reason,
                    user.id,
                    estimatedEndDate ? new Date(estimatedEndDate) : undefined,
                    maintenanceRequestId
                );
                break;

            case 'end':
                result = await maintenanceListingIntegration.endMaintenanceModeManually(
                    unitId,
                    user.id,
                    reason
                );
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid action. Use 'start' or 'end'" },
                    { status: 400 }
                );
        }

        if (result.success) {
            return NextResponse.json({ success: true, message: result.message });
        } else {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error handling maintenance mode operation:", error);
        return NextResponse.json(
            { error: "Failed to process maintenance mode operation" },
            { status: 500 }
        );
    }
}
