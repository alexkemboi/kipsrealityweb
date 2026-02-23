// src/app/api/auth/invites/agent/verify-invite/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

type VerifyInviteBody = {
  token?: string;
};

export async function POST(request: Request) {
  try {
    let body: VerifyInviteBody;

    try {
      body = (await request.json()) as VerifyInviteBody;
    } catch {
      return NextResponse.json(
        { success: false, isValid: false, error: "Invalid JSON body" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json(
        { success: false, isValid: false, error: "Token is required" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Hash incoming raw token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find invite + tenant info
    const invite = await prisma.agentInvite.findUnique({
      where: {
        inviteTokenHash: tokenHash,
      },
      select: {
        id: true,
        isUsed: true,
        expiresAt: true,
        tenantId: true,
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

    if (!invite) {
      return NextResponse.json(
        { success: false, isValid: false, error: "Invalid invite token" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!invite.tenant) {
      return NextResponse.json(
        { success: false, isValid: false, error: "Invite tenant not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (invite.isUsed) {
      return NextResponse.json(
        { success: false, isValid: false, error: "Invite has already been used" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const now = new Date();
    if (invite.expiresAt <= now) {
      return NextResponse.json(
        { success: false, isValid: false, error: "Invite has expired" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const invitedBy =
      `${invite.tenant.firstName ?? ""} ${invite.tenant.lastName ?? ""}`.trim() ||
      invite.tenant.email;

    return NextResponse.json(
      {
        success: true,
        isValid: true,
        invite: {
          id: invite.id,
          role: "AGENT",
          roleLabel: "Agent",
          invitedBy,
          email: invite.tenant.email, // tenant email (used for display)
          tenantId: invite.tenant.id,
          expiresAt: invite.expiresAt.toISOString(),
          organizationName: "", // placeholder until agentInvite stores org context
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    console.error("[AgentVerifyInvite.POST] Invite verification error:", error);

    return NextResponse.json(
      {
        success: false,
        isValid: false,
        error: "Failed to verify invite",
        message: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
