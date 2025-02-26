'use server'

import { db } from '@/app/_lib/prisma'

export const getEventInfo = async (id: string) => {
  const event = await db.storeEvents.findUnique({
    where: { id },
    include: {
      eventOwner: true,
      store: true,
      EventsAdresses: true,
    },
  })
  
  console.log(event)
  
  return event;
}