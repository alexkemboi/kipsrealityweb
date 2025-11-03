import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log(' Received request body:', JSON.stringify(body, null, 2))
    
    const { email, token, password, firstName, lastName, phone } = body

    // Check 1: Required fields
    if (!email || !token || !password) {
      console.log(' Missing required fields:', { 
        hasEmail: !!email, 
        hasToken: !!token, 
        hasPassword: !!password 
      })
      return NextResponse.json({ error: 'Email, token and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()
    console.log(' Searching for invite - Token:', token, 'Email:', normalizedEmail)

    // Find invite by token
    const invite = await prisma.invite.findUnique({
      where: { token }
    })

    console.log(' Invite found:', invite ? {
      id: invite.id,
      email: invite.email,
      accepted: invite.accepted,
      expiresAt: invite.expiresAt,
      organizationId: invite.organizationId
    } : 'null')

    // Check 2: Invite exists and email matches
    if (!invite || invite.email !== normalizedEmail) {
      console.log(' Invite validation failed:', {
        inviteExists: !!invite,
        inviteEmail: invite?.email,
        providedEmail: normalizedEmail,
        emailsMatch: invite?.email === normalizedEmail
      })
      return NextResponse.json({ error: 'Invalid invite token or email' }, { status: 400 })
    }

    // Check 3: Not already accepted
    if (invite.accepted) {
      console.log(' Invite already accepted')
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    }

    // Check 4: Not expired
    if (invite.expiresAt < new Date()) {
      console.log(' Invite expired:', {
        expiresAt: invite.expiresAt,
        now: new Date()
      })
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    console.log(' All validations passed, creating/updating user...')

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
          firstName: firstName?.trim() || existingUser.firstName,
          lastName: lastName?.trim() || existingUser.lastName,
          phone: phone?.trim() || existingUser.phone,
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
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
          phone: phone?.trim() || null,
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

    console.log(' User created and logged in successfully')
    return response

  } catch (error) {
    console.error(' Accept invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}