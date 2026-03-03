import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code are required" }, { status: 400 });
    }

    const isValid = await verifyOtp(userId, code, 'TWO_FACTOR');

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    // ✅ Code is valid! Fetch user data and issue tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationUsers: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is suspended. Please contact support.' }, { status: 403 });
    }

    const primaryOrgUser = user.organizationUsers[0];
    let role = primaryOrgUser?.role || 'TENANT';

    // Force system admin role for platform admin account
    if (user.email === process.env.ADMIN_EMAIL) {
      role = 'SYSTEM_ADMIN';
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: role,
      organizationId: primaryOrgUser?.organizationId ?? '',
      organizationUserId: primaryOrgUser?.id
    });

    const refreshToken = generateRefreshToken({ userId: user.id });
    const expiresAt = Date.now() + 60 * 60 * 1000;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // User response matching login route format
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: role,
      organizationUserId: primaryOrgUser?.id,
      organization: primaryOrgUser
        ? {
          id: primaryOrgUser.organization.id,
          name: primaryOrgUser.organization.name,
          slug: primaryOrgUser.organization.slug
        }
        : null
    };

    const response = NextResponse.json(
      {
        user: userResponse,
        tokens: { accessToken, refreshToken, expiresAt },
        success: true
      },
      { status: 200 }
    );

    // Detect if we are in production BUT running on a local IP/HTTP
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalNetwork = req.url.includes("192.168.") || req.url.includes("localhost");

    response.cookies.set('token', accessToken, {
      httpOnly: true,
      // ONLY set Secure if in production AND NOT on local network
      secure: isProduction && !isLocalNetwork,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      // ONLY set Secure if in production AND NOT on local network
      secure: isProduction && !isLocalNetwork,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
