"use server"
import { db } from "@/app/_lib/prisma"

export const updateEventDates = async (
  id: string, 
  arriveMashguiachTime: Date, 
  endMashguiachTime: Date
) => {
  try {
    if (!id || !arriveMashguiachTime || !endMashguiachTime) {
      throw new Error('ID ou datas não fornecidos.');
    }

    // Verificar se a data de início é anterior à data de fim
    if (new Date(arriveMashguiachTime) >= new Date(endMashguiachTime)) {
      throw new Error('A data de início deve ser anterior à data de fim.');
    }

    const updatedEvent = await db.eventsServices.update({
      where: {
        id,
      },
      data: {
        arriveMashguiachTime,
        endMashguiachTime,
      },
    });

    return updatedEvent;
  } catch (error) {
    console.error('Erro ao atualizar datas do evento:', error);
    throw new Error('Falha ao atualizar as datas do evento.');
  }
}; 