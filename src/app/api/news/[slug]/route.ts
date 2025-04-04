import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: {
        slug: params.slug,
        isPublished: true,
      },
    })

    if (!news) {
      return NextResponse.json(
        { error: 'Notícia não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notícia' },
      { status: 500 },
    )
  }
} 