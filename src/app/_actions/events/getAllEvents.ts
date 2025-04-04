'use server'

import { db } from '@/app/_lib/prisma'

export const getAllEvents = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [events, total] = await Promise.all([
    db.storeEvents.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: new Date()
        }
      },
      include: {
        store: {
          select: {
            title: true
          }
        },
        // Removendo dados desnecessários para a listagem inicial
        _count: {
          select: {
            EventsServices: true
          }
        }
      },
      orderBy: {
        date: 'asc',
      },
      skip,
      take: limit
    }),
    db.storeEvents.count({
      where: {
        deletedAt: null,
        date: {
          gte: new Date()
        }
      }
    })
  ]);

  return {
    events,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      limit
    }
  }
}

// Função para buscar detalhes completos de um único evento (quando for necessário)
export const getEventDetails = async (eventId: string) => {
  return await db.storeEvents.findUnique({
    where: {
      id: eventId,
      deletedAt: null
    },
    include: {
      store: true,
      EventsServices: {
        include: {
          Mashguiach: true,
        },
      },
    }
  })
}
