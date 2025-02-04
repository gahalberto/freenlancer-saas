'use server'

import { db } from '@/app/_lib/prisma'

export const getEventsByStoreId = async (storeId: string) => {
  return await db.storeEvents.findMany({
    where: {
      storeId,
    },
    include: {
      EventsServices: true,
    },
  })
}
