import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user_id, month, year } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  const currentDate = new Date();
  const selectedMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
  const selectedYear = year ? parseInt(year as string) : currentDate.getFullYear();

  try {
    // Cria as datas de início e fim do mês
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

    // Busca todas as entradas do usuário no período
    const timeEntries = await db.timeEntries.findMany({
      where: {
        user_id: user_id as string,
        entrace: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        entrace: 'asc'
      }
    });

    // Organiza as entradas por dia
    const entriesByDay: Record<string, any> = {};
    let totalHoursWorked = 0;

    timeEntries.forEach(entry => {
      if (!entry.entrace) return;

      const day = entry.entrace.toISOString().split('T')[0];
      
      entriesByDay[day] = {
        entrada: entry.entrace,
        saida: entry.exit,
        almoco: entry.lunchEntrace && entry.lunchExit ? {
          entrada: entry.lunchEntrace,
          saida: entry.lunchExit
        } : null
      };

      // Calcula as horas trabalhadas no dia
      if (entry.entrace && entry.exit) {
        let hoursWorked = (entry.exit.getTime() - entry.entrace.getTime()) / (1000 * 60 * 60);

        // Se teve horário de almoço, subtrair
        if (entry.lunchEntrace && entry.lunchExit) {
          const lunchHours = (entry.lunchExit.getTime() - entry.lunchEntrace.getTime()) / (1000 * 60 * 60);
          hoursWorked -= lunchHours;
        }

        // Arredonda para 2 casas decimais
        hoursWorked = parseFloat(hoursWorked.toFixed(2));
        
        // Limita o máximo de horas por dia a 24
        hoursWorked = Math.min(hoursWorked, 24);

        entriesByDay[day].horasTrabalhadasNoDia = hoursWorked;
        totalHoursWorked += hoursWorked;
      }
    });

    // Busca o valor por hora do usuário
    const fixedJob = await db.fixedJobs.findFirst({
      where: {
        user_id: user_id as string,
        deletedAt: null
      }
    });

    // Valor padrão por hora caso não tenha um trabalho fixo
    const hourlyRate = fixedJob?.price_per_hour || 39.40;
    const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2));

    return res.status(200).json({
      user_id,
      month: selectedMonth,
      year: selectedYear,
      entriesByDay,
      totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
      hourlyRate,
      totalAmount
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
} 