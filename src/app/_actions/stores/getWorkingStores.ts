"use server"

import { db } from "@/app/_lib/prisma"
import { subWeeks, addWeeks } from "date-fns"

// Função para buscar as lojas onde o usuário trabalhou nas últimas 2 semanas ou vai trabalhar nas próximas 2 semanas
export const getWorkingStores = async (userId: string) => {
  // Calcula o intervalo de 2 semanas para trás e para frente a partir da data atual
  const twoWeeksAgo = subWeeks(new Date(), 2)
  const twoWeeksAhead = addWeeks(new Date(), 2)

  // Busca os eventos de serviço que envolvem o usuário e estão dentro desse intervalo de tempo
  const eventsServices = await db.eventsServices.findMany({
    where: {
      mashguiachId: userId,
      arriveMashguiachTime: {
        gte: twoWeeksAgo, // Data de chegada maior ou igual a 2 semanas atrás
        lte: twoWeeksAhead, // Data de chegada menor ou igual a 2 semanas no futuro
      },
    },
    include: {
      StoreEvents: true, // Inclui os eventos relacionados para obter o storeId
    },
  })

  // Extraímos os storeIds únicos dos eventos de serviço
  const storeIds = eventsServices.map(eventService => eventService.StoreEvents.storeId)

  // Remove duplicatas (caso tenha mais de um serviço na mesma loja)
  const uniqueStoreIds = [...new Set(storeIds)]

  // Busca as lojas com base nos storeIds
  const stores = await db.stores.findMany({
    where: {
      id: { in: uniqueStoreIds },
    },
  })

  return stores
}
