'use server'

import { db } from '@/app/_lib/prisma'

export const getEventServiceById = async (serviceId: string) => {
  try {
    const service = await db.eventsServices.findUnique({
      where: {
        id: serviceId
      }
    })
    
    return service
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    throw error
  }
} 