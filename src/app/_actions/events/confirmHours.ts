"use server"
import { db } from "@/app/_lib/prisma"

export const confirmEntrance = async (id: string, entranceTime: Date) => {
  try {
    if (!id || !entranceTime) {
      throw new Error('ID ou horário de entrada não fornecidos.');
    }

    const updatedEvent = await db.eventsServices.update({
      where: {
        id,
      },
      data: {
        reallyMashguiachArrive: entranceTime,
      },
    });

    return updatedEvent;
  } catch (error) {
    console.error('Erro ao confirmar horário de entrada:', error);
    throw new Error('Falha ao confirmar o horário de entrada.');
  }
};