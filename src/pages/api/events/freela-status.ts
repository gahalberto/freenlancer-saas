import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user_id, service_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  if (!service_id) {
    return res.status(400).json({ error: 'ID do serviço é obrigatório' });
  }

  try {
    // Busca o serviço específico
    const services = await db.eventsServices.findFirst({
      where: {
        id: service_id as string
      }
    });

    // Verifica se o serviço existe
    if (!services) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    return res.status(200).json({
        hasCheckedIn: services?.reallyMashguiachArrive ? true : false,
        hasCheckedOut: services?.reallyMashguiachEndTime ? true : false,
        checkInTime: services?.reallyMashguiachArrive ? services?.reallyMashguiachArrive : null,
        checkOutTime: services?.reallyMashguiachEndTime ? services?.reallyMashguiachEndTime : null,
    });
  } catch (error) {
    console.error('Erro ao verificar status do serviço:', error);
    return res.status(500).json({ error: 'Erro ao verificar status do serviço' });
  }
} 