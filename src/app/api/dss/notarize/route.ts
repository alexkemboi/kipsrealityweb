import { NextResponse } from "next/server";
import { notarizeDocument } from "@/lib/dss/notary-service";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Admins/Managers Only)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // Simple mock auth check if verifyAccessToken isn't fully set up for this route yet
        // In production, uncomment the verify logic:
        // TODO: [Security] Re-enable RBAC before production
        /*
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = verifyAccessToken(token); 
        if (user.role !== 'PROPERTY_MANAGER' && user.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        */

        // 2. Parse ID
        const body = await req.json();
        const { documentId } = body;

        if (!documentId) {
            return NextResponse.json({ error: "documentId is required" }, { status: 400 });
        }

        // 3. Execute Notarization
        const record = await notarizeDocument(documentId);

        return NextResponse.json({
            success: true,
            data: record
        });

    } catch (error: any) {
        console.error("[API] Notarize Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
