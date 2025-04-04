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

    return {
      totalMashguichim,
      totalEstablishments,
      totalEventsThisYear,
      totalFixedJobs,
      totalPendingEvents,
      totalUpcomingEvents,
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