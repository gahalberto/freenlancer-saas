'use server'

import { db } from '@/app/_lib/prisma'
import { EventsAdresses } from '@prisma/client'

export const AddAddressToEvent = async (data: Omit<EventsAdresses, 'id'>) => {
  return await db.eventsAdresses.create({
    data: data,
  })
}
