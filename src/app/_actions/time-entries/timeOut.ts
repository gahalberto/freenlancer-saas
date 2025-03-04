"use server"

import { db } from "@/app/_lib/prisma"

export const timeOut = async (userId: string, storeId: string, latitude: number | null = null, longitude: number | null = null) => {
  try {
    // Verifica se o usuário está vinculado a alguma loja
    const store = await db.fixedJobs.findFirst({
      where: { 
        user_id: userId,
        deletedAt: null
      },
      select: { store_id: true }
    })

    if (!store) {
      throw new Error('Você não está registrado em nenhuma loja! Entre em contato com a administração.')
    }

    // Define o intervalo das últimas 2 horas
    const now = new Date()
    const twoHoursAgo = new Date(now)
    twoHoursAgo.setHours(now.getHours() - 2)

    // Verifica se já existe uma saída nas últimas 2 horas
    const recentExit = await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        exit: {
          gte: twoHoursAgo,
          lt: now
        }
      }
    })

    if (recentExit) {
      throw new Error('Você já registrou saída nas últimas 2 horas!')
    }

    // Busca a entrada mais recente sem saída
    const openEntry = await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        entrace: { not: null },
        exit: null
      },
      orderBy: {
        entrace: 'desc'
      }
    })

    if (!openEntry) {
      throw new Error('Não foi encontrada uma entrada em aberto para registrar saída!')
    }

    // Atualiza o registro com a saída
    return await db.timeEntries.update({
      where: {
        id: openEntry.id
      },
      data: {
        exit: now,
        latitude,
        longitude
      }
    })
  } catch (error: any) {
    console.error("Erro no server ao registrar saída:", error)
    throw new Error(
      error.message || 
      "Não foi possível registrar sua saída. Por favor, entre em contato com a administração."
    )
  }
}
