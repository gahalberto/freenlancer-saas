import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  const id = req.query.id as string

  try {
    // Consulta eventos com data maior ou igual à data ajustada para o horário local
    const events = await db.eventsServices.findFirst({
      where: {
        id,
      },
      include: {
        StoreEvents: {
          include: {
            store: true,
            EventsAdresses: true,
          },
        },
      },
    })

    // Responde com os eventos encontrados
    res.status(200).json(events)
  } catch (error) {
    console.error('Erro ao buscar eventos no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}
