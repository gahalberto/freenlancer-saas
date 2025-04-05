'use server'

import { db } from '@/app/_lib/prisma'

/**
 * Interface para as métricas do dashboard
 */
export interface DashboardMetrics {
  totalMashguichim: number
  totalEstablishments: number
  totalEventsThisYear: number
  totalFixedJobs: number
  totalPendingEvents: number
  totalUpcomingEvents: number
  totalPendingPayments: number
  totalPendingAmount: number
  totalAmountThisMonth: number
  totalAmountAllTime: number
}

/**
 * Busca métricas para o dashboard administrativo
 * @returns Objeto com as métricas
 */
export async function getDashboardMetrics(startDate?: Date, endDate?: Date): Promise<DashboardMetrics> {
  try {
    // Obter o ano atual
    const currentYear = new Date().getFullYear()
    const defaultStartOfYear = new Date(currentYear, 0, 1) // 1º de janeiro do ano atual
    const defaultEndOfYear = new Date(currentYear, 11, 31, 23, 59, 59) // 31 de dezembro do ano atual

    // Se datas não foram fornecidas, usar os valores padrão
    const effectiveStartDate = startDate || defaultStartOfYear
    const effectiveEndDate = endDate || defaultEndOfYear

    // Ajustar final do dia para a data final
    const adjustedEndDate = new Date(effectiveEndDate)
    adjustedEndDate.setHours(23, 59, 59, 999)
    
    // Adicionar um timestamp para evitar cache
    const timestamp = new Date().getTime()
    console.log(`Iniciando busca de métricas [${timestamp}]...`)
    
    // Contar total de mashguichim (usuários com roleId = 2)
    const totalMashguichim = await db.user.count({
      where: {
        roleId: 2,
      },
    })

    // Contar total de estabelecimentos
    const totalEstablishments = await db.stores.count()

    // Contar total de eventos no período selecionado
    const totalEventsThisYear = await db.storeEvents.count({
      where: {
        date: {
          gte: effectiveStartDate,
          lte: adjustedEndDate,
        },
      },
    })

    // Contar total de funcionários com trabalhos fixos (simplificado)
    const totalFixedJobs = await db.fixedJobs.count()

    // Contar total de eventos pendentes
    const totalPendingEvents = await db.storeEvents.count({
      where: {
        isApproved: false,
        date: {
          gte: effectiveStartDate,
          lte: adjustedEndDate,
        },
      },
    })

    // Contar total de próximos eventos (a partir de hoje)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const totalUpcomingEvents = await db.storeEvents.count({
      where: {
        date: {
          gte: today,
          lte: adjustedEndDate,
        },
      },
    })

    // Contar total de pagamentos pendentes
    const totalPendingPayments = await db.eventsServices.count({
      where: {
        paymentStatus: 'Pending',
        arriveMashguiachTime: {
          gte: effectiveStartDate,
          lte: adjustedEndDate,
        },
      }
    })

    // Obter o total a pagar pendente
    // Buscar serviços com pagamentos pendentes
    const pendingServices = await db.eventsServices.findMany({
      where: {
        paymentStatus: 'Pending',
        NOT: {
          mashguiachId: null
        },
        arriveMashguiachTime: {
          gte: effectiveStartDate,
          lte: adjustedEndDate,
        },
      },
      include: {
        Mashguiach: true,
        StoreEvents: true
      }
    })

    // Calcular o total a pagar pendente
    let totalPendingAmount = 0
    for (const service of pendingServices) {
      const startTime = service.arriveMashguiachTime
      const endTime = service.endMashguiachTime

      if (startTime && endTime) {
        // Calcular horas diurnas e noturnas
        const hours = calculateDayAndNightHours(new Date(startTime), new Date(endTime))
        
        const dayHourValue = service.dayHourValue || 50
        const nightHourValue = service.nightHourValue || 75
        
        let serviceValue = hours.dayHours * dayHourValue + hours.nightHours * nightHourValue
        
        // Aplicar valor mínimo se necessário
        if (serviceValue < 250) {
          serviceValue = 250
        }
        
        // Adicionar valor do transporte
        const transportValue = service.transport_price || 0
        
        totalPendingAmount += serviceValue + transportValue
      }
    }

    // Calcular o valor total gerado no período selecionado
    const periodServices = await db.eventsServices.findMany({
      where: {
        arriveMashguiachTime: {
          gte: effectiveStartDate,
          lte: adjustedEndDate
        },
        NOT: {
          mashguiachId: null
        }
      }
    })

    let totalAmountThisMonth = 0
    for (const service of periodServices) {
      const startTime = service.arriveMashguiachTime
      const endTime = service.endMashguiachTime

      if (startTime && endTime) {
        // Calcular horas diurnas e noturnas
        const hours = calculateDayAndNightHours(new Date(startTime), new Date(endTime))
        
        const dayHourValue = service.dayHourValue || 50
        const nightHourValue = service.nightHourValue || 75
        
        let serviceValue = hours.dayHours * dayHourValue + hours.nightHours * nightHourValue
        
        // Aplicar valor mínimo se necessário
        if (serviceValue < 250) {
          serviceValue = 250
        }
        
        // Adicionar valor do transporte
        const transportValue = service.transport_price || 0
        
        totalAmountThisMonth += serviceValue + transportValue
      }
    }

    // Calcular o valor total gerado desde o início
    const allServices = await db.eventsServices.findMany({
      where: {
        NOT: {
          mashguiachId: null
        }
      }
    })

    let totalAmountAllTime = 0
    for (const service of allServices) {
      const startTime = service.arriveMashguiachTime
      const endTime = service.endMashguiachTime

      if (startTime && endTime) {
        // Calcular horas diurnas e noturnas
        const hours = calculateDayAndNightHours(new Date(startTime), new Date(endTime))
        
        const dayHourValue = service.dayHourValue || 50
        const nightHourValue = service.nightHourValue || 75
        
        let serviceValue = hours.dayHours * dayHourValue + hours.nightHours * nightHourValue
        
        // Aplicar valor mínimo se necessário
        if (serviceValue < 250) {
          serviceValue = 250
        }
        
        // Adicionar valor do transporte
        const transportValue = service.transport_price || 0
        
        totalAmountAllTime += serviceValue + transportValue
      }
    }

    return {
      totalMashguichim,
      totalEstablishments,
      totalEventsThisYear,
      totalFixedJobs,
      totalPendingEvents,
      totalUpcomingEvents,
      totalPendingPayments,
      totalPendingAmount,
      totalAmountThisMonth,
      totalAmountAllTime,
    }
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error)
    throw new Error('Erro ao buscar métricas do dashboard')
  }
}

