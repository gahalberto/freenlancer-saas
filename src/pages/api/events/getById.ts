import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  const id = req.query.id as string

  try {
    // Cria a data de hoje no horário local de Brasília
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ajusta para 00:00:00 no horário local

    // Converte a data para o formato ISO-8601
    const localDate = today.toISOString().split('T')[0]
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000) // Ajuste para horário local

    // Consulta eventos com data maior ou igual à data ajustada para o horário local
    const events = await db.storeEvents.findFirst({
      where: {
        id,
        date: {
          gte: localToday, // Ajusta o fuso horário para GMT-3
        },
      },
      include: {
        EventsServices: {
          where: {
            mashguiachId: null,
          },
        },
        store: true,
        EventsAdresses: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Responde com os eventos encontrados
    res.status(200).json(events)
  } catch (error) {
    console.error('Erro ao buscar eventos no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}
