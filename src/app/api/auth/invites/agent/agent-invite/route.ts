// src/app/api/auth/invites/agent-invite/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser"; // ⚠️ verify exact file casing/name

export const runtime = "nodejs";

const INVITE_EXPIRY_HOURS = 1;

function getBaseUrl(request: Request) {
  const serverBase = process.env.APP_BASE_URL?.trim();
  if (serverBase) return serverBase.replace(/\/$/, "");

  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (publicBase) return publicBase.replace(/\/$/, "");

  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, "");
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
      now.getTime() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Raw token goes to URL, hash goes to DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const createdInvite = await prisma.$transaction(async (tx) => {
      // Cleanup expired invites for this tenant
      await tx.agentInvite.deleteMany({
        where: {
          tenantId: user.id,
          expiresAt: { lt: now },
        },
      });

      // Optional: uncomment to enforce only one active invite per tenant
      // await tx.agentInvite.deleteMany({
      //   where: {
      //     tenantId: user.id,
      //     expiresAt: { gte: now },
      //   },
      // });

      return tx.agentInvite.create({
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
        },
      });
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

    const baseUrl = getBaseUrl(request);
    const inviteUrl = new URL("/invite/agent-invitation", baseUrl);
    inviteUrl.searchParams.set("ref", rawToken);

    return NextResponse.json(
      {
        success: true,
        inviteId: createdInvite.id,
        inviteUrl: inviteUrl.toString(),
        expiresAt: createdInvite.expiresAt.toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
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
