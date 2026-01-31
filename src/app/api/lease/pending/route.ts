import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (authError) {
      console.error('Auth Token Verification Error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!payload?.organizationId) {
      return NextResponse.json({ error: 'Organization required' }, { status: 403 });
    }

    const orgId = payload.organizationId;

    // 2. Find leases that are DRAFT or SIGNED (waiting for landlord)
    const pendingLeases = await prisma.lease.findMany({
      where: {
        property: {
          organizationId: orgId
        },
        OR: [
          { leaseStatus: 'DRAFT' },
          { leaseStatus: 'SIGNED' }
        ]
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        unit: {
          select: {
            unitNumber: true
          }
        },
        property: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: pendingLeases.length,
      leases: pendingLeases
    });

  } catch (error: unknown) {
    console.error('Pending leases error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}