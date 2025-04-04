'use server'

import { db } from '@/app/_lib/prisma'
import { StoreEvents } from '@prisma/client'

interface eventsProps {
  data: Partial<StoreEvents>
  eventId: string
}

export const updateEvents = async ({ data, eventId }: eventsProps) => {
  try {
    // Verificar se o evento existe antes de tentar atualizá-lo
    const eventExists = await db.storeEvents.findUnique({
      where: { id: eventId }
    });

    if (!eventExists) {
      throw new Error("Evento não encontrado");
    }

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
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
};
