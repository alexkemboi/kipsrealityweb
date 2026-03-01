import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

// Accept common US formats, then normalize to +1XXXXXXXXXX
const UpdatePhoneSchema = z.object({
  phone: z.string().trim().min(7).max(25),
});

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function normalizeUsPhoneToE164(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  // 10-digit US number -> +1XXXXXXXXXX
  if (digits.length === 10) {
    // NANP basic validation: area code + central office code cannot start with 0/1
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
    return `+1${digits}`;
  }

  // 11-digit US number starting with 1 -> +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("1")) {
    const national = digits.slice(1);
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
    return `+1${national}`;
  }

  return null;
}

export async function POST(req: Request) {
  try {
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

    if (userPayload.type && userPayload.type !== "access") {
      return jsonNoStore({ error: "Invalid token type" }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = UpdatePhoneSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 }
      );
    }

    const rawPhone = parsed.data.phone.trim();
    const phone = normalizeUsPhoneToE164(rawPhone);

    if (!phone) {
      return jsonNoStore(
        {
          error:
            "Enter a valid US phone number (e.g., (206) 555-1234, 206-555-1234, or +1 206 555 1234)",
        },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        status: true,
        phone: true,
        phoneVerified: true,
      },
    });

    if (!currentUser) {
      return jsonNoStore({ error: "Session is no longer valid" }, { status: 401 });
    }

    if (currentUser.status !== "ACTIVE") {
      return jsonNoStore({ error: "Account is not active" }, { status: 403 });
    }

    if (currentUser.phone === phone) {
      return jsonNoStore(
        {
          success: true,
          message: "Phone number already up to date",
          data: {
            phone,
            phoneVerified: currentUser.phoneVerified !== null,
          },
        },
        { status: 200 }
      );
    }

    // phone is @unique in your schema, so findUnique is ideal
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== userPayload.userId) {
      return jsonNoStore({ error: "Phone number is already in use" }, { status: 409 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        phone,
        phoneVerified: null,
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
          phone: updatedUser.phone, // stored as +1XXXXXXXXXX
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
