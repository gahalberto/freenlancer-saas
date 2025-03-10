import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]'
import { z } from 'zod'

// Schema de validação para os parâmetros da requisição
const querySchema = z.object({
  mashguiachId: z.string().uuid('ID de mashguiach inválido'),
  month: z.string().or(z.number()).transform(val => Number(val)),
  year: z.string().or(z.number()).transform(val => Number(val)),
})

type ResponseData = {
  success: boolean
  message?: string
  events?: any[]
  totalEvents?: number
  totalServices?: number
  totalHours?: number
  totalValue?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    // Validar os parâmetros da requisição
    const { mashguiachId, month, year } = querySchema.parse(req.query)

    // Verificar se o mês e o ano são válidos
    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Mês inválido' })
    }

    if (year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Ano inválido' })
    }

    // Calcular o primeiro e o último dia do mês
    const firstDay = new Date(year, month - 1, 1) // Mês em JavaScript é 0-indexed
    const lastDay = new Date(year, month, 0) // Último dia do mês

    // Ajustar para o início e fim do dia
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    // Buscar os serviços do mashguiach no período especificado
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId,
        arriveMashguiachTime: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: {
        StoreEvents: {
          include: {
            store: true,
          },
        },
      },
      orderBy: {
        arriveMashguiachTime: 'asc',
      },
    })

    // Agrupar serviços por evento
    const eventsMap = new Map()

    services.forEach(service => {
      const eventId = service.StoreEventsId
      const event = service.StoreEvents

      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          id: eventId,
          title: event.title || 'Evento sem título',
          date: event.date,
          store: event.store ? {
            id: event.store.id,
            title: event.store.title,
          } : null,
          services: [],
        })
      }

      eventsMap.get(eventId).services.push({
        id: service.id,
        arriveMashguiachTime: service.arriveMashguiachTime,
        endMashguiachTime: service.endMashguiachTime,
        mashguiachPrice: service.mashguiachPrice,
        dayHourValue: service.dayHourValue,
        nightHourValue: service.nightHourValue,
        transport_price: service.transport_price,
        accepted: service.accepted,
        isApproved: service.isApproved,
        workType: service.workType,
        observationText: service.observationText,
      })
    })

    // Converter o Map para array
    const events = Array.from(eventsMap.values())

    // Calcular estatísticas
    let totalHours = 0
    let totalValue = 0

    services.forEach(service => {
      // Calcular a duração em horas
      const startTime = new Date(service.arriveMashguiachTime)
      const endTime = new Date(service.endMashguiachTime)
      const durationMs = endTime.getTime() - startTime.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)
      
      totalHours += durationHours
      totalValue += service.mashguiachPrice || 0
    })

    // Responder com os eventos encontrados e estatísticas
    return res.status(200).json({
      success: true,
      events,
      totalEvents: events.length,
      totalServices: services.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
    })
  } catch (error) {
    console.error('Erro ao buscar eventos do mashguiach:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
      })
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar eventos do mashguiach',
    })
  }
} 