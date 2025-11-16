import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const where = propertyId ? { propertyId: String(propertyId) } : {};
    const history = await prisma.occupancyHistory.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    return new Response(JSON.stringify(history), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch occupancy history' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
