// app/api/auth/invites/vendor/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: inviteId } = await params;

    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can view vendor details
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

        let vendorRecord = await prisma.vendor.findFirst({
          where: {
            organizationId: invite.organizationId,
            OR: [{ userId: user.id }, { email: invite.email }],
          },
        });

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
            console.warn('Failed to create vendor record on demand:', err);
          }
        }

        if (vendorRecord) {
          vendor.vendorRecordId = vendorRecord.id;
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: inviteId } = await params;

    // Validate auth token (cookie)
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    // Only property managers or system admins can delete vendor invites
    if (payload.role !== 'PROPERTY_MANAGER' && payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.invite.delete({
      where: {
        id: inviteId,
        organizationId: payload.organizationId
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
