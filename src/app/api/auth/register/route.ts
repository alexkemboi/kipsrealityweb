import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

// Default role for self-registration
const DEFAULT_ROLE = 'PROPERTY_MANAGER';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, organizationName } = await request.json()

    // Validate required fields
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Email, password, and organization name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    //  Create organization for the property manager
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
      },
    })

    //  Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
      },
    })

    //  Link user to organization with PROPERTY_MANAGER role
    await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: DEFAULT_ROLE,
      },
    })

    //  Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: DEFAULT_ROLE,
      organizationId: organization.id,
    })

    const refreshToken = generateRefreshToken({ userId: user.id })
    const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

    //  Format response
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
    }

    const response = NextResponse.json({
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    })

    //  Secure cookie
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
