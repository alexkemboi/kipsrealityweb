// src/app/api/auth/invites/agent-invite/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

const INVITE_EXPIRY_HOURS = 1;

export async function POST() {
  try {
    const user = await getCurrentUser();

    console.log("Current user attempting to create invite:", user);

    if (!user || user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate 16-character secure token
    const rawToken = crypto.randomBytes(8).toString("hex");

    // Hash token before storing
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Expiry time
    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
    );

    console.log(`Creating invite for tenant (user) ID: ${user.id}`);

    // Store hashed token - connect to tenant relation
    await prisma.agentInvite.create({
      data: {
        inviteTokenHash: tokenHash,
        expiresAt,
        tenant: {
          connect: { id: user.id }
        }
      },
    });

    // Build invite URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/agent-invitation?ref=${rawToken}`;

    return NextResponse.json({
      inviteUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Invite generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invite" },
      { status: 500 }
    );
  }
}