'use server'

import { db } from '@/app/_lib/prisma'

export const getAllEvents = async () => {
  return await db.storeEvents.findMany({
    where: {
      deletedAt: null,
      date: {
        gte: new Date()
      }
    },
    include: {
      store: true,
      EventsServices: {
        include: {
          Mashguiach: true, // Inclui os dados do usuário relacionado
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })
}
