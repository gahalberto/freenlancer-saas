'use server'

import { db } from '@/app/_lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isEqual } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Interface para as métricas do dashboard de estabelecimento
 */
export interface EstablishmentDashboardMetrics {
  eventsThisWeek: number
  eventsThisMonth: number
  totalEvents: number
  totalPaymentToMashguiach: number
  pendingEvents: number
  dailyEvents: DailyEventCount[]
}

/**
 * Interface para contagem de eventos diários
 */
export interface DailyEventCount {
  date: string
  count: number
  formattedDate: string
}

/**
 * Busca métricas para o dashboard de estabelecimento
 * @param userId ID do usuário (estabelecimento)
 * @returns Objeto com as métricas do estabelecimento
 */
export async function getEstablishmentMetrics(userId: string): Promise<EstablishmentDashboardMetrics> {
  try {
    // Definir datas de referência
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }) // Domingo
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }) // Sábado
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)

    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime()
    console.log(`Buscando métricas de estabelecimento [${timestamp}] para userId: ${userId}`)

    // Buscar estabelecimentos do usuário
    const userStores = await db.stores.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true
      }
    })

    const storeIds = userStores.map(store => store.id)

    if (storeIds.length === 0) {
      return {
        eventsThisWeek: 0,
        eventsThisMonth: 0,
        totalEvents: 0,
        totalPaymentToMashguiach: 0,
        pendingEvents: 0,
        dailyEvents: []
      }
    }

    // Contar eventos desta semana
    const eventsThisWeek = await db.storeEvents.count({
      where: {
        storeId: {
          in: storeIds
        },
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    })

    // Contar eventos deste mês
    const eventsThisMonth = await db.storeEvents.count({
      where: {
        storeId: {
          in: storeIds
        },
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    // Contar total de eventos
    const totalEvents = await db.storeEvents.count({
      where: {
        storeId: {
          in: storeIds
        }
      }
    })

    // Contar eventos pendentes
    const pendingEvents = await db.storeEvents.count({
      where: {
        storeId: {
          in: storeIds
        },
        isApproved: false
      }
    })

    // Buscar serviços associados aos eventos do estabelecimento para calcular pagamentos
    const services = await db.eventsServices.findMany({
      where: {
        StoreEvents: {
          storeId: {
            in: storeIds
          }
        },
        // Garantir que tenha mashguiach associado e horários registrados
        mashguiachId: { not: null }
      },
      select: {
        dayHourValue: true,
        nightHourValue: true,
        transport_price: true,
        arriveMashguiachTime: true,
        endMashguiachTime: true
      }
    })

    // Calcular total a pagar aos mashguichim
    let totalPaymentToMashguiach = 0
    for (const service of services) {
      if (service.arriveMashguiachTime && service.endMashguiachTime) {
        const startTime = new Date(service.arriveMashguiachTime)
        const endTime = new Date(service.endMashguiachTime)
        
        // Calcular horas de trabalho
        const durationMs = endTime.getTime() - startTime.getTime()
        const durationHours = durationMs / (1000 * 60 * 60)
        
        // Calcular valor básico (usando a taxa diurna para simplificar)
        const hourlyRate = service.dayHourValue || 50
        let serviceValue = durationHours * hourlyRate
        
        // Aplicar valor mínimo se necessário
        if (serviceValue < 250) {
          serviceValue = 250
        }
        
        // Adicionar valor do transporte
        const transportValue = service.transport_price || 0
        
        totalPaymentToMashguiach += serviceValue + transportValue
      }
    }

    // Buscar eventos dos últimos 7 dias para o gráfico
    const last7Days = eachDayOfInterval({
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
      end: today
    })

    // Buscar os eventos dos últimos 7 dias
    const recentEvents = await db.storeEvents.findMany({
      where: {
        storeId: {
          in: storeIds
        },
        date: {
          gte: last7Days[0],
          lte: today
        }
      },
      select: {
        date: true
      }
    })

    // Criar dados para o gráfico de eventos diários
    const dailyEvents: DailyEventCount[] = last7Days.map(day => {
      // Contar eventos para este dia
      const count = recentEvents.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getDate() === day.getDate() && 
               eventDate.getMonth() === day.getMonth() && 
               eventDate.getFullYear() === day.getFullYear()
      }).length

      return {
        date: format(day, 'yyyy-MM-dd'),
        count,
        formattedDate: format(day, 'dd/MM', { locale: ptBR })
      }
    })

    return {
      eventsThisWeek,
      eventsThisMonth,
      totalEvents,
      totalPaymentToMashguiach,
      pendingEvents,
      dailyEvents
    }
  } catch (error) {
    console.error('Erro ao buscar métricas do estabelecimento:', error)
    throw new Error('Erro ao buscar métricas do estabelecimento')
  }
} 