import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parseResult = resetPasswordSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { token, password } = parseResult.data;

        // 1. Hash the incoming token to compare with DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Find valid token
        const resetTokenRecord = await prisma.passwordResetToken.findFirst({
            where: {
                token: tokenHash,
                expiresAt: { gt: new Date() } // Must not be expired
            },
            include: { user: true }
        });

        if (!resetTokenRecord) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Update User Password & Delete Tokens (Transaction)
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetTokenRecord.userId },
                data: { passwordHash: hashedPassword }
            }),
            // Invalidate ALL reset tokens for this user (security)
            prisma.passwordResetToken.deleteMany({
                where: { userId: resetTokenRecord.userId }
            })
        ]);

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("[ResetPassword] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
