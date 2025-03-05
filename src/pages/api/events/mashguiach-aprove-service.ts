import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user_id, service_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  try {

    // Busca todas as entradas do usuário no período
    const services = await db.eventsServices.update({
      where: {
        id: service_id as string,
        mashguiachId: user_id as string
      },
      data: {
        accepted: true
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