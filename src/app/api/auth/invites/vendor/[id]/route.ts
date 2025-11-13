// app/api/auth/invites/vendor/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can view vendor details
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Only property managers or system admins can view vendor details' }, { status: 403 })
    }

    const inviteId = params.id

    // Get vendor invite details
    const invite = await prisma.invite.findFirst({
      where: {
        id: inviteId,
        organizationId: payload.organizationId,
        role: 'VENDOR'
      }
    })

    if (!invite) {
      return NextResponse.json({ error: 'Vendor invite not found' }, { status: 404 })
    }

    // Build vendor view object. Note: invite.id != Vendor.id. If the invite was accepted and
    // a Vendor row exists, include its id as vendorRecordId so callers can reference the Vendor table.
    let vendor = {
      id: invite.id,
      email: invite.email,
      firstName: '',
      lastName: '',
      phone: '',
      companyName: '',
      serviceType: '',
      rating: 0,
      tasksInQueue: 0,
      specialty: '',
      availability: 'Not specified',
      accepted: invite.accepted,
      createdAt: invite.createdAt,
      vendorRecordId: null as string | null,
    }

    if (invite.accepted) {
      const user = await prisma.user.findUnique({ where: { email: invite.email } });

      if (user) {
        vendor = {
          ...vendor,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
        };

        // Try to find a Vendor record for this user/email in the same organization
        let vendorRecord = await prisma.vendor.findFirst({
          where: {
            organizationId: invite.organizationId,
            OR: [{ userId: user.id }, { email: invite.email }],
          },
        });

        // If vendor has accepted but no Vendor record exists, create one now with basic info
        // (this handles edge cases where invite was accepted without full vendor setup)
        if (!vendorRecord) {
          try {
            vendorRecord = await prisma.vendor.create({
              data: {
                userId: user.id,
                organizationId: invite.organizationId,
                companyName: vendor.companyName || `${user.firstName} ${user.lastName}`,
                serviceType: vendor.serviceType || 'General Services',
                email: invite.email,
                phone: user.phone || null,
                isActive: true,
              },
            });
          } catch (err) {
            // Vendor record might already exist or there's a constraint; log but continue
            console.warn('Failed to create vendor record on demand:', err);
          }
        }

        if (vendorRecord) {
          vendor.vendorRecordId = vendorRecord.id;
          // fill in company/service info from vendor record if available
          vendor.companyName = vendorRecord.companyName || vendor.companyName;
          vendor.serviceType = vendorRecord.serviceType || vendor.serviceType;
        }
      }
    }

    return NextResponse.json({
      success: true,
      vendor
    }, { status: 200 })

  } catch (error) {
    console.error('Get vendor details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can delete vendor invites
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Only property managers or system admins can delete vendor invites' }, { status: 403 })
    }

    const inviteId = params.id

    // Delete the invite
    await prisma.invite.delete({
      where: {
        id: inviteId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor invite deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Delete vendor invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
