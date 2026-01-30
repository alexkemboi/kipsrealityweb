import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organizationUsers: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User does not exist. Please create an account to continue.' }, { status: 404 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is suspended. Please contact support.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // SECURITY CHECK: Is Email Verified?
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email address before logging in.',
          requiresVerification: true
        },
        { status: 403 }
      );
    }

    const primaryOrgUser = user.organizationUsers[0];
    let role = primaryOrgUser?.role || 'TENANT';

    // Force system admin role for platform admin account
    if (email === process.env.ADMIN_EMAIL) {
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

    // Updated user response to include organizationUserId
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: role,
      organizationUserId: primaryOrgUser?.id, // <-- Added
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
        tokens: { accessToken, refreshToken, expiresAt }
      },
      { status: 200 }
    );

    // Detect if we are in production BUT running on a local IP/HTTP
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalNetwork = request.url.includes("192.168.") || request.url.includes("localhost");

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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
