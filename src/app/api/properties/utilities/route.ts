// @ts-nocheck
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/properties/utilities?propertyIds=... or ?propertyId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyIds: string[] = searchParams.get('propertyIds')?.split(',').filter(Boolean) || [];
  const propertyId: string | null = searchParams.get('propertyId');
  const month: string | null = searchParams.get('month'); // format: YYYY-MM

  let propertyFilter: Record<string, any> = {};
  if (propertyIds.length > 0) {
    propertyFilter = { id: { in: propertyIds } };
  } else if (propertyId) {
    propertyFilter = { id: propertyId };
  }

  // Get all properties in scope
  const properties: Array<{ id: string; name: string }> = await prisma.property.findMany({
    where: propertyFilter,
    select: { id: true, name: true }
  });
  if (!properties.length) return NextResponse.json([]);

  // Date filter for month
  let dateFilter: Record<string, any> = {};
  if (month && month !== 'all') {
    // month format: YYYY-MM
    const [year, m] = month.split('-');
    const start = new Date(Number(year), Number(m) - 1, 1);
    const end = new Date(Number(year), Number(m), 1);
    dateFilter = {
      paidOn: {
        gte: start,
        lt: end,
      },
    };
  }

  // Get all payments for these properties, joined to invoice (for type) and lease (for propertyId)
  const payments: Array<any> = await prisma.payment.findMany({
    where: {
      invoice: {
        Lease: { propertyId: { in: properties.map((p: { id: string }) => p.id) } }
      },
      isReversed: false,
      ...dateFilter,
    },
    include: {
      invoice: {
        select: { type: true, Lease: { select: { propertyId: true } } }
      }
    }
  });

  // Aggregate totals by property and type
  const result: Record<string, { propertyId: string; propertyName: string; rentCollected: number; utilitiesPaid: number }> = {};
  for (const p of properties) {
    result[p.id] = { propertyId: p.id, propertyName: p.name, rentCollected: 0, utilitiesPaid: 0 };
  }
  for (const pay of payments) {
    // Optional chaining in case of bad data, though schema enforces it
    if (!pay.invoice?.Lease?.propertyId) continue;

    const propId: string = pay.invoice.Lease.propertyId;
    if (!result[propId]) continue;
    if (pay.invoice.type === 'RENT') result[propId].rentCollected += pay.amount;
    if (pay.invoice.type === 'UTILITY') result[propId].utilitiesPaid += pay.amount;
  }

  return NextResponse.json(Object.values(result));
}
