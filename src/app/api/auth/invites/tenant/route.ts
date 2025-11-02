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
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAccessToken(token) as TokenPayload;

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can invite tenants" },
        { status: 403 }
      );
    }

    const { email, firstName, lastName, phone } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json({ error: "Email and first name are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: "",
        firstName,
        lastName: lastName || null,
        phone: phone || null,
        status: "INACTIVE",
        emailVerified: false,
      },
    });

    await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: payload.organizationId,
        role: "TENANT",
      },
    });

    const invite = await prisma.invite.create({
      data: {
        email: normalizedEmail,
        token: inviteToken,
        role: "TENANT",
        invitedById: payload.userId,
        organizationId: payload.organizationId,
        expiresAt: inviteExpires,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/accept?token=${invite.token}&email=${encodeURIComponent(normalizedEmail)}`;

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
        createdAt: invite.createdAt
      },
      inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
    });
  } catch (error) {
    console.error("Invite tenant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token) as TokenPayload;

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can view invites" },
        { status: 403 }
      );
    }

    // Fetch invites for this organization
    const invites = await prisma.invite.findMany({
      where: { organizationId: payload.organizationId },
      orderBy: { createdAt: "desc" },
      include: { invitedBy: true }, // optional: who sent the invite
    });

    // Map invites to include tenant info if exists
    const mappedInvites = await Promise.all(
      invites.map(async inv => {
        // Look for the user in this organization
        const user = await prisma.user.findFirst({
          where: {
            email: inv.email,
            organizationUsers: {
              some: { organizationId: payload.organizationId },
            },
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
        };
      })
    );

    return NextResponse.json({ invites: mappedInvites });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}