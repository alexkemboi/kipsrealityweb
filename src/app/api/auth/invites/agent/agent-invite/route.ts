// src/app/api/auth/invites/agent-invite/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser"; // ✅ verify file name casing in your project

export const runtime = "nodejs";

const INVITE_EXPIRY_HOURS = 1;

function getBaseUrl(request: Request) {
  // Prefer server-only env first
  const serverBase = process.env.APP_BASE_URL?.trim();
  if (serverBase) return serverBase.replace(/\/$/, "");

  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (publicBase) return publicBase.replace(/\/$/, "");

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

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Generate raw token (sent in URL)
    const rawToken = crypto.randomBytes(32).toString("hex"); // 64-char hex token

    // Hash token (stored in DB only)
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Cleanup + create in a transaction
    const createdInvite = await prisma.$transaction(async (tx) => {
      // Remove expired invites for this tenant
      await tx.agentInvite.deleteMany({
        where: {
          tenantId: user.id,
          expiresAt: { lt: now },
        },
      });

      // OPTIONAL: enforce only one active invite per tenant
      // Uncomment if this is your intended behavior:
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
