import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateToken } from '../validateToken'

const prisma = new PrismaClient()

type ResponseData = {
  success: boolean
  message?: string
  event?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  // Obter token do cabeçalho ou do parâmetro de consulta
  let token = ''
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.query.token) {
    token = req.query.token as string
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' })
  }

  // Validar o token
  const { valid, decoded, error } = await validateToken(token)
  if (!valid) {
    return res.status(401).json({ success: false, message: error || 'Token inválido' })
  }

  // Obter o ID do evento da query
  const eventId = req.query.id as string

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'ID do evento é obrigatório' })
  }

  try {
    // Buscar o evento pelo ID com todos os relacionamentos
    const event = await prisma.storeEvents.findUnique({
      where: {
        id: eventId,
      },
      include: {
        // Incluir todos os serviços do evento, sem filtro
        EventsServices: {
          include: {
            // Incluir informações do mashguiach para cada serviço
            Mashguiach: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar_url: true,
                roleId: true,
              },
            },
          },
        },
        // Incluir informações da loja
        store: true,
        // Incluir informações do proprietário do evento
        eventOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        // Incluir endereços do evento
        EventsAdresses: true,
      },
    })

    if (!event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado' })
    }

    return res.status(200).json({
      success: true,
      event,
    })
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
} 