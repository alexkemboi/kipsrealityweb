import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') // optional page filter

    const heroes = await prisma.heroSection.findMany({
      where: page ? { page: page.trim() } : undefined,
    })

    return NextResponse.json(heroes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch hero sections' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const hero = await prisma.heroSection.create({
      data: {
        page: data.page,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        buttonText: data.buttonText,
        buttonUrl: data.buttonUrl,
        imageUrl: data.imageUrl,
        iconUrl: data.iconUrl,
        searchBar: data.searchBar ?? false,
        gradient: data.gradient,
        layout: data.layout,
      },
    })

    return NextResponse.json(hero)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create hero section' }, { status: 500 })
  }
}
