// app/api/auth/invites/vendor/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AuthPayload = {
  role: string;
  organizationId?: string | null;
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
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
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
    console.error("[Vendor Invite Auth] token verification failed:", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthorizedUser();
    if (!auth.ok) return auth.response;

    const { id: inviteId } = await params;
    if (!inviteId?.trim()) {
      return NextResponse.json({ error: "Invite id is required" }, { status: 400 });
    }

    const payload = auth.payload;

    const invite = await prisma.invite.findFirst({
      where: {
        id: inviteId,
        organizationId: payload.organizationId!,
        role: "VENDOR",
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Vendor invite not found" }, { status: 404 });
    }

    let vendor = {
      id: invite.id,
      email: invite.email,
      firstName: "",
      lastName: "",
      phone: "",
      companyName: "",
      serviceType: "",
      rating: 0,
      tasksInQueue: 0,
      specialty: "",
      availability: "Not specified",
      accepted: invite.accepted,
      createdAt: invite.createdAt,
      vendorRecordId: null as string | null,
    };

    if (invite.accepted) {
      const user = await prisma.user.findUnique({
        where: { email: invite.email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });

      if (user) {
        vendor = {
          ...vendor,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
        };

        let vendorRecord = await prisma.vendor.findFirst({
          where: {
            organizationId: invite.organizationId,
            OR: [{ userId: user.id }, { email: invite.email }],
          },
          select: {
            id: true,
            companyName: true,
            serviceType: true,
          },
        });

        if (!vendorRecord) {
          try {
            vendorRecord = await prisma.vendor.create({
              data: {
                userId: user.id,
                organizationId: invite.organizationId,
                companyName:
                  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Vendor",
                serviceType: "General Services",
                email: invite.email,
                phone: user.phone || null,
                isActive: true,
              },
              select: {
                id: true,
                companyName: true,
                serviceType: true,
              },
            });
          } catch (err) {
            console.warn("Failed to create vendor record on demand:", err);
          }
        }

        if (vendorRecord) {
          vendor.vendorRecordId = vendorRecord.id;
          vendor.companyName = vendorRecord.companyName || vendor.companyName;
          vendor.serviceType = vendorRecord.serviceType || vendor.serviceType;
        }
      }
    }

    return NextResponse.json({ success: true, vendor }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/auth/invites/vendor/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthorizedUser();
    if (!auth.ok) return auth.response;

    const { id: inviteId } = await params;
    if (!inviteId?.trim()) {
      return NextResponse.json({ error: "Invite id is required" }, { status: 400 });
    }

    const payload = auth.payload;

    // deleteMany is safer here unless your Prisma schema has a composite unique on (id, organizationId)
    const result = await prisma.invite.deleteMany({
      where: {
        id: inviteId,
        organizationId: payload.organizationId!,
        role: "VENDOR",
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Vendor invite not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Vendor invite deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/auth/invites/vendor/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
