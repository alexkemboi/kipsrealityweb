import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/mail-service";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Small helper to reduce timing differences (best-effort)
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: Request) {
  const start = Date.now();

  // Same success response for existent/non-existent users (anti-enumeration)
  const successResponse = {
    success: true,
    message:
      "If an account with that email exists, we have sent a password reset link.",
  };

  try {
    const body = await request.json();

    // Validate input
    const parseResult = forgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return jsonNoStore(
        { error: parseResult.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    // Normalize email (important if DB stores lowercase emails)
    const email = parseResult.data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // If user does not exist, return same success response (anti-enumeration)
    if (!user) {
      // Best-effort timing padding
      const elapsed = Date.now() - start;
      if (elapsed < 250) await sleep(250 - elapsed);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // 1) Rate limit / throttle (per-user)
    // Prevent repeated emails within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: oneMinuteAgo },
      },
      select: { id: true },
    });

    if (recentToken) {
      console.warn("[ForgotPassword] Throttled reset request for existing account");
      const elapsed = Date.now() - start;
      if (elapsed < 250) await sleep(250 - elapsed);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // 2) Generate token + hash
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const tokenRecordId = crypto.randomUUID();

    // 3) Invalidate old tokens + create new token atomically
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      }),
      prisma.passwordResetToken.create({
        data: {
          id: tokenRecordId,
          token: tokenHash,
          expiresAt,
          userId: user.id,
        },
      }),
    ]);

    // 4) Send email
    // If email fails, remove the fresh token to avoid orphaned valid tokens
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (mailError) {
      console.error("[ForgotPassword] Email send failed:", mailError);

      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          token: tokenHash,
        },
      });

      // Still return generic error (not success) because this is server-side failure,
      // but it does not reveal whether email exists (we only reach here for real user)
      return jsonNoStore({ error: "Unable to send reset email. Please try again." }, { status: 500 });
    }

    // Best-effort timing padding
    const elapsed = Date.now() - start;
    if (elapsed < 250) await sleep(250 - elapsed);

    return jsonNoStore(successResponse, { status: 200 });
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);

    // Best-effort timing padding even on failures
    const elapsed = Date.now() - start;
    if (elapsed < 250) await sleep(250 - elapsed);

    return jsonNoStore({ error: "Internal Server Error" }, { status: 500 });
  }
}
