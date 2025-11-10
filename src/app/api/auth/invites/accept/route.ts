import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log(' Received request body:', body)

    const { email, token, password, firstName, lastName, phone } = body

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, token, and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // ✅ 1. Try find invite by `token` normally
    let invite = await prisma.invite.findUnique({
      where: { token }
    })

    console.log("Invite via token:", invite?.id || "NO INVITE FOUND")

    // ✅ 2. If not found → treat token as leaseId
    if (!invite) {
      console.log("Token is NOT an invite token. Trying to interpret as leaseId…")

      const lease = await prisma.lease.findUnique({
        where: { id: token },
        include: { invites: true }
      })

      if (!lease || lease.invites.length === 0) {
        return NextResponse.json(
          { error: 'Invalid invite or lease. Cannot continue.' },
          { status: 400 }
        )
      }

      invite = lease.invites[0]
      console.log("Invite found through lease:", invite.id)
    }

    // ✅ 3. Validate invite
    if (invite.email !== normalizedEmail) {
      return NextResponse.json(
        { error: 'Invite email does not match' },
        { status: 400 }
      )
    }

    if (invite.accepted) {
      return NextResponse.json(
        { error: 'Invite already used' },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      )
    }

    // ✅ 4. Create or update user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const hashedPassword = await bcrypt.hash(password, 12)
    let user

    if (existingUser) {
      if (existingUser.status === 'ACTIVE') {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }

      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          status: 'ACTIVE',
          emailVerified: true
        }
      })
    } else {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          status: 'ACTIVE',
          emailVerified: true
        }
      })
    }

    // ✅ 5. Link user to organization
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId: invite.organizationId
      }
    })

    if (!orgUser) {
      await prisma.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role
        }
      })
    }

    // ✅ 6. Mark invite accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { accepted: true }
    })

    // ✅ 7. Return success (we do NOT auto-login)
    return NextResponse.json({
      success: true,
      message: 'Invite accepted. You may now log in.',
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
