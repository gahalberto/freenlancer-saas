import { NextApiRequest, NextApiResponse } from 'next';
import { getTimesByUserAndMonth } from '@/app/_actions/time-entries/getTimesByUserAndMonth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Obter mês e ano da query ou usar o mês e ano atual
    const currentDate = new Date();
    let month = parseInt(req.query.month as string) || currentDate.getMonth() + 1; // getMonth() retorna 0-11
    let year = parseInt(req.query.year as string) || currentDate.getFullYear();

    // Validar mês e ano
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mês inválido. Deve estar entre 1 e 12.' });
    }

    if (year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Ano inválido. Deve estar entre 2000 e 2100.' });
    }

    // Buscar os registros de tempo do usuário para o mês e ano especificados
    const timeEntries = await getTimesByUserAndMonth(userId, month, year);

    // Corrigir o problema de saídas após meia-noite
    const correctedEntries = { ...timeEntries };
    
    if (correctedEntries.entriesByDay) {
      const days = Object.keys(correctedEntries.entriesByDay).sort();
      
      for (let i = 0; i < days.length; i++) {
        const currentDay = days[i];
        const currentDayData = correctedEntries.entriesByDay[currentDay];
        
        // Se temos uma entrada mas não uma saída, e o próximo dia tem uma saída sem entrada
        if (i < days.length - 1) {
          const nextDay = days[i + 1];
          const nextDayData = correctedEntries.entriesByDay[nextDay];
          
          if (currentDayData.entrada && !currentDayData.saida && 
              nextDayData.saida && !nextDayData.entrada) {
            // A saída do próximo dia pertence a este dia
            currentDayData.saida = nextDayData.saida;
            currentDayData.saidaId = nextDayData.saidaId;
            
            // Remover a saída do próximo dia
            delete nextDayData.saida;
            delete nextDayData.saidaId;
            
            // Se o próximo dia ficou vazio, remover completamente
            if (Object.keys(nextDayData).length === 0) {
              delete correctedEntries.entriesByDay[nextDay];
            }
            
            // Recalcular as horas trabalhadas para este dia
            if (correctedEntries.hoursWorkedByDay && currentDayData.entrada && currentDayData.saida) {
              const entrada = new Date(currentDayData.entrada);
              const saida = new Date(currentDayData.saida);
              
              let hoursWorked = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
              
              // Se o resultado for negativo, significa que a saída foi no dia seguinte
              if (hoursWorked < 0) {
                hoursWorked = (saida.getTime() - entrada.getTime() + 24 * 60 * 60 * 1000) / (1000 * 60 * 60);
              }
              
              // Limita o máximo de horas por dia a 24
              hoursWorked = Math.min(hoursWorked, 24);
              
              // Arredonda para 2 casas decimais
              hoursWorked = parseFloat(hoursWorked.toFixed(2));
              
              correctedEntries.hoursWorkedByDay[currentDay] = hoursWorked;
              
              // Remover as horas do próximo dia se existirem
              if (correctedEntries.hoursWorkedByDay[nextDay] !== undefined) {
                delete correctedEntries.hoursWorkedByDay[nextDay];
              }
            }
          }
        }
      }
      
      // Recalcular o total de horas trabalhadas
      if (correctedEntries.hoursWorkedByDay) {
        let totalHours = 0;
        Object.values(correctedEntries.hoursWorkedByDay).forEach(hours => {
          totalHours += Number(hours);
        });
        
        correctedEntries.totalHoursWorked = parseFloat(totalHours.toFixed(2));
        
        // Recalcular o valor total
        if (correctedEntries.hourlyRate) {
          correctedEntries.totalAmount = parseFloat((correctedEntries.totalHoursWorked * correctedEntries.hourlyRate).toFixed(2));
        }
      }
    }

    return res.status(200).json({
      userId,
      month,
      year,
      data: correctedEntries
    });
  } catch (error: any) {
    console.error('Erro ao buscar registros de tempo:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar a requisição'
    });
  }
} 