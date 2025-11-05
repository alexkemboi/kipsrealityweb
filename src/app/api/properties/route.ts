import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const properties = await prisma.property.findMany({
      where: { organizationId },
      select: { id: true, address: true, city: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Fetch properties error', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
