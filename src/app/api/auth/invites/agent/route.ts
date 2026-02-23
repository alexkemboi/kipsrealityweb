// src/app/api/auth/invites/agent/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

type TokenPayload = {
  userId: string;
  role: string;
  organizationId: string;
};

function getBaseUrl(request: Request) {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, "");

  const url = new URL(request.url);
  return url.origin;
}

export async function POST(request: Request) {
  try {
    // --- 1) Verify auth token ---
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token) as TokenPayload;
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only tenants can invite agents
    if (payload.role !== "TENANT") {
      return NextResponse.json(
        { error: "Only tenants can invite agents" },
        { status: 403 }
      );
    }

    if (!payload.userId || !payload.organizationId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    // --- 2) Parse and validate request body ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, firstName, lastName, phone } = (body ?? {}) as {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedFirstName = firstName?.trim();
    const normalizedLastName = lastName?.trim() || null;
    const normalizedPhone = phone?.trim() || null;

    if (!normalizedEmail || !normalizedFirstName) {
      return NextResponse.json(
        { error: "Email and first name are required" },
        { status: 400 }
      );
    }

    // Basic email sanity check (lightweight)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // --- 3) Pre-checks ---
    // Prevent duplicate real users
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Verify tenant belongs to org (and is a tenant in that org)
    const tenant = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        organizationUsers: {
          some: {
            organizationId: payload.organizationId,
            role: "TENANT",
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Prevent duplicate pending invite to same email from same tenant (optional but recommended)
    // We check agent user by email + agentInvite tied to this tenant that is still pending.
    const existingPendingAgent = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        status: "INACTIVE",
        organizationUsers: {
          some: {
            organizationId: payload.organizationId,
            role: "AGENT",
          },
        },
      },
      select: {
        id: true,
        agentInvites: {
          where: {
            tenantId: payload.userId,
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          select: { id: true, expiresAt: true },
          take: 1,
        },
      },
    });

    if (existingPendingAgent?.agentInvites?.length) {
      return NextResponse.json(
        {
          error: "A pending agent invite already exists for this email",
          existingInvite: {
            id: existingPendingAgent.agentInvites[0].id,
            expiresAt: existingPendingAgent.agentInvites[0].expiresAt,
          },
        },
        { status: 409 }
      );
    }

    // --- 4) Atomic transaction ---
    const result = await prisma.$transaction(async (tx) => {
      // A) Create inactive AGENT user (placeholder password until acceptance)
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: "",
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          phone: normalizedPhone,
          status: "INACTIVE",
          emailVerified: null,
        },
      });

      // B) Link user to organization as AGENT
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: payload.organizationId,
          role: "AGENT",
        },
      });

      // C) Create invite token (store hash only)
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenHash = crypto
        .createHash("sha256")
        .update(inviteToken)
        .digest("hex");

      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // IMPORTANT: Link the invite to the created AGENT user for GET route consistency
      const agentInvite = await tx.agentInvite.create({
        data: {
          id: crypto.randomUUID(),
          inviteTokenHash,
          tenantId: payload.userId,
          userId: user.id, // <- keeps GET include(users) / mapping consistent
          expiresAt: inviteExpires,
          updatedAt: new Date(),
        },
      });

      return { user, agentInvite, inviteToken };
    });

    // --- 5) Build response ---
    // Align with your verify route pattern: /invite/agent-invitation?ref=<token>
    const baseUrl = getBaseUrl(request);
    const inviteLink = `${baseUrl}/invite/agent-invitation?ref=${encodeURIComponent(
      result.inviteToken
    )}`;

    return NextResponse.json({
      success: true,
      message: "Agent invited successfully",
      agent: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        status: result.user.status,
      },
      invite: {
        id: result.agentInvite.id,
        isUsed: result.agentInvite.isUsed,
        createdAt: result.agentInvite.createdAt,
        expiresAt: result.agentInvite.expiresAt,
      },
      // show raw invite link only in development
      inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
    });
  } catch (error) {
    console.error("Agent invite API failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- GET: list current tenant's agent invites ---
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token) as TokenPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "TENANT") {
      return NextResponse.json(
        { error: "Only tenants can view agent invites" },
        { status: 403 }
      );
    }

    const agentInvites = await prisma.agentInvite.findMany({
      where: {
        tenantId: payload.userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    const mappedInvites = agentInvites.map((inv) => ({
      id: inv.id,
      email: inv.users?.email ?? "",
      firstName: inv.users?.firstName ?? "",
      lastName: inv.users?.lastName ?? "",
      phone: inv.users?.phone ?? "",
      status: inv.users?.status ?? "UNKNOWN",
      isUsed: inv.isUsed,
      usedAt: inv.usedAt,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      hasLinkedUser: Boolean(inv.users),
    }));

    return NextResponse.json({
      success: true,
      invites: mappedInvites,
    });
  } catch (error) {
    console.error("List agent invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
