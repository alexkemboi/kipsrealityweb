import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextRequest, NextResponse } from "next/server";
import { LeaseDocument_documentType, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

// POST: Upload a lease document
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leaseId } = await params;

    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentTypeStr = formData.get("documentType") as string;
    const description = formData.get("description") as string;

    if (!file || !documentTypeStr) {
      return NextResponse.json({ error: "Missing file or documentType" }, { status: 400 });
    }

    const documentType = LeaseDocument_documentType[documentTypeStr as keyof typeof LeaseDocument_documentType];

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true },
    });
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    const fileUrl = `https://storage.example.com/leases/${leaseId}/${file.name}`;

    const document = await prisma.leaseDocument.create({
      data: {
        id: randomUUID(),
        leaseId,
        documentType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: user.id,
        description,
      } as Prisma.LeaseDocumentUncheckedCreateInput,
    });

    // Update lease metadata
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        documentVersion: { increment: 1 },
        lastDocumentUpdate: new Date(),
      },
    });

    // Audit log
    await prisma.leaseAuditLog.create({
      data: {
        id: randomUUID(),
        leaseId,
        action: "DOCUMENT_UPLOADED",
        performedBy: user.id,
        changes: document as Prisma.InputJsonValue,
      } as Prisma.LeaseAuditLogUncheckedCreateInput,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Fetch all documents for a lease
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leaseId } = await params;

    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documents = await prisma.leaseDocument.findMany({
      where: { leaseId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("Fetch lease documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
