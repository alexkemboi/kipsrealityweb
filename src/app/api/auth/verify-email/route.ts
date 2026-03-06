import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Debug logging
  console.log("🔍 Email Verification Request URL:", request.url);
  console.log("🔍 Email Verification Token:", token ? "Present" : "Missing");

  // Helper for redirection
  const redirectToLogin = (params: string) => {
    // Uses the request URL origin to ensure we stay on the same domain/IP
    const loginUrl = new URL(`/login?${params}`, request.url);
    console.log("🔍 Redirecting to:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  };

  if (!token) {
    console.error("❌ No token provided in verification request");
    return redirectToLogin('error=missing_token');
  }

  try {
    const secret = process.env.EMAIL_VERIFICATION_SECRET;
    if (!secret) {
      throw new Error('EMAIL_VERIFICATION_SECRET environment variable is not set');
    }
    const hmac = crypto.createHmac(
      'sha256',
      secret
    );
    const hashedToken = hmac.update(token).digest('hex');

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { verificationToken: hashedToken },
    });

    if (!user) {
      console.error("❌ No user found with the provided token");
      return redirectToLogin('error=invalid_token');
    }

    // 2. Verify User atomically (prevent token reuse)
    const updateResult = await prisma.user.updateMany({
      where: {
        id: user.id,
        verificationToken: hashedToken,
        emailVerified: null,
      },
      data: {
        emailVerified: new Date(), // Mark as verified now
        verificationToken: null,   // Invalidate token
        status: 'ACTIVE',          // Ensure status is active
      },
    });

    // If no rows were updated, the token has already been used or invalidated
    if (updateResult.count === 0) {
      return redirectToLogin('error=invalid_token');
    }

    // 3. Verify User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Mark as verified now
        verificationToken: null,   // Invalidate token
        status: 'ACTIVE'           // Ensure status is active
      },
    });

    // 3. SUCCESS REDIRECT
    return redirectToLogin('verified=true');

  } catch (error) {
    console.error("Verification Error", error);
    return redirectToLogin('error=server_error');
  }
}
