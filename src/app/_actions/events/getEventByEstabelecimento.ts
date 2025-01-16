'use server'

import { db } from '@/app/_lib/prisma'

export const getEventByEstabelecimento = async (userId: string) => {
  return await db.storeEvents.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      EventsServices: true,
    },
  })
}
