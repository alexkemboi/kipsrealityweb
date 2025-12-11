import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // NOTE: Frontend-facing mock handler. The backend team should
    // implement the real mail/send and token logic. Options:
    // - Proxy this request to the backend service here.
    // - Replace this file with logic that sends email using a service.

    // For now, return a successful JSON response so the frontend flow works.
    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const parseResult = forgotPasswordSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { email } = parseResult.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Default response to prevent enumeration (Security Best Practice)
        const successResponse = {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link.'
        };

        if (!user) {
            // Simulate minimal processing time to mitigate timing attacks (optional but good for high security)
            return NextResponse.json(successResponse, { status: 200 });
        }

        // 1. Rate Limiting / Throttling
        // Prevent spamming emails by checking if a token was generated recently (e.g., last 60 seconds)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentToken = await prisma.passwordResetToken.findFirst({
            where: {
                userId: user.id,
                createdAt: { gt: oneMinuteAgo }
            }
        });

        if (recentToken) {
            console.warn(`[ForgotPassword] Rate limit hit for email: ${email}`);
            // Return 200 to prevent enumeration (same as success)
            return NextResponse.json(successResponse, { status: 200 });
        }

        // 2. Cleanup old tokens
        // Invalidate any previous tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id }
        });

        // 3. Generate and Hash Token
        // Use a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Hash it before storing in DB (prevents attacker with DB access from using it)
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

        // 4. Save to DB
        await prisma.passwordResetToken.create({
            data: {
                token: tokenHash,
                expiresAt: passwordResetExpires,
                userId: user.id,
            },
        });

        // 5. Build Reset Link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // 6. Send Email using the email service
        await sendEmail({
            to: email,
            subject: 'Reset your password',
            text: `Click the link to reset your password: ${resetUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>You requested a password reset. Click the button below to proceed:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 16px 0;">Reset Password</a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        return NextResponse.json(successResponse, { status: 200 });

    } catch (error) {
        console.error('[ForgotPassword] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