/**
 * Busca eventos pendentes
 * @param startDate Data inicial opcional para filtrar
 * @param endDate Data final opcional para filtrar
 * @returns Array de eventos pendentes
 */
export async function getPendingEvents(startDate?: Date, endDate?: Date) {
  try {
    // Se as datas não foram fornecidas, usar valores padrão
    const today = new Date()
    const effectiveStartDate = startDate || new Date(today.getFullYear(), 0, 1) // 1º de janeiro do ano atual
    const effectiveEndDate = endDate || new Date(today.getFullYear(), 11, 31, 23, 59, 59) // 31 de dezembro do ano atual

    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime()
    console.log(`Buscando eventos pendentes [${timestamp}] de ${effectiveStartDate} até ${effectiveEndDate}`)
    
    const pendingEvents = await db.storeEvents.findMany({
      where: {
        isApproved: false,
        deletedAt: null,
        date: {
          gte: effectiveStartDate,
          lte: effectiveEndDate,
        },
      },
      include: {
        store: {
          select: {
            title: true,
          },
        },
        EventsServices: {
          include: {
            Mashguiach: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 10,
    })

    // Formatar os dados para o frontend
    return pendingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      storeName: event.store?.title || 'Sem estabelecimento',
      status: 'PENDENTE',
      mashguiachName: event.EventsServices[0]?.Mashguiach?.name || null,
    }))
  } catch (error) {
    console.error('Erro ao buscar eventos pendentes:', error)
    throw new Error('Erro ao buscar eventos pendentes')
  }
}

/**
 * Busca próximos eventos (a partir de hoje)
 * @param startDate Data inicial opcional para filtrar
 * @param endDate Data final opcional para filtrar
 * @returns Array de próximos eventos
 */
export async function getUpcomingEvents(startDate?: Date, endDate?: Date) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Se a data final não foi fornecida, usar valor padrão
    const effectiveEndDate = endDate || new Date(today.getFullYear(), 11, 31, 23, 59, 59) // 31 de dezembro do ano atual
    
    // A data inicial para próximos eventos é sempre a data atual
    const effectiveStartDate = today
    
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime()
    console.log(`Buscando próximos eventos [${timestamp}] de ${effectiveStartDate} até ${effectiveEndDate}`)

    const upcomingEvents = await db.storeEvents.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: effectiveStartDate,
          lte: effectiveEndDate,
        },
      },
      include: {
        store: {
          select: {
            title: true,
          },
        },
        EventsServices: {
          include: {
            Mashguiach: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 10,
    })

    // Formatar os dados para o frontend
    return upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      storeName: event.store?.title || 'Sem estabelecimento',
      status: event.isApproved ? 'APROVADO' : 'PENDENTE',
      mashguiachName: event.EventsServices[0]?.Mashguiach?.name || null,
    }))
  } catch (error) {
    console.error('Erro ao buscar próximos eventos:', error)
    throw new Error('Erro ao buscar próximos eventos')
  }
}

/**
 * Função que calcula as horas diurnas (06h-22h) e noturnas (22h-06h) de um serviço
 * @param startTime Horário de início do serviço
 * @param endTime Horário de término do serviço
 * @returns Objeto com horas diurnas e noturnas
 */
