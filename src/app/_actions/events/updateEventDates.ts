"use server"
import { db } from "@/app/_lib/prisma"

export const updateEventDates = async (
  id: string, 
  arriveMashguiachTime: Date, 
  endMashguiachTime: Date,
  dayHourValue?: number,
  nightHourValue?: number,
  mashguiachPrice?: number
) => {
  try {
    if (!id || !arriveMashguiachTime || !endMashguiachTime) {
      throw new Error('ID ou datas não fornecidos.');
    }

    // Verificar se a data de início é anterior à data de fim
    if (new Date(arriveMashguiachTime) >= new Date(endMashguiachTime)) {
      throw new Error('A data de início deve ser anterior à data de fim.');
    }

    // Preparar os dados para atualização
    const updateData: any = {
      arriveMashguiachTime,
      endMashguiachTime,
    };

    // Adicionar valores de hora diurna e noturna se fornecidos
    if (dayHourValue !== undefined) {
      updateData.dayHourValue = dayHourValue;
    }

    if (nightHourValue !== undefined) {
      updateData.nightHourValue = nightHourValue;
    }

    // Adicionar o preço total do mashguiach se fornecido
    if (mashguiachPrice !== undefined) {
      updateData.mashguiachPrice = mashguiachPrice;
    }

    const updatedEvent = await db.eventsServices.update({
      where: {
        id,
      },
      data: updateData,
    });

    return updatedEvent;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw new Error('Falha ao atualizar o serviço.');
  }
}; 