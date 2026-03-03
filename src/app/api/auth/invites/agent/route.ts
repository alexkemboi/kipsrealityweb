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

export async function POST(request: Request) {
  try {
    // --- 1. Verify token ---
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // --- 2. Parse request body ---
    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, firstName, lastName, phone } = body;
    if (!email || !firstName) {
      return NextResponse.json({ error: "Email and first name are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // --- 3. Pre-Checks ---
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Verify the tenant exists and belongs to the organization
    const tenant = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        organizationUsers: {
          some: {
            organizationId: payload.organizationId,
            role: "TENANT"
          }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // --- 4. ATOMIC TRANSACTION ---
    const result = await prisma.$transaction(async (tx) => {
      // A. Create inactive agent user
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: "", // Placeholder until they accept
          firstName,
          lastName: lastName || null,
          phone: phone || null,
          status: "INACTIVE",
          emailVerified: null,
        },
      });

      // B. Add user to organization as AGENT
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: payload.organizationId,
          role: "AGENT",
        },
      });

      // C. Create agent invite with hashed token
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenHash = crypto.createHash("sha256").update(inviteToken).digest("hex");
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const agentInvite = await tx.agentInvite.create({
        data: {
          id: crypto.randomUUID(),
          inviteTokenHash,
          tenantId: payload.userId,
          expiresAt: inviteExpires,
          updatedAt: new Date(),
        },
      });

      return { user, agentInvite, inviteToken };
    });

    // --- 5. Response Construction ---
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/agent/accept?token=${result.inviteToken}&email=${encodeURIComponent(normalizedEmail)}`;

    return NextResponse.json({
      success: true,
      message: "Agent invited successfully",
      agent: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        isUsed: result.agentInvite.isUsed,
        createdAt: result.agentInvite.createdAt,
        expiresAt: result.agentInvite.expiresAt,
      },
      inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
    });

  } catch (error) {
    console.error("Agent invite API failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- GET route ---
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token) as TokenPayload;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only tenants can view their agent invites
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
          }
        }
      },
    });

    const mappedInvites = agentInvites.map(inv => ({
      id: inv.id,
      email: inv.users.email,
      firstName: inv.users.firstName,
      lastName: inv.users.lastName || "",
      phone: inv.users.phone || "",
      status: inv.users.status,
      isUsed: inv.isUsed,
      usedAt: inv.usedAt,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
    }));

    return NextResponse.json({ invites: mappedInvites });
  } catch (error) {
    console.error("List agent invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}