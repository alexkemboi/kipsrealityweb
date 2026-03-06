import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { sendTenantInviteEmail } from "@/lib/mail-service";
import crypto from "crypto";

type TokenPayload = {
  userId: string;
  role: string;
  organizationId: string;
};

function getSafeDisplayNameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Tenant";
}

async function getBaseUrl(request: Request) {
  // Prefer explicit env
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  // Fallback to forwarded headers (works behind proxies)
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";

  if (host) {
    return `${proto}://${host}`;
  }

  // Final fallback
  return new URL(request.url).origin;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      console.error("[ResendInvite] Token verification failed:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!["PROPERTY_MANAGER", "SYSTEM_ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Only property managers or admins can resend invites" },
        { status: 403 }
      );
    }

    // --- 2) Resolve invite id ---
    const params = await context.params;
    const inviteId = params.id?.trim();

    if (!inviteId) {
      return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
    }

    // --- 3) Find invite ---
    const invite = await prisma.invite.findFirst({
      where: {
        id: inviteId,
        organizationId: payload.organizationId,
        role: "TENANT",
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
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

    // --- 4) Rotate token + refresh expiry on resend (better UX/security) ---
    // This lets resend work even if old invite expired.
    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: true,
          },
        },
        invitedBy: true,
      },
    });

    // --- 5) Build invite link ---
    const baseUrl = await getBaseUrl(request);
    const query = new URLSearchParams({
      token: updatedInvite.token,
      email: updatedInvite.email,
    });

    if (updatedInvite.leaseId) {
      query.set("leaseId", updatedInvite.leaseId);
    }

    const inviteLink = `${baseUrl}/invite/tenant/accept?${query.toString()}`;

    // --- 6) Build email data (NO hard dependency on existing tenant user) ---
    const propertyName = updatedInvite.lease?.unit?.property?.name || "Unknown Property";
    const unitNumber = updatedInvite.lease?.unit?.unitNumber || "N/A";

    const landlordName =
      updatedInvite.invitedBy
        ? `${updatedInvite.invitedBy.firstName || ""} ${updatedInvite.invitedBy.lastName || ""}`
            .trim() || "Property Manager"
        : "Property Manager";

    const hasLandlordSigned = Boolean(updatedInvite.lease?.landlordSignedAt);

    const tenantFirstName =
      updatedInvite.lease?.tenant?.firstName?.trim() ||
      getSafeDisplayNameFromEmail(updatedInvite.email);

    // --- 7) Send email ---
    try {
      await sendTenantInviteEmail(
        updatedInvite.email,
        tenantFirstName,
        propertyName,
        unitNumber,
        landlordName,
        inviteLink,
        hasLandlordSigned
      );
    } catch (emailError) {
      console.error("[ResendInvite] Failed to send tenant invite email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // --- 8) Success response ---
    return NextResponse.json({
      success: true,
      message: "Invite resent successfully",
      invite: {
        id: updatedInvite.id,
        email: updatedInvite.email,
        leaseId: updatedInvite.leaseId,
        resentAt: new Date().toISOString(),
        expiresAt: updatedInvite.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ResendInvite] Internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
