import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { validateToken } from '../validateToken'

const prisma = new PrismaClient()

// Schema de validação para atualização de evento
const updateEventSchema = z.object({
  id: z.string().uuid('ID de evento inválido'),
  title: z.string().min(1, 'Título é obrigatório').optional(),
  responsable: z.string().nullable().optional(),
  date: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  nrPax: z.number().int().positive('Número de pessoas deve ser positivo').optional(),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório').optional(),
  eventType: z.string().min(1, 'Tipo de evento é obrigatório').optional(),
  serviceType: z.string().min(1, 'Tipo de serviço é obrigatório').optional(),
  isApproved: z.boolean().optional(),
  storeId: z.string().min(1, 'ID da loja é obrigatório').optional(),
  responsableTelephone: z.string().nullable().optional(),
  address_city: z.string().optional(),
  address_neighbor: z.string().optional(),
  address_number: z.string().optional(),
  address_state: z.string().optional(),
  address_street: z.string().optional(),
  address_zicode: z.string().optional(),
  menuUrl: z.string().nullable().optional(),
})

type ResponseData = {
  success: boolean
  message?: string
  event?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é PUT
  if (req.method !== 'PUT') {
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

  try {
    // Validar os dados recebidos
    const eventData = updateEventSchema.parse(req.body)
    
    // Verificar se o evento existe
    const existingEvent = await prisma.storeEvents.findUnique({
      where: { id: eventData.id },
    })

    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado' })
    }

    // Verificar se a loja existe, se estiver sendo atualizada
    if (eventData.storeId && eventData.storeId !== existingEvent.storeId) {
      const storeExists = await prisma.stores.findUnique({
        where: { id: eventData.storeId },
      })

      if (!storeExists) {
        return res.status(400).json({ success: false, message: 'Loja não encontrada' })
      }
    }

    // Preparar os dados para atualização
    const updateData: any = { ...eventData }
    
    // Remover o ID do objeto de atualização
    delete updateData.id
    
    // Adicionar data de atualização
    updateData.updatedAt = new Date()

    // Atualizar o evento
    const updatedEvent = await prisma.storeEvents.update({
      where: { id: eventData.id },
      data: updateData,
      include: {
        EventsServices: true,
        store: true,
        eventOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        EventsAdresses: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Evento atualizado com sucesso',
      event: updatedEvent,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        event: { errors: error.errors },
      })
    }

    console.error('Erro ao atualizar evento:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
} 