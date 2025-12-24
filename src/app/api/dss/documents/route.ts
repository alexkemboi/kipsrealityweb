import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDocument } from "@/lib/dss/document-service";
import { verifyAccessToken } from "@/lib/auth"; // Adjust path if needed
import { cookies } from "next/headers";
import { DssParticipantRole } from "@prisma/client";

export async function POST(req: Request) {
    try {
        // 1. Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // In production, uncomment verification:
        /*
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = verifyAccessToken(token); 
        // Ensure user.organizationId exists
        */

        // Mock Auth Data for Dev (Replace with real user.organizationId)
        // const mockOrgId = "54dda8b3-c986-4bc3-88d2-071146d2d941"; // Use one from your DB seeds

        // For Dev: Fetch first available organization if auth didn't provide one
        let orgId = "54dda8b3-c986-4bc3-88d2-071146d2d941"; // Default fallback
        const firstOrg = await prisma.organization.findFirst();
        if (firstOrg) {
            orgId = firstOrg.id;
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const participantsJson = formData.get("participants") as string;

        if (!file || !title || !participantsJson) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // 4. Parse Participants
        const participants = JSON.parse(participantsJson);

        // 5. Call Service
        const newDoc = await createDocument({
            title,
            // description: "Uploaded via DSS UI", // Not in interface I saw, let's omit or check if optional
            organizationId: orgId,
            fileBuffer,
            // fileName: file.name, // Not in interface I saw
            // mimeType: file.type, // Not in interface I saw
            participants: participants.map((p: any) => ({
                email: p.email,
                name: p.fullName, // Corrected to match CreateDocumentParams: name?: string
                role: p.role as DssParticipantRole,
                // userId: p.userId // Optional: link if user exists
            }))
        });

        return NextResponse.json({ success: true, data: newDoc });

    } catch (error: any) {
        console.error("[DSS Upload Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
