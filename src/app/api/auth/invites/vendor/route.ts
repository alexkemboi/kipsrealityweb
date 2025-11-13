// app/api/invites/vendor/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: Request) {
  try {
    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can view vendor invites
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Only property managers or system admins can view vendor invites' }, { status: 403 })
    }

    // Get all vendor invites for this organization
    const invites = await prisma.invite.findMany({
      where: {
        organizationId: payload.organizationId,
        role: 'VENDOR'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      invites
    }, { status: 200 })

  } catch (error) {
    console.error('Get vendor invites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can invite vendors
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Only property managers or system admins can invite vendors' }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName, phone, companyName, serviceType } = body

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Email and first name are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // If a user already exists and is active, block invite
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser && existingUser.status === 'ACTIVE') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    // Generate secure invite token
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Persist invite in DB
    const invite = await prisma.invite.create({
      data: {
        email: normalizedEmail,
        token: inviteToken,
        role: 'VENDOR',
        organizationId: payload.organizationId,
        invitedById: payload.userId,
        expiresAt: inviteExpires,
      }
    })

    // Build an invite link (send by email in production)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/inviteor?token=${inviteToken}&email=${encodeURIComponent(normalizedEmail)}`

    // TODO: enqueue/send email with inviteLink & companyName/serviceType in production

    return NextResponse.json({
      success: true,
      message: 'Vendor invited successfully',
      inviteId: invite.id,
      inviteLink: process.env.NODE_ENV === 'development' ? inviteLink : undefined
    }, { status: 201 })

  } catch (error) {
    console.error('Invite vendor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
