import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { z } from 'zod';
import { sendPasswordResetEmail } from "@/lib/mail-service";

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
                id: crypto.randomUUID(),
                token: tokenHash,
                expiresAt: passwordResetExpires,
                userId: user.id,
            },
        });



        // 6. Send Email using the email service
        await sendPasswordResetEmail(email, resetToken);

        return NextResponse.json(successResponse, { status: 200 });

    } catch (error) {
        console.error('[ForgotPassword] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}