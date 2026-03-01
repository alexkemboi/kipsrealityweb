import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export const runtime = "nodejs";

const INVITE_EXPIRY_HOURS = 1;

function getBaseUrl(request: Request) {
  const serverBase = process.env["APP_BASE_URL"]?.trim();
  if (serverBase) return serverBase.replace(/\/$/, "");

  const publicBase = process.env["NEXT_PUBLIC_BASE_URL"]?.trim();
  if (publicBase) return publicBase.replace(/\/$/, "");

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tenant-only route
    if (user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Forbidden. Tenant access only." },
        { status: 403 }
      );
    }

    const now = new Date();

    // Optional cleanup: remove expired/used invites for this tenant (keeps table tidy)
    await prisma.agentInvite.deleteMany({
      where: {
        tenantId: user.id,
        OR: [{ isUsed: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    // If an active invite already exists, reuse it instead of creating duplicates
    const existingActiveInvite = await prisma.agentInvite.findFirst({
      where: {
        tenantId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        expiresAt: true,
        inviteTokenHash: true,
      },
    });

    // Invalidate old active invite so user gets a fresh link every time
    if (existingActiveInvite) {
      await prisma.agentInvite.delete({
        where: { id: existingActiveInvite.id },
      });
    }

    // Generate secure token (64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(
      now.getTime() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Create invite linked to tenant
    const invite = await prisma.agentInvite.create({
      data: {
        inviteTokenHash: tokenHash,
        expiresAt,
        tenant: {
          connect: { id: user.id },
        },
      },
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Build invite URL (matches your verify route flow: ?ref=token)
    const baseUrl = getBaseUrl(request);
    const inviteUrl = `${baseUrl}/invite/agent-invitation?ref=${encodeURIComponent(
      rawToken
    )}`;

    return NextResponse.json({
      success: true,
      inviteUrl,
      invite: {
        id: invite.id,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error: unknown) {
    console.error("[AgentInvite.POST] Failed to generate invite:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate invite",
      },
      { status: 500 }
    );
  }
}
