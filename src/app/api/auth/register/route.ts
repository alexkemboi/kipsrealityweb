import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

const DEFAULT_ROLE = 'PROPERTY_MANAGER';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, organizationName } = await request.json()

    // Validate required fields
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Email, password, and organization name are required' },
        { status: 400 }
      );
    }

    // ✅ Check if organization exists already
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: organizationName,
      },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "ORGANIZATION_EXISTS" },
        { status: 409 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
      },
    });

    // ✅ Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
      },
    });

    // ✅ Link user to organization
    await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: DEFAULT_ROLE,
      },
    });

    // ✅ Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: DEFAULT_ROLE,
      organizationId: organization.id,
      organizationUserId: ''
    });

    const refreshToken = generateRefreshToken({ userId: user.id });
    const expiresAt = Date.now() + 60 * 60 * 1000;

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: DEFAULT_ROLE,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };

    const response = NextResponse.json({
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    });

    // ✅ Secure cookie
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
