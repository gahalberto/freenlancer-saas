'use server'

import { db } from '@/app/_lib/prisma'

export const getPeddingEvent = async () => {
  return await db.storeEvents.findMany({
    where: {
      deletedAt: null,
      isApproved: true,
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
