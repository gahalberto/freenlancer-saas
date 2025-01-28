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
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined, // Verifica se 'data.date' existe antes de criar um 'Date'
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};
