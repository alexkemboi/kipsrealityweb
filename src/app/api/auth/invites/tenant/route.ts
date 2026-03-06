import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sendTenantInviteEmail } from "@/lib/mail-service";

type TokenPayload = {
  userId: string;
  role: string;
  organizationId: string;
};

interface InviteRequestBody {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  leaseId: string;
}

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
    let body: InviteRequestBody;
    try {
      body = await request.json() as InviteRequestBody;
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, firstName, lastName, phone, leaseId } = body;
    if (!email || !firstName || !leaseId) {
      return NextResponse.json({ error: "Email, first name, and leaseId are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // --- 3. Pre-Checks (Read operations can happen before transaction) ---
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { unit: { include: { property: true } } },
    });

    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    // --- 4. ATOMIC TRANSACTION (Write Operations) ---
    // This ensures we don't create a User if the Invite fails
    const result = await prisma.$transaction(async (tx) => {
      // A. Create inactive tenant user
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

      // B. Add user to organization
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: payload.organizationId,
          role: "TENANT",
        },
      });

      // C. Create invite
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invite = await tx.invite.create({
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

      return { user, invite, lease };
    });

    // --- 5. Get landlord info for email ---
    const landlord = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // --- 6. Construct invite link ---
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/invite/tenant/accept?token=${result.invite.token}&email=${encodeURIComponent(normalizedEmail)}&leaseId=${lease.id}`;

    // --- 7. Send email to tenant ---
    try {
      const propertyName = result.lease.unit?.property?.name || "Unknown Property";
      const unitNumber = result.lease.unit?.unitNumber || "N/A";
      const landlordName = landlord?.firstName ? `${landlord.firstName} ${landlord.lastName || ""}`.trim() : "Property Manager";
      const hasLandlordSigned = !!result.lease.landlordSignedAt; // Check if landlord has signed

      await sendTenantInviteEmail(
        normalizedEmail,
        firstName,
        propertyName,
        unitNumber,
        landlordName,
        inviteLink,
        hasLandlordSigned
      );
    } catch (emailError) {
      console.error("Failed to send tenant invite email:", emailError);
      // Don't fail the request if email fails, just log it
    }

    // --- 8. Response Construction ---
    return NextResponse.json({
      success: true,
      message: "Tenant invited successfully. Email sent.",
      tenant: {
        id: result.user.id,
        token: result.invite.token,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        accepted: result.invite.accepted,
        createdAt: result.invite.createdAt,
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

// --- GET route (Kept mostly as is, ensuring types match) ---
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

    // Batch-fetch users for all invite emails to avoid N+1 queries
    const inviteEmails = invites.map(inv => inv.email);

    const users = inviteEmails.length
      ? await prisma.user.findMany({
          where: {
            email: { in: inviteEmails },
            organizationUsers: { some: { organizationId: payload.organizationId } },
          },
        })
      : [];

    const userByEmail = new Map(users.map(user => [user.email, user]));

    const mappedInvites = invites.map(inv => {
      const user = userByEmail.get(inv.email);

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
    });
    return NextResponse.json({ invites: mappedInvites });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}