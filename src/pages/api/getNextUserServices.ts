import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  const currentDate = new Date();

  try {
    // Cria as datas de início e fim do mês

    // Busca todas as entradas do usuário no período
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: user_id as string,
        arriveMashguiachTime: {
            gte: currentDate
        }
      },
      include: {
        Mashguiach: true,
        StoreEvents: true
      },
      orderBy: {
        arriveMashguiachTime: 'desc'
      }
    });

    return res.status(200).json({
        services
        });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
} 