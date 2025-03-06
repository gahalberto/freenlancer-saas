"use server"

import { db } from "@/app/_lib/prisma";

export const confirmExit = async (id: string, exitTime: Date) => {
    try {
      if (!id || !exitTime) {
        throw new Error('ID ou horário de saída não fornecidos.');
      }
  
      const updatedEvent = await db.eventsServices.update({
        where: {
          id,
        },
        data: {
          reallyMashguiachEndTime: exitTime,
        },
      });
  
      return updatedEvent;
    } catch (error) {
      console.error('Erro ao confirmar horário de saída:', error);
      throw new Error('Falha ao confirmar o horário de saída.');
    }
  };
  