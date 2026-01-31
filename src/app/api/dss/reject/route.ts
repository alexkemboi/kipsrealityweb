import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { documentId, reason } = await req.json();
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    let user;
    try {
      user = verifyAccessToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    // 1. Get document with lease info
    const doc = await prisma.dssDocument.findUnique({
      where: { id: documentId },
      include: {
        lease: true
      }
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 2. Update Document Status (need to add REJECTED to enum)
    // For now we'll use DECLINED status which exists
    const updatedDoc = await prisma.dssDocument.update({
      where: { id: documentId },
      data: { 
        status: "DECLINED",
        // Optional: Store the rejection reason in a metadata field or audit log
        // We could add a metadata JSON field later
      }
    });

    // 3. Audit Log (Crucial for legal defense) if lease exists
    if (doc.leaseId) {
      await prisma.leaseAuditLog.create({
        data: {
          id: crypto.randomUUID(),
          leaseId: doc.leaseId,
          action: "DOCUMENT_REJECTED",
          performedBy: user.userId,
          changes: { reason }
        }
      });
    }

    return NextResponse.json({ success: true, status: "DECLINED" });
  } catch (error) {
    console.error("[DSS Reject Error]", error);
    return NextResponse.json({ error: "Failed to reject document" }, { status: 500 });
  }
}