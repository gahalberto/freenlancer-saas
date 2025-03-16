import { NextResponse } from 'next/server'
import { db as prisma } from '@/app/_lib/prisma'

export async function POST(request: Request) {
  try {
    const { storeId, imageUrl } = await request.json()

    if (!storeId || !imageUrl) {
      return NextResponse.json(
        { error: 'ID do estabelecimento e URL da imagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar o campo imageUrl no banco de dados
    const updatedStore = await prisma.stores.update({
      where: {
        id: storeId,
      },
      data: {
        imageUrl: imageUrl,
      },
    })

    return NextResponse.json({ success: true, store: updatedStore })
  } catch (error) {
    console.error('Erro ao atualizar imageUrl:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar a imagem do estabelecimento' },
      { status: 500 }
    )
  }
} 