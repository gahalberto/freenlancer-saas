'use server'

import { db } from '@/app/_lib/prisma'
import { z } from 'zod'

// Schema de validação para os parâmetros
const paramsSchema = z.object({
  mashguiachId: z.string().uuid('ID de mashguiach inválido'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
})

type GetEventsByMashguiachParams = z.infer<typeof paramsSchema>

type EventWithServices = {
  id: string
  title: string
  date: Date
  store?: {
    id: string
    title: string
  } | null
  services: Array<{
    id: string
    arriveMashguiachTime: Date
    endMashguiachTime: Date
    mashguiachPrice: number
    dayHourValue?: number | null
    nightHourValue?: number | null
    transport_price?: number | null
    accepted: boolean
    isApproved: boolean
    workType?: string | null
    observationText?: string | null
  }>
}

type GetEventsByMashguiachResult = {
  success: boolean
  message?: string
  events?: EventWithServices[]
  totalEvents?: number
  totalServices?: number
  totalHours?: number
  totalValue?: number
}

/**
 * Busca eventos e serviços de um mashguiach por mês e ano
 * @param mashguiachId ID do mashguiach
 * @param month Mês (1-12)
 * @param year Ano (ex: 2023)
 * @returns Eventos e estatísticas
 */
export async function getEventsByMashguiachMonthAndYear({
  mashguiachId,
  month,
  year,
}: GetEventsByMashguiachParams): Promise<GetEventsByMashguiachResult> {
  try {
    // Validar os parâmetros
    paramsSchema.parse({ mashguiachId, month, year })

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
    const eventsMap = new Map<string, EventWithServices>()

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

      eventsMap.get(eventId)?.services.push({
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

    // Retornar os eventos encontrados e estatísticas
    return {
      success: true,
      events,
      totalEvents: events.length,
      totalServices: services.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
    }
  } catch (error) {
    console.error('Erro ao buscar eventos do mashguiach:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Parâmetros inválidos: ' + error.message,
      }
    }
    
    return {
      success: false,
      message: 'Erro ao buscar eventos do mashguiach',
    }
  }
}
