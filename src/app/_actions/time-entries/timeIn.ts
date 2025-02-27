"use server"

import { db } from "@/app/_lib/prisma"

export const MashguiachEntrace = async (
  userId: string,
  latitude?: number,
  longitude?: number
) => {
  console.log("userId", userId)
  console.log("latitude", latitude)
  console.log("longitude", longitude)
  try {
    // Verifica se o usuário está vinculado a alguma loja
    const store = await db.fixedJobs.findFirst({
      where: { user_id: userId },
      select: { store_id: true },
    })

    if (!store) {
      throw new Error(
        "Você não está registrado em nenhuma loja! Entre em contato com a administração."
      )
    }

    // Define o intervalo das últimas 2 horas
    const now = new Date()
    const twoHoursAgo = new Date(now)
    twoHoursAgo.setHours(now.getHours() - 2)

    // Verifica se já houve uma entrada nas últimas 2 horas
    const alreadyExists = await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        data_hora: {
          gte: twoHoursAgo,
          lt: now,
        },
        type: "ENTRADA",
      },
    })

    if (alreadyExists) {
      throw new Error("Você já registrou uma entrada nas últimas 2 horas!")
    }

    // Cria o registro de entrada
    return await db.timeEntries.create({
      data: {
        user_id: userId,
        store_id: store.store_id,
        type: "ENTRADA",
        data_hora: new Date(),
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    })
  } catch (error: any) {
    console.error("Erro no server ao registrar entrada:", error)
    throw new Error(
      error.message ||
        "Não foi possível registrar sua entrada. Por favor, entre em contato com a administração."
    )
  }
}
