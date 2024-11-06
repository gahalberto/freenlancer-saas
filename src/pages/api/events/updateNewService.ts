import { getServerSession } from 'next-auth/next'
import { db } from '@/app/_lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' }) // Apenas PUT permitido
  }

  try {
    const { id, mashguiachId } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID do evento é necessário' }) // Certifica-se de que o ID do evento foi passado
    }

    // Atualiza o evento atribuindo o mashguiachId com base no ID do usuário da sessão
    const updatedEvent = await db.eventsServices.update({
      where: {
        id: id, // O ID do evento vem do corpo da requisição
      },
      data: {
        mashguiachId,
        responseDate: new Date(), // Usando o construtor new Date() para a data atual
        accepted: true
      },
    });

    console.log('Evento atualizado:', updatedEvent)

    // Responde com o evento atualizado
    res.status(200).json(updatedEvent)
  } catch (error) {
    console.error('Erro ao atualizar evento no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao atualizar evento' })
  }
}
