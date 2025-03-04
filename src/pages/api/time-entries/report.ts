import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

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
    let month = parseInt(req.query.month as string) || currentDate.getMonth() + 1;
    let year = parseInt(req.query.year as string) || currentDate.getFullYear();

    // Validar mês e ano
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mês inválido. Deve estar entre 1 e 12.' });
    }

    if (year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Ano inválido. Deve estar entre 2000 e 2100.' });
    }

    // Criar datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Buscar os registros do mês
    const timeEntries = await db.timeEntries.findMany({
      where: {
        user_id: userId,
        entrace: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true,
        stores: true
      },
      orderBy: {
        entrace: 'asc'
      }
    });

    // Organizar os dados por dia
    const entriesByDay: Record<string, any> = {};
    const hoursWorkedByDay: Record<string, number> = {};
    let totalHoursWorked = 0;

    timeEntries.forEach(entry => {
      const day = entry.entrace.toISOString().split('T')[0];
      
      entriesByDay[day] = {
        entrada: entry.entrace,
        saida: entry.exit,
        almoco: entry.lunchEntrace && entry.lunchExit ? {
          entrada: entry.lunchEntrace,
          saida: entry.lunchExit
        } : null
      };

      // Calcular horas trabalhadas no dia
      if (entry.entrace && entry.exit) {
        let hoursWorked = (entry.exit.getTime() - entry.entrace.getTime()) / (1000 * 60 * 60);

        // Se teve horário de almoço, subtrair
        if (entry.lunchEntrace && entry.lunchExit) {
          const lunchHours = (entry.lunchExit.getTime() - entry.lunchEntrace.getTime()) / (1000 * 60 * 60);
          hoursWorked -= lunchHours;
        }

        // Arredondar para 2 casas decimais
        hoursWorked = parseFloat(hoursWorked.toFixed(2));
        
        // Limitar a 24 horas por dia
        hoursWorked = Math.min(hoursWorked, 24);

        hoursWorkedByDay[day] = hoursWorked;
        totalHoursWorked += hoursWorked;
      }
    });

    // Buscar o valor por hora do trabalho fixo do usuário
    const fixedJob = await db.fixedJobs.findFirst({
      where: {
        user_id: userId,
        deletedAt: null
      }
    });

    const hourlyRate = fixedJob?.price_per_hour ?? 39.40; // Usa o valor do trabalho fixo ou o padrão
    const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2));

    return res.status(200).json({
      userId,
      month,
      year,
      data: {
        entriesByDay,
        hoursWorkedByDay,
        totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        hourlyRate,
        totalAmount
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar registros de tempo:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar a requisição'
    });
  }
} 