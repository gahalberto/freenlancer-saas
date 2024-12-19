'use server'

import { db } from '@/app/_lib/prisma'

export const getAllEvents = async () => {
  return await db.storeEvents.findMany({
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
