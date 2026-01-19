import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ManualInvoiceInput } from '@/app/data/FinanceData';
import { financeActions } from "@/lib/finance/actions";

export async function POST(req: NextRequest) {
  const body: ManualInvoiceInput = await req.json();

  if (!body.lease_id || !body.type || !body.amount || !body.dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate lease exists
  const lease = await prisma.lease.findUnique({ where: { id: body.lease_id } });
  if (!lease) return NextResponse.json({ error: 'Lease not found' }, { status: 404 });

  const invoice = await prisma.invoice.create({
    data: {
      leaseId: body.lease_id,
      type: body.type as any,
      totalAmount: body.amount,
      amountPaid: 0,
      balance: body.amount,
      dueDate: new Date(body.dueDate),
      status: 'PENDING',
      postingStatus: 'PENDING',
    },
  });

  // TRIGGER GL POSTING
  try {
    console.log(`GL: Posting Invoice ${invoice.id}...`);
    await financeActions.postInvoiceToGL(invoice.id);
  } catch (glError) {
    console.error("GL Posting Failed (Background task will retry):", glError);
  }

  // Return the freshest version so callers can assert postingStatus/journalEntryId
  const refreshed = await prisma.invoice.findUnique({ where: { id: invoice.id } });
  return NextResponse.json(refreshed || invoice);
}
