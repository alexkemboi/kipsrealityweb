// src/app/api/auth/invites/agent-invite/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

const INVITE_EXPIRY_HOURS = 1;

function getBaseUrl(request: Request) {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // NOTE:
    // We CANNOT reconstruct the raw token from the hash, so we only "reuse" logically.
    // If you want to actually return the same link again, store raw token encrypted (not recommended)
    // or always create a fresh invite (what we do below).
    if (existingActiveInvite) {
      // Invalidate old active invite so user gets a fresh link every time
      await prisma.agentInvite.delete({
        where: { id: existingActiveInvite.id },
      });
    }

    // Generate secure token (64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Expiry time
    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Create invite linked to tenant
    const invite = await prisma.agentInvite.create({
      data: {
        id: crypto.randomUUID(), // safe even if schema has default
        inviteTokenHash: tokenHash,
        expiresAt,
        updatedAt: new Date(),
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
  } catch (error) {
    console.error("Invite generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invite" },
      { status: 500 }
    );
  }
}
