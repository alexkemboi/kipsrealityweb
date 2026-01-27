import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function getTenantBalance(leaseId: string) {
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
      (sum, inv) => sum + inv.totalAmount,
      0
    );

    const totalPaid = leaseWithInvoices.invoices.reduce(
      (sum, inv) => sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0),
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
