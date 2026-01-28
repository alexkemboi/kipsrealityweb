import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Helper for redirection
  const redirectToLogin = (params: string) => {
    // Uses the request URL origin to ensure we stay on the same domain/IP
    const loginUrl = new URL(`/login?${params}`, request.url);
    return NextResponse.redirect(loginUrl);
  };

  if (!token) {
    return redirectToLogin('error=missing_token');
  }

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
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
