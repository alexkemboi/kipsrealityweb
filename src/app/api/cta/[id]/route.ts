import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);

    const cta = await prisma.cTA.findUnique({ where: { id } });

    if (!cta) {
      return NextResponse.json({ error: "CTA not found" }, { status: 404 });
    }

    return NextResponse.json(cta);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { page, title, subtitle, buttonText, buttonUrl, gradient } = await req.json()
    const updatedCTA = await prisma.cTA.update({
      where: { id },
      data: { page, title, subtitle, buttonText, buttonUrl, gradient },
    })
    return NextResponse.json(updatedCTA)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update CTA' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    await prisma.cTA.delete({ where: { id } })
    return NextResponse.json({ message: 'CTA deleted successfully' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete CTA' }, { status: 500 })
  }
}
