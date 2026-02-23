import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/mail-service";

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

// Small helper to reduce timing differences (best-effort)
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

  // Same success response for existent/non-existent users (anti-enumeration)
  const successResponse = {
    success: true,
    message:
      "If an account with that email exists, we have sent a password reset link.",
  };

  try {
    const body = await request.json().catch(() => null);

    // Validate input
    const parseResult = forgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return jsonNoStore(
        { error: parseResult.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const email = parseResult.data.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Anti-enumeration: same response even when account doesn't exist
    if (!user) {
      await applyTimingPadding(start);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // Per-user throttle: prevent repeated reset emails within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: oneMinuteAgo },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    if (recentToken) {
      console.warn("[ForgotPassword] Throttled reset request", {
        userId: user.id,
        reason: "recent_token_exists",
      });

      await applyTimingPadding(start);
      return jsonNoStore(successResponse, { status: 200 });
    }

    // Generate raw token (email only) + hash (DB only)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const tokenRecordId = crypto.randomUUID();

    // Invalidate old tokens + create new one atomically
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      }),
      prisma.passwordResetToken.create({
        data: {
          id: tokenRecordId,
          token: tokenHash, // store hash only
          expiresAt,
          userId: user.id,
        },
      }),
    ]);

    // Send email; if it fails, remove the fresh token to avoid orphaned valid tokens
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (mailError) {
      console.error("[ForgotPassword] Email send failed", {
        userId: user.id,
        error: mailError instanceof Error ? mailError.message : String(mailError),
      });

      try {
        await prisma.passwordResetToken.deleteMany({
          where: {
            userId: user.id,
            token: tokenHash,
          },
        });
      } catch (cleanupError) {
        console.error("[ForgotPassword] Failed to cleanup reset token after email failure", {
          userId: user.id,
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }

      return jsonNoStore(
        { error: "Unable to send reset email. Please try again." },
        { status: 500 }
      );
    }

    await applyTimingPadding(start);
    return jsonNoStore(successResponse, { status: 200 });
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);

    await applyTimingPadding(start);
    return jsonNoStore({ error: "Internal Server Error" }, { status: 500 });
  }
}
