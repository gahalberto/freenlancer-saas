// pages/api/entry.ts
import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, storeId, latitude, longitude } = await request.json()

    // Validações básicas
    if (!userId || !storeId) {
      return NextResponse.json(
        { error: 'Usuário e estabelecimento são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se o usuário está vinculado a alguma loja
    const store = await db.fixedJobs.findFirst({
      where: { 
        user_id: userId,
        deletedAt: null
      },
      select: { store_id: true }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Você não está registrado em nenhuma loja! Entre em contato com a administração.' },
        { status: 400 }
      )
    }

    // Define o intervalo das últimas 2 horas
    const now = new Date()
    const twoHoursAgo = new Date(now)
    twoHoursAgo.setHours(now.getHours() - 2)

    // Verifica se já existe uma entrada nas últimas 2 horas
    const recentEntry = await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        entrace: {
          gte: twoHoursAgo,
          lt: now
        }
      }
    })

    if (recentEntry) {
      return NextResponse.json(
        { error: 'Você já registrou entrada nas últimas 2 horas!' },
        { status: 400 }
      )
    }

    // Cria um novo registro de entrada
    const entry = await db.timeEntries.create({
      data: {
        user_id: userId,
        store_id: storeId,
        entrace: now,
        latitude,
        longitude
      }
    })

    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Erro ao registrar entrada:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar entrada. Por favor, tente novamente.' },
      { status: 500 }
    )
  }
}
