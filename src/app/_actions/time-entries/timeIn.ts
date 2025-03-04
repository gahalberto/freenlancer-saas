"use server"

import { db } from "@/app/_lib/prisma"

export const timeIn = async (userId: string, storeId: string, latitude: number | null = null, longitude: number | null = null) => {
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
      throw new Error('Você já registrou entrada nas últimas 2 horas!')
    }

    // Cria um novo registro de entrada
    return await db.timeEntries.create({
      data: {
        user_id: userId,
        store_id: storeId,
        entrace: now,
        latitude,
        longitude
      }
    })
  } catch (error: any) {
    console.error("Erro no server ao registrar entrada:", error)
    throw new Error(
      error.message || 
      "Não foi possível registrar sua entrada. Por favor, entre em contato com a administração."
    )
  }
}
