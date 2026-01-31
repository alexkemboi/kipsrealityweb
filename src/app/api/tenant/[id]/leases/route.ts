import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/Getcurrentuser';

export async function GET(
  request: Request
) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all ACTIVE leases for the current tenant
    const leases = await prisma.lease.findMany({
      where: {
        tenantId: user.id,
        leaseStatus: 'ACTIVE'
      },
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        },
        unit: {
          select: {
            unitNumber: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: leases.length,
      leases: leases.map(lease => ({
        id: lease.id,
        property: {
          propertyName: lease.property.name || 'Unnamed Property',
          address: lease.property.address
        },
        unit: {
          unitNumber: lease.unit?.unitNumber || 'N/A'
        },
        rentAmount: lease.rentAmount,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate.toISOString(),
        leaseStatus: lease.leaseStatus
      }))
    });

  } catch (error: unknown) {
    console.error('Tenant leases error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leases';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}