import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const hero = await prisma.heroSection.findUnique({ where: { id } })

    if (!hero) {
      return NextResponse.json({ error: 'Hero section not found' }, { status: 404 })
    }

    return NextResponse.json(hero)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const data = await req.json()

    const updated = await prisma.heroSection.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    await prisma.heroSection.delete({ where: { id } })
    return NextResponse.json({ message: 'Hero section deleted successfully' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 })
  }
}
