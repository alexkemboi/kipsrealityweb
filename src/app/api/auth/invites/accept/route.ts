// app/api/invites/accept/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, token, password, firstName, lastName, phone } = await request.json()

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Email, token and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // Find invite by token
    const invite = await prisma.invite.findUnique({
      where: { token }
    })

    if (!invite || invite.email !== normalizedEmail) {
      return NextResponse.json({ error: 'Invalid invite token or email' }, { status: 400 })
    }

    if (invite.accepted) {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    // If a user already exists with that email:
    // - if active -> block (should not happen because invite should not be created)
    // - if inactive -> update password and activate
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    let user

    if (existingUser) {
      if (existingUser.status === 'ACTIVE') {
        return NextResponse.json({ error: 'User already exists and is active' }, { status: 409 })
      }

      // Update existing inactive user (created earlier or by mistake)
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: hashedPassword,
          firstName: firstName ?? existingUser.firstName,
          lastName: lastName ?? existingUser.lastName,
          phone: phone ?? existingUser.phone,
          status: 'ACTIVE',
          emailVerified: true,
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          phone: phone ?? null,
          status: 'ACTIVE',
          emailVerified: true,
        }
      })
    }

    // Create organizationUser link if doesn't exist
    const orgUserExists = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId: invite.organizationId
      }
    })

    if (!orgUserExists) {
      await prisma.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role
        }
      })
    }

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { accepted: true }
    })

    // Generate tokens and return them so the user can be signed in automatically
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: invite.role,
      organizationId: invite.organizationId
    })

    const refreshToken = generateRefreshToken({ userId: user.id })
    const expiresAt = Date.now() + 60 * 60 * 1000

    const response = NextResponse.json({
      success: true,
      message: 'Invite accepted. Account activated.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: invite.role,
        organizationId: invite.organizationId
      },
      tokens: { accessToken, refreshToken, expiresAt }
    }, { status: 200 })

    // Set cookie with access token for middleware (so next requests are authenticated)
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
