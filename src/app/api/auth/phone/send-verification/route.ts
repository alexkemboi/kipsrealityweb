import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/sms";
import { createOtp } from "@/lib/auth/otp";
import { z } from "zod";

const SendPhoneVerificationSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format (e.g., +254712345678)"),
});

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function isTestEnv() {
  return process.env.NODE_ENV === "test" || process.env.E2E === "true";
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
    const parsed = SendPhoneVerificationSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 }
      );
    }

    const phone = parsed.data.phone.trim();

    // 3) Verify current user exists and is active
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

    // 4) Ensure phone belongs to this user (prevents sending OTP to arbitrary numbers)
    if (!user.phone || user.phone !== phone) {
      return jsonNoStore(
        { error: "Phone number does not match the phone on your account" },
        { status: 400 }
      );
    }

    // Optional: if already verified, avoid re-sending unless your product wants re-verification support
    if (user.phoneVerified) {
      return jsonNoStore(
        { success: true, message: "Phone number is already verified" },
        { status: 200 }
      );
    }

    // 5) Basic rate limit (best-effort)
    // Assumes your Otp model stores createdAt, userId, phone, purpose and is queryable.
    // If field names differ, adjust this query.
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentOtp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        phone,
        purpose: "PHONE_VERIFICATION",
        createdAt: { gt: oneMinuteAgo },
      },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      return jsonNoStore(
        {
          success: true,
          message: "Verification code recently sent. Please wait before requesting another code.",
        },
        { status: 200 }
      );
    }

    // 6) Generate OTP (recommended: createOtp should hash code at rest + set expiry)
    const code = await createOtp(user.id, phone, "PHONE_VERIFICATION");

    // 7) Send SMS (skip real SMS in tests/E2E)
    if (!isTestEnv()) {
      await sendSms(
        phone,
        `Your RentFlow360 verification code is: ${code}. Valid for 5 minutes.`
      );
    } else {
      // Useful for CI logs without exposing production behavior
      console.log(`[E2E] Skipping SMS send. OTP generated for ${phone}`);
    }

    return jsonNoStore(
      { success: true, message: "Verification code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send verification error:", error);
    return jsonNoStore({ error: "Internal server error" }, { status: 500 });
  }
}
