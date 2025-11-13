import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as 'PENDING' | 'PAID' | 'OVERDUE' | null;
  const lease_id = url.searchParams.get('lease_id');
  const type = url.searchParams.get('type') as 'RENT' | 'UTILITY' | null;

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status && { status }),
      ...(lease_id && { lease_id }),
      ...(type && { type }),
    },
    include: { Lease: true },
  });

  return NextResponse.json(invoices);
}
