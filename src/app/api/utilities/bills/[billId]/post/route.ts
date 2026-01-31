// POST /api/utilities/bills/[billId]/post - Post a utility bill to accounting

import { NextRequest, NextResponse } from "next/server";
import { postUtilityBill } from "@/lib/utilities/utility-posting-service";

// Default organization ID - matches pattern used in finance routes
const DEFAULT_ORG_ID = "46e17dc1-137b-4e7a-a254-797a8ce16b0d";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ billId: string }> }
) {
    try {
        const { billId } = await params;

        // Get organization ID from request body or use default
        // TODO: In production, get from auth/session
        let organizationId = DEFAULT_ORG_ID;

        try {
            const body = await req.json();
            if (body?.organizationId) {
                organizationId = body.organizationId;
            }
        } catch {
            // No body or invalid JSON - use default org ID
        }

        // Use the backend posting service
        const result = await postUtilityBill(billId, organizationId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                billId: result.data.billId,
                status: result.data.status,
                journalEntryId: result.data.journalEntryId,
                blockchainHash: result.data.blockchainHash,
            },
        });
    } catch (error) {
        console.error("Post bill error:", error);
        return NextResponse.json(
            { success: false, error: "POST_FAILED", message: "Failed to post bill" },
            { status: 500 }
        );
    }
}
