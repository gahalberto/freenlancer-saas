'use server'

import { db } from '@/app/_lib/prisma'

export const getAddressByEventId = async (storeEventId: string) => {
  return await db.eventsAdresses.findMany({
    where: {
      storeEventId,
    },
  })
}
