import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {

    // Busca todas as entradas do usuário no período
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: null,
        arriveMashguiachTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // A partir de hoje à meia-noite
        }
      },
      include: {
        StoreEvents: {
            include: {
                store: true
            }
        }
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