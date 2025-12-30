import { NextResponse } from "next/server";
import { signDocument } from "@/lib/dss/document-service";
import { verifyAccessToken } from "@/lib/auth"; // Adjust path if needed
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = verifyAccessToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { documentId, signatureData } = body;

    if (!documentId || !signatureData) {
      return NextResponse.json({ error: "Missing document ID or signature data" }, { status: 400 });
    }

    // 3. Call Service (The "Manager" we built in Phase 2)
    // This handles validation, DB updates, and workflow progression
    const result = await signDocument(documentId, user.email, signatureData);

    return NextResponse.json({
      success: true,
      status: result.result.status // "IN_PROGRESS" or "COMPLETED"
    });

  } catch (error: unknown) {
    console.error("[DSS Signing Error]", error);
    // Return explicit error messages (e.g. "Not your turn")
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signing failed" }, { status: 400 });
  }
}