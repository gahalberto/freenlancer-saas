'use server'
import { db } from '@/app/_lib/prisma'
import { EventsServices, StoreEvents, User } from '@prisma/client'

// Extender o tipo EventsServices para incluir o StoreEvents
export interface EventsServicesWithStoreEvents extends EventsServices {
  StoreEvents: StoreEvents
  Mashguiach: User | null
}

export const getServiceById = async (id: string): Promise<EventsServicesWithStoreEvents | null> => {
  try {
    const service = await db.eventsServices.findUnique({
      where: { id },
      include: {
        StoreEvents: {
          include: {
            EventsAdresses: true,
          },
        },
        Mashguiach: true,
      }, // Incluindo o relacionamento StoreEvents
    })
    return service
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return null
  }
}