function calculateDayAndNightHours(startTime: Date, endTime: Date): { dayHours: number, nightHours: number } {
  try {
    // Verificar se as datas são válidas
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
      return { dayHours: 0, nightHours: 0 };
    }
    
    // Calcular duração total em horas
    const durationMs = endTime.getTime() - startTime.getTime();
    
    // Calcular horas diurnas e noturnas
    let dayHours = 0;
    let nightHours = 0;
    
    // Criar cópia da data de início para iterar
    const currentTime = new Date(startTime);
    
    // Avançar em intervalos de 15 minutos para maior precisão
    const intervalMinutes = 15;
    const intervalMs = intervalMinutes * 60 * 1000;
    const totalIntervals = Math.ceil(durationMs / intervalMs);
    
    for (let i = 0; i < totalIntervals; i++) {
      const hour = currentTime.getHours();
      
      // Verificar se é horário noturno (22h às 6h)
      if (hour >= 22 || hour < 6) {
        nightHours += intervalMinutes / 60;
      } else {
        dayHours += intervalMinutes / 60;
      }
      
      // Avançar para o próximo intervalo
      currentTime.setTime(currentTime.getTime() + intervalMs);
      
      // Se passamos do horário final, ajustar o último intervalo
      if (currentTime > endTime) {
        const overflowMs = currentTime.getTime() - endTime.getTime();
        const overflowHours = overflowMs / (1000 * 60 * 60);
        
        // Subtrair o excesso do tipo de hora apropriado
        const lastHour = new Date(currentTime.getTime() - intervalMs).getHours();
        if (lastHour >= 22 || lastHour < 6) {
          nightHours -= overflowHours;
        } else {
          dayHours -= overflowHours;
        }
      }
    }
    
    // Arredondar para 2 casas decimais e garantir valores não negativos
    dayHours = Math.max(0, parseFloat(dayHours.toFixed(2)));
    nightHours = Math.max(0, parseFloat(nightHours.toFixed(2)));
    
    return { dayHours, nightHours };
  } catch (error) {
    console.error("Erro ao calcular horas diurnas/noturnas:", error);
    return { dayHours: 0, nightHours: 0 };
  }
}

/**
 * Busca eventos agrupados por dia para o gráfico do dashboard
 * @param startDate Data inicial para o período
 * @param endDate Data final para o período
 * @returns Array com contagem de eventos por dia
 */
export async function getEventsCountByDay(startDate?: Date, endDate?: Date) {
  try {
    // Se as datas não foram fornecidas, usar valores padrão (últimos 30 dias)
    const today = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(today.getDate() - 30)
    
    const effectiveStartDate = startDate || defaultStartDate
    const effectiveEndDate = endDate || today
    
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime()
    console.log(`Buscando eventos por dia [${timestamp}] de ${effectiveStartDate} até ${effectiveEndDate}`)
    
    // Buscar todos os eventos no período
    const events = await db.storeEvents.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: effectiveStartDate,
          lte: effectiveEndDate,
        },
      },
      select: {
        date: true,
        isApproved: true,
      },
      orderBy: {
        date: 'asc',
      },
    })
    
    // Inicializar mapa para contagem de eventos por dia
    const eventsByDay = new Map()
    
    // Gerar todas as datas no intervalo para garantir que não faltem datas
    const dateRange = getDateRange(effectiveStartDate, effectiveEndDate)
    dateRange.forEach(date => {
      const dateStr = formatDateISODay(date)
      eventsByDay.set(dateStr, { 
        date: dateStr, 
        total: 0, 
        approved: 0, 
        pending: 0 
      })
    })
    
    // Contar eventos por dia
    events.forEach(event => {
      const dateStr = formatDateISODay(event.date)
      
      if (eventsByDay.has(dateStr)) {
        const dayCount = eventsByDay.get(dateStr)
        dayCount.total += 1
        
        if (event.isApproved) {
          dayCount.approved += 1
        } else {
          dayCount.pending += 1
        }
      } else {
        eventsByDay.set(dateStr, { 
          date: dateStr, 
          total: 1, 
          approved: event.isApproved ? 1 : 0, 
          pending: event.isApproved ? 0 : 1 
        })
      }
    })
    
    // Converter o mapa para array e ordenar por data
    return Array.from(eventsByDay.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  } catch (error) {
    console.error('Erro ao buscar eventos por dia:', error)
    throw new Error('Erro ao buscar eventos por dia')
  }
}

/**
 * Formata uma data no formato ISO YYYY-MM-DD
 * @param date Data a ser formatada
 * @returns String formatada
 */
function formatDateISODay(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Gera um array com todas as datas entre o início e o fim
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Array de datas
 */
function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates = []
  const currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)
  
  const lastDate = new Date(endDate)
  lastDate.setHours(0, 0, 0, 0)
  
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
} 