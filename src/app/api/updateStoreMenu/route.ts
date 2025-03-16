import { NextResponse } from 'next/server'
import { db as prisma } from '@/app/_lib/prisma'

export async function POST(request: Request) {
  try {
    const { storeId, menuUrl } = await request.json()

    if (!storeId || !menuUrl) {
      return NextResponse.json(
        { error: 'ID do estabelecimento e URL do cardápio são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar o campo menuUrl no banco de dados
    const updatedStore = await prisma.stores.update({
      where: {
        id: storeId,
      },
      data: {
        menuUrl: menuUrl,
      },
    })

    return NextResponse.json({ success: true, store: updatedStore })
  } catch (error) {
    console.error('Erro ao atualizar menuUrl:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar o cardápio do estabelecimento' },
      { status: 500 }
    )
  }
} 