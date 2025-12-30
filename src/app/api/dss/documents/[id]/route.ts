import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth"; // Adjust path if needed
import { cookies } from "next/headers";
import { canUserSignNow } from "@/lib/dss/workflow"; // The logic we built in Phase 2

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 Params are Promises
) {
  try {
    // 1. Get Document ID
    const { id: documentId } = await params;

    // 2. Authentication Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      // Decode token to get User ID and Email
      user = verifyAccessToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    // 3. Fetch Document & Participants
    const document = await prisma.dssDocument.findUnique({
      where: { id: documentId },
      include: {
        participants: {
          orderBy: { signingOrder: 'asc' } // Show list in order
        },
        organization: {
          select: { name: true } // Show org name
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 4. Access Control (Security Layer)
    // User must be a Participant OR the Org Admin who created it
    const isParticipant = document.participants.some(p => p.email === user.email);
    const isOwner = document.organizationId === user.organizationId; // Assuming token has orgId

    if (!isParticipant && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You are not a party to this document." }, { status: 403 });
    }

    // 5. Workflow Logic (The "Brain")
    // Ask workflow.ts: "Is it this specific user's turn right now?"
    let canSign = false;

    // Only check workflow if they are a participant (Admins can view but maybe not sign unless added)
    if (isParticipant) {
      canSign = await canUserSignNow(documentId, user.email);
    }

    // 6. Return Data
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        originalFileUrl: document.originalFileUrl, // Used by PDF Viewer
        currentStep: document.currentStep,
        participants: document.participants.map(p => ({
          name: p.name,
          email: p.email,
          role: p.role,
          status: p.hasSigned ? 'SIGNED' : 'PENDING',
          signedAt: p.signedAt
        }))
      },
      canSign: canSign // Frontend uses this to Enable/Disable the "Sign" button
    });

  } catch (error: unknown) {
    console.error("[DSS GET Doc Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}