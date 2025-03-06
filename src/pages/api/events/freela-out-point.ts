import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user_id, service_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  if (!service_id) {
    return res.status(400).json({ error: 'ID do serviço é obrigatório' });
  }

  const currentDate = new Date();
  try {
    // Registra a saída do mashguiach
    const services = await db.eventsServices.update({
      where: {
        id: service_id as string,
        mashguiachId: user_id as string
      },
      data: {
        reallyMashguiachEndTime: currentDate
      }
    });

    return res.status(201).json({
        services
        });
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    return res.status(500).json({ error: 'Erro ao registrar saída' });
  }
} 