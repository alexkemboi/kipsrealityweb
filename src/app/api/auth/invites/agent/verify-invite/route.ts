// src/app/api/auth/invites/agent/verify-invite/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Hash the provided token to match against stored hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the invite with the tenant (user) information
    const invite = await prisma.agentInvite.findUnique({
      where: {
        inviteTokenHash: tokenHash,
      },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Validate invite exists
    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite token", isValid: false },
        { status: 404 }
      );
    }

    // Check if already used
    if (invite.isUsed) {
      return NextResponse.json(
        { error: "Invite has already been used", isValid: false },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite has expired", isValid: false },
        { status: 400 }
      );
    }

    // Return invite data
    return NextResponse.json({
      isValid: true,
      token,
      organizationName: "", 
      invitedBy: `${invite.tenant.firstName || ""} ${invite.tenant.lastName || ""}`.trim() || invite.tenant.email,
      role: "Agent",
      email: invite.tenant.email,
      expiresAt: invite.expiresAt.toISOString(),
      tenantId: invite.tenant.id,
    });
  } catch (error) {
    console.error("Invite verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify invite", isValid: false },
      { status: 500 }
    );
  }
}