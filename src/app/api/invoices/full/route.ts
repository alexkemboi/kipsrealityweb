import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FullInvoiceInput } from '@/app/data/FinanceData';

export async function POST(req: NextRequest) {
  const { lease_id, type }: FullInvoiceInput = await req.json();

  if (!lease_id || !type) {
    return NextResponse.json({ error: 'lease_id and type are required' }, { status: 400 });
  }

  const lease = await prisma.lease.findUnique({ where: { id: lease_id } });
  if (!lease ) {
    return NextResponse.json({ error: 'Active lease not found' }, { status: 404 });
  }

  // Determine amount automatically
  let amount = 0;
  if (type === 'RENT') {
    amount = lease.rentAmount;
  } else {
    // Utilities: sum all fixed utilities linked to lease
    const leaseUtilities = await prisma.leaseUtility.findMany({
      where: { leaseId: lease_id },
      include: { utility: true },
    });
    amount = leaseUtilities.reduce((sum, lu) => sum + (lu.utility.fixedAmount || 0), 0);
  }

const dueDate = calculateNextDueDate({
  ...lease,
  paymentDueDay: lease.paymentDueDay ?? undefined,
});

  const invoice = await prisma.invoice.create({
    data: {
      leaseId: lease_id,
      type,
      amount,
      dueDate,
      status: 'PENDING',
    },
  });

  return NextResponse.json(invoice);
}

// Helper function
function calculateNextDueDate(lease: { paymentFrequency: string; paymentDueDay?: number }) {
  const now = new Date();
  const day = lease.paymentDueDay || now.getDate();
  const nextDate = new Date(now.getFullYear(), now.getMonth(), day);

  if (lease.paymentFrequency === 'MONTHLY') {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (lease.paymentFrequency === 'QUARTERLY') {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (lease.paymentFrequency === 'YEARLY') {
    if (nextDate < now) nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}
