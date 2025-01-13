import { db } from '@/app/_lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.userId as string
    const today = new Date().toISOString() // Garantindo que seja UTC e no formato correto

    // Validação do userId
    if (!userId) {
      return res.status(400).json({ error: 'Parâmetro userId é obrigatório' })
    }

    // Busca no banco de dados
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: userId,
        arriveMashguiachTime: {
          gte: today,
        },
      },
      orderBy: {
        arriveMashguiachTime: 'asc', // Ordena por data de chegada
      },
    })

    // Retorno adequado se não houver eventos
    if (services.length === 0) {
      return res.status(404).json({ message: 'Nenhum evento encontrado para este usuário' })
    }

    res.status(200).json(services)
  } catch (error) {
    console.error('Erro ao buscar eventos no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}
