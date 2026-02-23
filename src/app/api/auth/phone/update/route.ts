import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const UpdatePhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    // E.164 format: + followed by 7-15 digits, first digit after + cannot be 0
    .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format (e.g., +254712345678)"),
});

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  try {
    // 1) Verify authenticated user (cookie-based)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
    }

    let userPayload: { userId: string; type?: string };

    try {
      userPayload = verifyAccessToken(token);
    } catch {
      return jsonNoStore({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Optional hardening if your JWT includes token type
    if (userPayload.type && userPayload.type !== "access") {
      return jsonNoStore({ error: "Invalid token type" }, { status: 401 });
    }

    // 2) Validate request body
    const rawBody = await req.json().catch(() => null);
    const parsed = UpdatePhoneSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 }
      );
    }

    const phone = parsed.data.phone.trim();

    // 3) Ensure current user exists + active
    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        status: true,
        phone: true,
      },
    });

    if (!currentUser) {
      return jsonNoStore({ error: "Session is no longer valid" }, { status: 401 });
    }

    if (currentUser.status !== "ACTIVE") {
      return jsonNoStore({ error: "Account is not active" }, { status: 403 });
    }

    // If same phone already saved, treat as success (idempotent)
    if (currentUser.phone === phone) {
      return jsonNoStore(
        {
          success: true,
          message: "Phone number already up to date",
          phone,
          phoneVerified: false, // API-friendly boolean shape
        },
        { status: 200 }
      );
    }

    // 4) Check uniqueness against other users
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: userPayload.userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      return jsonNoStore({ error: "Phone number is already in use" }, { status: 409 });
    }

    // 5) Update phone + reset verification timestamp
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        phone,
        phoneVerified: null, // reset verification whenever phone changes
      },
      select: {
        id: true,
        phone: true,
        phoneVerified: true,
        updatedAt: true,
      },
    });

    return jsonNoStore(
      {
        success: true,
        message: "Phone number updated",
        data: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          phoneVerified: updatedUser.phoneVerified !== null,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Phone update error:", error);
    return jsonNoStore({ error: "Internal server error" }, { status: 500 });
  }
}
