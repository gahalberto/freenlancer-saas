'use server'

import { db } from '@/app/_lib/prisma'

export const getAllServices = async () => {
  const services = await db.eventsServices.findMany({
    include: {
      StoreEvents: {
        include: {
          EventsAdresses: true,
        },
      },
    },
  })

  return services
}
