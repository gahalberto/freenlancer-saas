import { getServerSession } from 'next-auth/next'
import { db } from '@/app/_lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica a sessão do usuário
  const session = await getServerSession(req, res, authOptions)

  // if (!session) {
  //   // Se não estiver logado, retorna status 401 (Não autorizado)
  //   return res.status(401).json({ error: 'Usuário não autenticado' })
  // }

  // Usuário autenticado, continua o processamento
 // console.log('Usuário autenticado:', session.user)

  try {
    // Obtém a data atual
    const today = new Date()

    // Consulta apenas eventos cuja data é igual ou maior que hoje
    const events = await db.storeEvents.findMany({
      where: {
        date: {
          gte: today, // Filtra eventos com data maior ou igual a hoje
        },
      },
      include: {
        EventsServices: {
          where: {
            mashguiachId: null, // Filtra serviços onde mashguiachId é null (não atribuído)
          }
        }, // Inclui apenas serviços onde o mashguiachId é null
      },
      orderBy: {
        date: 'asc', // Ordena em ordem crescente de data (eventos mais próximos primeiro)
      },
    });

    console.log('Eventos futuros encontrados:', events)

    // Responde com os eventos encontrados
    res.status(200).json(events)
  } catch (error) {
    console.error('Erro ao buscar eventos no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}
