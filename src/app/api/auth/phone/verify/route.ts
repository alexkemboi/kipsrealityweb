import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyOtp } from "@/lib/auth/otp";
import { z } from "zod";

const VerifyPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format (e.g., +1 271 234 5678)"),
  code: z.string().trim().min(4).max(10),
});

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  try {
    // 1) Verify authenticated user from httpOnly cookie
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

    // 2) Validate request payload
    const rawBody = await req.json().catch(() => null);
    const parsed = VerifyPhoneSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 }
      );
    }

    const phone = parsed.data.phone.trim();
    const code = parsed.data.code.trim();

    // 3) Confirm user exists and is active; ensure phone matches account
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        status: true,
        phone: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return jsonNoStore({ error: "Session is no longer valid" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return jsonNoStore({ error: "Account is not active" }, { status: 403 });
    }

    if (!user.phone) {
      return jsonNoStore({ error: "No phone number found on your account" }, { status: 400 });
    }

    if (user.phone !== phone) {
      return jsonNoStore(
        { error: "Phone number does not match the phone on your account" },
        { status: 400 }
      );
    }

    // Already verified (idempotent success)
    if (user.phoneVerified) {
      return jsonNoStore(
        { success: true, message: "Phone number is already verified" },
        { status: 200 }
      );
    }

    // 4) Verify OTP
    // NOTE: Prefer verifyOtp(userId, phone, code, purpose) if your helper supports phone matching.
    const isValid = await verifyOtp(user.id, code, "PHONE_VERIFICATION");

    if (!isValid) {
      return jsonNoStore({ error: "Invalid or expired code" }, { status: 400 });
    }

    // 5) Mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: new Date() },
    });

    return jsonNoStore(
      { success: true, message: "Phone number verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Phone verification error:", error);
    return jsonNoStore({ error: "Internal server error" }, { status: 500 });
  }
}
