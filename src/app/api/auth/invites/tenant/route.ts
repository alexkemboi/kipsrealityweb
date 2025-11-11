// app/api/auth/invites/tenant/route.ts
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

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can invite tenants" },
        { status: 403 }
      );
    }

    // --- 2. Parse request body ---
    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      console.error("Invalid JSON body:", err);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, firstName, lastName, phone, leaseId } = body;
    if (!email || !firstName || !leaseId) {
      return NextResponse.json({ error: "Email, first name, and leaseId are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // --- 3. Check if tenant exists ---
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // --- 4. Fetch lease and unit ---
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { unit: true },
    });

    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    // --- 5. Create inactive tenant user ---
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: "", // Ensure this is allowed in your schema
          firstName,
          lastName: lastName || null,
          phone: phone || null,
          status: "INACTIVE",
          emailVerified: false,
        },
      });
    } catch (err) {
      console.error("User creation failed:", err);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // --- 6. Add user to organization ---
    try {
      await prisma.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: payload.organizationId,
          role: "TENANT",
        },
      });
    } catch (err) {
      console.error("OrganizationUser creation failed:", err);
      return NextResponse.json({ error: "Failed to associate user with organization" }, { status: 500 });
    }

    // --- 7. Create invite ---
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    let invite;
    try {
      invite = await prisma.invite.create({
        data: {
          email: normalizedEmail,
          token: inviteToken,
          role: "TENANT",
          invitedById: payload.userId,
          organizationId: payload.organizationId,
          leaseId: lease.id,
          expiresAt: inviteExpires,
        },
      });
    } catch (err) {
      console.error("Invite creation failed:", err);
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/accept?token=${invite.token}&email=${encodeURIComponent(normalizedEmail)}&leaseId=${lease.id}`;

    return NextResponse.json({
      success: true,
      message: "Tenant invited successfully",
      tenant: {
        id: user.id,
        token: invite.token,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        accepted: invite.accepted,
        createdAt: invite.createdAt,
        lease: {
          id: lease.id,
          startDate: lease.startDate,
          endDate: lease.endDate,
          rentAmount: lease.rentAmount,
          unit: lease.unit ? { id: lease.unit.id, unitNumber: lease.unit.unitNumber } : null,
        },
      },
      inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
    });
  } catch (error) {
    console.error("Tenant invite API failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- GET route remains mostly the same, add logging ---
export async function GET() {
  try {
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

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can view invites" },
        { status: 403 }
      );
    }

    const invites = await prisma.invite.findMany({
      where: { 
        organizationId: payload.organizationId,
        role: 'TENANT'
      },
      orderBy: { createdAt: "desc" },
      include: { invitedBy: true, lease: { include: { unit: true } } },
    });

    const mappedInvites = await Promise.all(
      invites.map(async inv => {
        const user = await prisma.user.findFirst({
          where: {
            email: inv.email,
            organizationUsers: { some: { organizationId: payload.organizationId } },
          },
        });

        return {
          id: inv.id,
          token: inv.token,
          email: inv.email,
          accepted: inv.accepted,
          createdAt: inv.createdAt,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          phone: user?.phone || "",
          status: user?.status || "INACTIVE",
          leaseId: inv.leaseId,
          lease: inv.lease ? {
            id: inv.lease.id,
            startDate: inv.lease.startDate,
            endDate: inv.lease.endDate,
            rentAmount: inv.lease.rentAmount,
            unit: inv.lease.unit ? { id: inv.lease.unit.id, unitNumber: inv.lease.unit.unitNumber } : null,
          } : null,
        };
      })
    );

    return NextResponse.json({ invites: mappedInvites });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
