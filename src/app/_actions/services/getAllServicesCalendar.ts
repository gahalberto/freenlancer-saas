'use server'

import { db } from '@/app/_lib/prisma'

/**
 * Busca todos os serviços para o calendário
 * @returns Array de serviços com informações do evento, estabelecimento e mashguiach
 */
export async function getAllServicesCalendar() {
  try {
    const services = await db.eventsServices.findMany({
      where: {
        reallyMashguiachArrive: {
          not: null,
        },
        StoreEvents: {
          deletedAt: null,
        },
      },
      include: {
        StoreEvents: {
          include: {
            store: true,
          },
        },
        Mashguiach: true,
      },
      orderBy: {
        reallyMashguiachArrive: 'asc',
      },
    })

    return services
  } catch (error) {
    console.error('Erro ao buscar serviços para o calendário:', error)
    throw new Error('Erro ao buscar serviços para o calendário')
  }
}

/**
 * Busca serviços por intervalo de datas
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Array de serviços com informações do evento, estabelecimento e mashguiach
 */
export async function getServicesByDateRange(startDate: Date, endDate: Date) {
  try {
    const services = await db.eventsServices.findMany({
      where: {
        reallyMashguiachArrive: {
          not: null,
          gte: startDate,
          lte: endDate,
        },
        StoreEvents: {
          deletedAt: null,
        },
      },
      include: {
        StoreEvents: {
          include: {
            store: true,
          },
        },
        Mashguiach: true,
      },
      orderBy: {
        reallyMashguiachArrive: 'asc',
      },
    })

    return services
  } catch (error) {
    console.error('Erro ao buscar serviços por intervalo de datas:', error)
    throw new Error('Erro ao buscar serviços por intervalo de datas')
  }
} 