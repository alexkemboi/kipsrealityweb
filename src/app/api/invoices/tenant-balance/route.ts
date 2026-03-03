import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal-utils";

async function getTenantBalance(leaseId: string) {
  try {
    const leaseWithInvoices = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!leaseWithInvoices) {
      throw new Error("Lease not found");
    }

    // Calculate totals
    const totalInvoiced = leaseWithInvoices.invoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
    );

    const totalPaid = leaseWithInvoices.invoices.reduce(
      (sum, inv) => sum + inv.payments.reduce((pSum, p) => pSum + Number(p.amount), 0),
      0
    );

    const balance = totalInvoiced - totalPaid;

    return {
      leaseId,
      tenant: leaseWithInvoices.tenantId,
      totalInvoiced,
      totalPaid,
      balance,
    };
  } catch (error) {
    console.error("Error calculating tenant balance:", error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ leaseId?: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const leaseId = searchParams.get("leaseId");

    if (!leaseId) {
      return NextResponse.json(
        { error: "leaseId query parameter is required" },
        { status: 400 }
      );
    }

    const balanceData = await getTenantBalance(leaseId);
    return NextResponse.json(balanceData);
  } catch (error: unknown) {
    console.error("Error in GET /api/invoices/tenant-balance:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
