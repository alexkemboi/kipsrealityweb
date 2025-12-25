import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ManualInvoiceInput } from '@/app/data/FinanceData';

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
      type: body.type,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      status: 'PENDING',
    },
  });

  return NextResponse.json(invoice);
}
