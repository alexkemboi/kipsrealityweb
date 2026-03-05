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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { verificationToken: hashedToken },
    });

    if (!user) {
      return redirectToLogin('error=invalid_token');
    }

    // 2. Verify User
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
