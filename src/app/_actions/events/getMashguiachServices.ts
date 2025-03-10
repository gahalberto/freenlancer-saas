'use server'

import { db } from '@/app/_lib/prisma'
import { z } from 'zod'

// Schema de validação para os parâmetros
const paramsSchema = z.object({
  user_id: z.string().uuid('ID de usuário inválido'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
})

type GetMashguiachServicesParams = z.infer<typeof paramsSchema>

type GetMashguiachServicesResult = {
  success: boolean
  message?: string
  services?: any[]
  totalServices?: number
  totalHours?: number
  totalValue?: number
}

export async function getMashguiachServices({
  user_id,
  month,
  year,
}: GetMashguiachServicesParams): Promise<GetMashguiachServicesResult> {
  try {
    // Validar os parâmetros
    paramsSchema.parse({ user_id, month, year })

    // Calcular o primeiro e o último dia do mês
    const firstDay = new Date(year, month - 1, 1) // Mês em JavaScript é 0-indexed
    const lastDay = new Date(year, month, 0) // Último dia do mês

    // Ajustar para o início e fim do dia
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    // Buscar os serviços do mashguiach no período especificado
    const services = await db.eventsServices.findMany({
      where: {
        mashguiachId: user_id,
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

    // Retornar os serviços encontrados e estatísticas
    return {
      success: true,
      services,
      totalServices: services.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
    }
  } catch (error) {
    console.error('Erro ao buscar serviços do mashguiach:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Parâmetros inválidos: ' + error.message,
      }
    }
    
    return {
      success: false,
      message: 'Erro ao buscar serviços do mashguiach',
    }
  }
} 