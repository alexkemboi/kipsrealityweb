import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendTenantInviteEmail } from "@/lib/mail-service";

type TokenPayload = {
  userId: string;
  role: string;
  organizationId: string;
};

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // --- 1) Verify token ---
    const cookieStore = cookies();
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

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can resend invites" },
        { status: 403 }
      );
    }

    const inviteId = context.params.id;

    // --- 2) Find the invite (use findFirst unless composite unique exists) ---
    const invite = await prisma.invite.findFirst({
      where: {
        id: inviteId,
        organizationId: payload.organizationId,
        role: "TENANT",
      },
      include: {
        lease: {
          include: {
            unit: { include: { property: true } },
            tenant: true,
          },
        },
        invitedBy: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.accepted) {
      return NextResponse.json(
        { error: "Invite already accepted" },
        { status: 400 }
      );
    }

    // Expired
    if (invite.expiresAt <= new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    // --- 3) Send email (do NOT require tenant user to exist) ---
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/invite/tenant/accept?token=${invite.token}&email=${encodeURIComponent(
      invite.email
    )}&leaseId=${invite.leaseId}`;

    const propertyName =
      invite.lease?.unit?.property?.name || "Unknown Property";
    const unitNumber = invite.lease?.unit?.unitNumber || "N/A";

    let landlordName = "Property Manager";
    if (invite.invitedBy) {
      landlordName =
        `${invite.invitedBy.firstName || ""} ${invite.invitedBy.lastName || ""}`.trim() ||
        "Property Manager";
    }

    const hasLandlordSigned = !!invite.lease?.landlordSignedAt;

    const recipientFirstName =
      invite.lease?.tenant?.firstName ||
      invite.email.split("@")[0] ||
      "there";

    try {
      await sendTenantInviteEmail(
        invite.email,
        recipientFirstName,
        propertyName,
        unitNumber,
        landlordName,
        inviteLink,
        hasLandlordSigned
      );
    } catch (emailError) {
      console.error("Failed to send tenant invite email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // Optional: update resent timestamp if you add a column (invite.lastSentAt)
    // await prisma.invite.update({ where: { id: invite.id }, data: { lastSentAt: new Date() } });

    return NextResponse.json({
      success: true,
      message: "Invite resent successfully",
      invite: {
        id: invite.id,
        email: invite.email,
        leaseId: invite.leaseId,
        resentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Resend invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
