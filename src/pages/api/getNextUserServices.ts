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

  try {
    // Obtém a data atual e configura para 00:00:00 (início do dia)
    const currentDate = new Date();
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      0, 0, 0
    );

    // Busca todos os serviços do usuário a partir do início do dia atual
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: user_id as string,
        arriveMashguiachTime: {
          gte: startOfDay // Considera eventos a partir do início do dia atual (00:00)
        },
        reallyMashguiachEndTime: null
      },
      include: {
        Mashguiach: true,
        StoreEvents: true
      },
      orderBy: {
        arriveMashguiachTime: 'asc' // Ordena por data/hora de chegada em ordem crescente
      }
    });

    return res.status(200).json({
      services
    });
  } catch (error) {
    console.error('Erro ao buscar serviços do usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar serviços do usuário' });
  }
} 