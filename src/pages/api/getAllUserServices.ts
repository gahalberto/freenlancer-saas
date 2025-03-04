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
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: user_id as string,
        arriveMashguiachTime: {
            gte: startDate,
            lte: endDate
        }
      },
      include: {
        Mashguiach: true,
        StoreEvents: true
      }
    });

    console.log(services)

    return res.status(200).json({
        services
        });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
} 