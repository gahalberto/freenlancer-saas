"use server"
import { db } from "@/app/_lib/prisma"

export const updateEventDates = async (
  id: string, 
  arriveMashguiachTime: Date, 
  endMashguiachTime: Date,
  dayHourValue?: number,
  nightHourValue?: number,
  mashguiachPrice?: number,
  transport_price?: number
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

    // Adicionar o preço de transporte, se fornecido
    if (transport_price !== undefined) {
      updateData.transport_price = transport_price;
    }

    // Calcular o preço total se os valores de hora forem fornecidos
    if (dayHourValue !== undefined || nightHourValue !== undefined) {
      // Usar os valores fornecidos ou valores padrão
      const dayHourValueToUse = dayHourValue ?? 50;
      const nightHourValueToUse = nightHourValue ?? 75;
      
      // Calcular a duração e o preço
      const startDateTime = new Date(arriveMashguiachTime);
      const endDateTime = new Date(endMashguiachTime);
      
      // Calcular duração total em horas
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      // Calcular horas diurnas e noturnas
      let dayHours = 0;
      let nightHours = 0;
      
      // Criar cópias das datas para manipulação
      const currentTime = new Date(startDateTime);
      
      // Iterar hora a hora
      while (currentTime < endDateTime) {
        const hour = currentTime.getHours();
        
        // Verificar se é hora diurna (6h-22h) ou noturna (22h-6h)
        if (hour >= 22 || hour < 6) {
          nightHours += 1;
        } else {
          dayHours += 1;
        }
        
        // Avançar 1 hora
        currentTime.setHours(currentTime.getHours() + 1);
      }
      
      // Ajustar a última hora parcial
      const endMinutes = endDateTime.getMinutes();
      const endHour = endDateTime.getHours();
      const lastHourFraction = endMinutes / 60;
      
      if (endHour >= 22 || endHour < 6) {
        nightHours -= (1 - lastHourFraction);
      } else {
        dayHours -= (1 - lastHourFraction);
      }
      
      // Garantir que não haja valores negativos
      dayHours = Math.max(0, dayHours);
      nightHours = Math.max(0, nightHours);
      
      // Calcular valores
      const dayValue = dayHours * dayHourValueToUse;
      const nightValue = nightHours * nightHourValueToUse;
      const totalValue = dayValue + nightValue;
      
      // Atualizar o preço total (sem incluir o transporte)
      updateData.mashguiachPrice = totalValue;
    } else if (mashguiachPrice !== undefined) {
      // Adicionar o preço total do mashguiach se fornecido
      // Este valor já inclui o transporte, pois foi calculado no frontend
      updateData.mashguiachPrice = mashguiachPrice;
    }

    // Primeiro, atualizar os campos principais
    const updatedEvent = await db.eventsServices.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Se os valores de hora foram fornecidos, atualizar diretamente no banco de dados
    // usando uma consulta SQL bruta
    if (dayHourValue !== undefined || nightHourValue !== undefined) {
      try {
        console.log('Atualizando valores de hora via SQL:', { dayHourValue, nightHourValue });
        
        // Construir a consulta SQL
        let sql = `UPDATE "EventsServices" SET `;
        const params: any[] = [];
        let paramIndex = 1;
        
        if (dayHourValue !== undefined) {
          sql += `"dayHourValue" = $${paramIndex}`;
          params.push(dayHourValue);
          paramIndex++;
        }
        
        if (nightHourValue !== undefined) {
          if (paramIndex > 1) sql += ', ';
          sql += `"nightHourValue" = $${paramIndex}`;
          params.push(nightHourValue);
          paramIndex++;
        }
        
        sql += ` WHERE "id" = $${paramIndex}`;
        params.push(id);
        
        // Executar a consulta SQL
        await db.$executeRawUnsafe(sql, ...params);
        
        console.log('Valores de hora atualizados com sucesso via SQL');
      } catch (sqlError) {
        console.error('Erro ao atualizar valores de hora via SQL:', sqlError);
      }
    }

    return updatedEvent;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw new Error('Falha ao atualizar o serviço.');
  }
};