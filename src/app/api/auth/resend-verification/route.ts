import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/mail-service";
import { getBaseUrl } from "@/lib/constants";

const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RESEND_COOLDOWN_MS = 60 * 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}

async function applyTimingPadding(start: number, minMs = 250) {
  const elapsed = Date.now() - start;
  if (elapsed < minMs) {
    await sleep(minMs - elapsed);
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  const isDevLike = process.env.NODE_ENV !== "production";

  const successResponse = {
    success: true,
    message:
      "If an unverified account with that email exists, we have sent a verification link.",
  };

  try {
    const body = await request.json().catch(() => null);
    const parsed = resendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const email = parsed.data.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    // Anti-enumeration: always return success for unknown emails.
    if (!user) {
      await applyTimingPadding(start);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // Already verified users get the same generic success.
    if (user.emailVerified) {
      await applyTimingPadding(start);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // Basic throttle to reduce abuse and accidental rapid re-sends.
    const now = Date.now();
    const lastUpdated = new Date(user.updatedAt).getTime();
    if (now - lastUpdated < RESEND_COOLDOWN_MS && (smtpConfigured || !isDevLike)) {
      await applyTimingPadding(start);
      return jsonNoStore(successResponse, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: hashedToken },
    });

    await sendVerificationEmail(user.email, rawToken);
    const verificationUrl = `${getBaseUrl()}/api/auth/verify-email?token=${rawToken}`;

    await applyTimingPadding(start);
    return jsonNoStore(
      {
        ...successResponse,
        ...(isDevLike && !smtpConfigured ? { verificationUrl } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ResendVerification] Error:", error);
    await applyTimingPadding(start);
    return jsonNoStore({ error: "Internal Server Error" }, { status: 500 });
  }
}
