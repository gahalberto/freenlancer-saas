import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
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
        deletedAt: null, // Garantir que o evento não foi excluído
      },
      include: {
        // Incluir todos os serviços do evento
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
              },
            },
          },
        },
        // Incluir informações da loja
        store: {
          include: {
            // Incluir o tipo de loja
            storeType: true,
          },
        },
        // Incluir informações do proprietário do evento
        eventOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // Incluir endereços do evento
        EventsAdresses: true,
      },
    })

    if (!event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado' })
    }

    // Formatar a resposta para incluir informações adicionais
    const formattedEvent = {
      ...event,
      pendingServices: event.EventsServices.filter(service => !service.mashguiachId).length,
      acceptedServices: event.EventsServices.filter(service => service.accepted).length,
      totalServices: event.EventsServices.length,
    }

    return res.status(200).json({
      success: true,
      event: formattedEvent,
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