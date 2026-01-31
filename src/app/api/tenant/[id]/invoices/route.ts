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

    // Fetch all invoices for this tenant's active leases
    const invoices = await prisma.invoice.findMany({
      where: {
        Lease: {
          tenantId: user.id,
          leaseStatus: 'ACTIVE'
        }
      },
      include: {
        payments: {
          select: {
            amount: true,
            paidOn: true
          }
        },
        Lease: {
          include: {
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
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    });

    // Transform invoices to match the expected interface
    const transformedInvoices = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance = invoice.totalAmount - totalPaid;
      
      return {
        id: invoice.id,
        type: invoice.type,
        totalAmount: invoice.totalAmount,
        balance: balance,
        amountPaid: totalPaid,
        status: invoice.status || 'PENDING',
        dueDate: invoice.dueDate.toISOString(),
        description: `Invoice for ${invoice.Lease.property.name} - Unit ${invoice.Lease.unit.unitNumber}`,
        createdAt: invoice.createdAt?.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      count: transformedInvoices.length,
      invoices: transformedInvoices
    });

  } catch (error: unknown) {
    console.error('Tenant invoices error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch invoices';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}