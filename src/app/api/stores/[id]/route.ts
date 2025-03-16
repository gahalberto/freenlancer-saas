import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id

    const store = await db.stores.findUnique({
      where: {
        id: storeId,
      },
      include: {
        storeType: true,
        Certifications: true,
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estabelecimento' },
      { status: 500 }
    )
  }
} 