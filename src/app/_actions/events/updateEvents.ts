'use server'

import { db } from '@/app/_lib/prisma'
import { StoreEvents } from '@prisma/client'

interface eventsProps {
  data: Partial<StoreEvents>
  eventId: string
}

export const updateEvents = async ({ data, eventId }: eventsProps) => {
  try {
    await db.storeEvents.update({
      where: {
        id: eventId,
      },
      data,
    })

    return true
  } catch (error) {
    throw error
  }
}
