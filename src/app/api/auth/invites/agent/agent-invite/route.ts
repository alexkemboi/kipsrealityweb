// src/app/api/auth/invites/agent-invite/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

const INVITE_EXPIRY_HOURS = 1;

function getBaseUrl(request: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  // Fallback if env is missing
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

    // Generate raw token (sent in URL)
    const rawToken = crypto.randomBytes(16).toString("hex"); // 32-char hex token

    // Hash token (stored in DB only)
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Optional cleanup: remove expired invites for this tenant (keeps table tidy)
    // Safe to ignore if none exist
    await prisma.agentInvite.deleteMany({
      where: {
        tenantId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    // Create invite (store hash only)
    const createdInvite = await prisma.agentInvite.create({
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

    // Build invite URL safely
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
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[AgentInvite.POST] Failed to generate invite:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate invite",
        message:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
