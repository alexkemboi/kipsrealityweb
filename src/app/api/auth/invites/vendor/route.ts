// app/api/invites/vendor/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

type AuthPayload = {
  userId?: string;
  role?: string;
  organizationId?: string | null;
};

type VendorInviteBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  serviceType?: string;
};

async function getAuthorizedUser(): Promise<
  | { ok: true; payload: AuthPayload }
  | { ok: false; response: NextResponse }
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const payload = verifyAccessToken(token) as AuthPayload;

    if (!payload?.role) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    if (payload.role !== "PROPERTY_MANAGER" && payload.role !== "SYSTEM_ADMIN") {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Only property managers or system admins can access vendor invites" },
          { status: 403 }
        ),
      };
    }

    if (!payload.organizationId) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "User organization context is missing" },
          { status: 400 }
        ),
      };
    }

    return { ok: true, payload };
  } catch (error) {
    console.error("[Vendor Invites Auth] token verification failed:", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET(_request: Request) {
  try {
    const auth = await getAuthorizedUser();
    if (!auth.ok) return auth.response;

    const { organizationId } = auth.payload;

    const invites = await prisma.invite.findMany({
      where: {
        organizationId: organizationId!,
        role: "VENDOR",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        role: true,
        accepted: true,
        token: true,
        expiresAt: true,
        createdAt: true,
        organizationId: true,
        invitedById: true,
      },
    });

    return NextResponse.json({ success: true, invites }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/invites/vendor]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedUser();
    if (!auth.ok) return auth.response;

    const payload = auth.payload;

    const body = (await request.json()) as VendorInviteBody;

    const normalizedEmail = normalizeOptionalString(body.email)?.toLowerCase() ?? null;
    const firstName = normalizeOptionalString(body.firstName);
    const lastName = normalizeOptionalString(body.lastName);
    const phone = normalizeOptionalString(body.phone);
    const companyName = normalizeOptionalString(body.companyName);
    const serviceType = normalizeOptionalString(body.serviceType);

    if (!normalizedEmail || !firstName) {
      return NextResponse.json(
        { error: "Email and first name are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!payload.userId) {
      return NextResponse.json(
        { error: "Authenticated user id is missing" },
        { status: 400 }
      );
    }

    // If a user already exists and is active, block invite
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, status: true },
    });

    if (existingUser && existingUser.status === "ACTIVE") {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Prevent duplicate active pending invite for same org/email/vendor role
    const existingPendingInvite = await prisma.invite.findFirst({
      where: {
        email: normalizedEmail,
        organizationId: payload.organizationId!,
        role: "VENDOR",
        accepted: false,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, expiresAt: true, token: true },
    });

    if (existingPendingInvite) {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/inviteor?token=${
        existingPendingInvite.token
      }&email=${encodeURIComponent(normalizedEmail)}`;

      return NextResponse.json(
        {
          success: false,
          error: "A pending vendor invite already exists for this email.",
          inviteId: existingPendingInvite.id,
          expiresAt: existingPendingInvite.expiresAt,
          inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
        },
        { status: 409 }
      );
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Optional metadata save if your Invite model supports these fields.
    // If not supported in your schema, remove the extra fields below.
    const invite = await prisma.invite.create({
      data: {
        email: normalizedEmail,
        token: inviteToken,
        role: "VENDOR",
        organizationId: payload.organizationId!,
        invitedById: payload.userId,
        expiresAt: inviteExpires,
      },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Best effort: create/update vendor placeholder record for tracking if user doesn't exist yet.
    // Safe to skip if vendor model/business flow doesn't require this.
    try {
      await prisma.vendor.upsert({
        where: {
          // Assumes a unique constraint exists for vendor email OR vendor id-specific unique.
          // If your schema does not have unique email, replace with findFirst + create/update.
          email: normalizedEmail,
        },
        update: {
          organizationId: payload.organizationId!,
          phone: phone ?? undefined,
          companyName: companyName ?? undefined,
          serviceType: serviceType ?? undefined,
          isActive: true,
        },
        create: {
          organizationId: payload.organizationId!,
          email: normalizedEmail,
          phone,
          companyName:
            companyName ?? [firstName, lastName].filter(Boolean).join(" ") || "Vendor",
          serviceType: serviceType ?? "General Services",
          isActive: true,
        },
      });
    } catch (vendorErr) {
      // Ignore schema/constraint mismatch or duplicate issues — invite is still valid.
      console.warn("[POST /api/invites/vendor] vendor upsert skipped:", vendorErr);
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
    const inviteLink = `${baseUrl}/inviteor?token=${inviteToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    // TODO: send email with inviteLink, companyName, serviceType in production

    return NextResponse.json(
      {
        success: true,
        message: "Vendor invited successfully",
        inviteId: invite.id,
        inviteLink: process.env.NODE_ENV === "development" ? inviteLink : undefined,
        expiresAt: invite.expiresAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/invites/vendor]", error);

    // Prisma unique constraint (e.g., token collision or duplicate unique invite keys)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A duplicate record conflict occurred. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
