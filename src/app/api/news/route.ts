import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notícias' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { title, summary, content, imageUrl, category } = body

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const news = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        imageUrl,
        category,
        slug,
        isPublished: true,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { error: 'Erro ao criar notícia' },
      { status: 500 },
    )
  }
} 