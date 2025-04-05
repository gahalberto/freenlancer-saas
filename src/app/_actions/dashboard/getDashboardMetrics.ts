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
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Obter o ano atual
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1) // 1º de janeiro do ano atual
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59) // 31 de dezembro do ano atual

    // Contar total de mashguichim (usuários com roleId = 2)
    const totalMashguichim = await db.user.count({
      where: {
        roleId: 2,
      },
    })

    // Contar total de estabelecimentos
    const totalEstablishments = await db.stores.count()

    // Contar total de eventos do ano atual
    const totalEventsThisYear = await db.storeEvents.count({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    })

    // Contar total de funcionários com trabalhos fixos (simplificado)
    const totalFixedJobs = await db.fixedJobs.count()

    // Contar total de eventos pendentes
    const totalPendingEvents = await db.storeEvents.count({
      where: {
        isApproved: false,
      },
    })

    // Contar total de próximos eventos (a partir de hoje)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const totalUpcomingEvents = await db.storeEvents.count({
      where: {
        date: {
          gte: today,
        },
      },
    })

    // Contar total de pagamentos pendentes
    const totalPendingPayments = await db.eventsServices.count({
      where: {
        paymentStatus: 'Pending',
      }
    })

    // Obter o total a pagar pendente
    // Buscar serviços com pagamentos pendentes
    const pendingServices = await db.eventsServices.findMany({
      where: {
        paymentStatus: 'Pending',
        NOT: {
          mashguiachId: null
        }
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

    // Calcular o valor total gerado neste mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date()
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const thisMonthServices = await db.eventsServices.findMany({
      where: {
        arriveMashguiachTime: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        NOT: {
          mashguiachId: null
        }
      }
    })

    let totalAmountThisMonth = 0
    for (const service of thisMonthServices) {
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
 * @returns Array de eventos pendentes
 */
export async function getPendingEvents() {
  try {
    const pendingEvents = await db.storeEvents.findMany({
      where: {
        isApproved: false,
        deletedAt: null,
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
 * @returns Array de próximos eventos
 */
export async function getUpcomingEvents() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingEvents = await db.storeEvents.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: today,
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