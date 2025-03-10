import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { validateToken } from '../validateToken'

const prisma = new PrismaClient()

// Schema de validação para atualização de serviço de evento
const updateEventServiceSchema = z.object({
  id: z.string().uuid('ID de serviço inválido'),
  StoreEventsId: z.string().uuid('ID de evento inválido').optional(),
  arriveMashguiachTime: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  endMashguiachTime: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  isApproved: z.boolean().optional(),
  mashguiachId: z.string().uuid('ID de mashguiach inválido').nullable().optional(),
  mashguiachPrice: z.number().nonnegative('Preço deve ser não-negativo').optional(),
  observationText: z.string().nullable().optional(),
  accepted: z.boolean().optional(),
  responseDate: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
  StoreId: z.string().optional(),
  paymentStatus: z.enum(['Pending', 'Completed', 'Failed', 'Refunded']).optional(),
  reallyMashguiachArrive: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
  reallyMashguiachEndTime: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  mashguiachPricePerHour: z.number().nonnegative('Preço por hora deve ser não-negativo').optional(),
  transport_price: z.number().nonnegative('Preço de transporte deve ser não-negativo').nullable().optional(),
  dayHourValue: z.number().nonnegative('Valor da hora diurna deve ser não-negativo').optional(),
  nightHourValue: z.number().nonnegative('Valor da hora noturna deve ser não-negativo').optional(),
  address_zipcode: z.string().nullable().optional(),
  address_street: z.string().nullable().optional(),
  address_number: z.string().nullable().optional(),
  address_neighbor: z.string().nullable().optional(),
  address_city: z.string().nullable().optional(),
  address_state: z.string().nullable().optional(),
  workType: z.enum(['EVENTO', 'PRODUCAO', 'SUBSTITUICAO']).nullable().optional(),
})

type ResponseData = {
  success: boolean
  message?: string
  service?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  console.log('Chegou no updateEventService')
  console.log(req.body)

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

  console.log('Token:', token)
  // Validar o token
  const { valid, decoded, error } = await validateToken(token)
  if (!valid) {
    return res.status(401).json({ success: false, message: error || 'Token inválido' })
  }

  console.log('Token validado')
  try {
    // Validar os dados recebidos
    const serviceData = updateEventServiceSchema.parse(req.body)
    
    // Verificar se o serviço existe
    const existingService = await prisma.eventsServices.findUnique({
      where: { id: serviceData.id },
    })

    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Serviço não encontrado' })
      console.log('Serviço não encontrado')
    }

    console.log('Serviço encontrado')
    // Verificar se o mashguiach existe, se estiver sendo atualizado
    if (serviceData.mashguiachId && serviceData.mashguiachId !== existingService.mashguiachId) {
      const mashguiachExists = await prisma.user.findUnique({
        where: { id: serviceData.mashguiachId },
      })
      console.log('Mashguiach encontrado')

      if (!mashguiachExists) {
        console.log('Mashguiach não encontrado')
        return res.status(400).json({ success: false, message: 'Mashguiach não encontrado' })
      }
    }

    // Verificar se o evento existe, se estiver sendo atualizado
    if (serviceData.StoreEventsId && serviceData.StoreEventsId !== existingService.StoreEventsId) {
      const eventExists = await prisma.storeEvents.findUnique({
        where: { id: serviceData.StoreEventsId },
      })

      if (!eventExists) {
        return res.status(400).json({ success: false, message: 'Evento não encontrado' })
        console.log('Evento não encontrado')
      }
    }

    // Preparar os dados para atualização
    const updateData: any = { ...serviceData }
    
    // Remover o ID do objeto de atualização
    delete updateData.id

    // Remover campos que o Prisma não reconhece na operação de update
    const dayHourValueToUpdate = updateData.dayHourValue
    const nightHourValueToUpdate = updateData.nightHourValue
    console.log('Valores de hora a serem atualizados:', { dayHourValueToUpdate, nightHourValueToUpdate })
    delete updateData.dayHourValue
    delete updateData.nightHourValue

    // Converter StoreEventsId para o formato esperado pelo Prisma na operação de update
    if (updateData.StoreEventsId) {
      updateData.StoreEvents = {
        connect: { id: updateData.StoreEventsId }
      }
      delete updateData.StoreEventsId
    }

    // Converter mashguiachId para o formato esperado pelo Prisma na operação de update
    if (updateData.mashguiachId !== undefined) {
      if (updateData.mashguiachId === null) {
        updateData.Mashguiach = { disconnect: true }
      } else {
        updateData.Mashguiach = {
          connect: { id: updateData.mashguiachId }
        }
      }
      delete updateData.mashguiachId
    }

    // Recalcular o preço total se os valores de hora ou datas foram alterados
    if ((serviceData.dayHourValue !== undefined || serviceData.nightHourValue !== undefined) && 
        (serviceData.arriveMashguiachTime && serviceData.endMashguiachTime)) {
      
      // Usar os valores atualizados ou os existentes
      const dayHourValue = serviceData.dayHourValue ?? 
        (existingService as any).dayHourValue ?? 50;
      const nightHourValue = serviceData.nightHourValue ?? 
        (existingService as any).nightHourValue ?? 75;
      
      // Calcular a duração e o preço
      const startDateTime = new Date(serviceData.arriveMashguiachTime);
      const endDateTime = new Date(serviceData.endMashguiachTime);
      
      // Calcular duração total em horas
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      // Calcular horas diurnas e noturnas
      let dayHours = 0;
      let nightHours = 0;
      
      // Criar cópias das datas para manipulação
      const currentTime = new Date(startDateTime);
      
      // Iterar hora a hora
      while (currentTime < endDateTime) {
        const hour = currentTime.getHours();
        
        // Verificar se é hora diurna (6h-22h) ou noturna (22h-6h)
        if (hour >= 22 || hour < 6) {
          nightHours += 1;
        } else {
          dayHours += 1;
        }
        
        // Avançar 1 hora
        currentTime.setHours(currentTime.getHours() + 1);
      }
      
      // Ajustar a última hora parcial
      const endMinutes = endDateTime.getMinutes();
      const endHour = endDateTime.getHours();
      const lastHourFraction = endMinutes / 60;
      
      if (endHour >= 22 || endHour < 6) {
        nightHours -= (1 - lastHourFraction);
      } else {
        dayHours -= (1 - lastHourFraction);
      }
      
      // Garantir que não haja valores negativos
      dayHours = Math.max(0, dayHours);
      nightHours = Math.max(0, nightHours);
      
      // Calcular valores
      const dayValue = dayHours * dayHourValue;
      const nightValue = nightHours * nightHourValue;
      let totalValue = dayValue + nightValue;
      
      // Adicionar valor do transporte, se existir
      if (updateData.transport_price) {
        totalValue += Number(updateData.transport_price);
      }
      
      // Atualizar o preço total
      updateData.mashguiachPrice = totalValue;
      
      console.log('Preço recalculado:', {
        dayHours,
        nightHours,
        dayValue,
        nightValue,
        transportValue: updateData.transport_price || 0,
        totalValue
      });
    }

    // Atualizar o serviço
    console.log('Dados para atualização (após processamento):', JSON.stringify(updateData, null, 2))
    
    // Primeiro, atualizar os campos principais
    const updatedService = await prisma.eventsServices.update({
      where: { id: serviceData.id },
      data: updateData,
      include: {
        StoreEvents: true,
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
    })

    // Se os valores de hora foram fornecidos, atualizar diretamente no banco de dados
    // usando uma consulta SQL bruta
    if (dayHourValueToUpdate !== undefined || nightHourValueToUpdate !== undefined) {
      try {
        // Construir a consulta SQL
        let sql = `UPDATE "EventsServices" SET `
        const params: any[] = []
        let paramIndex = 1
        
        if (dayHourValueToUpdate !== undefined) {
          sql += `"dayHourValue" = $${paramIndex}`
          params.push(dayHourValueToUpdate)
          paramIndex++
        }
        
        if (nightHourValueToUpdate !== undefined) {
          if (paramIndex > 1) sql += ', '
          sql += `"nightHourValue" = $${paramIndex}`
          params.push(nightHourValueToUpdate)
          paramIndex++
        }
        
        sql += ` WHERE "id" = $${paramIndex}`
        params.push(serviceData.id)
        
        // Executar a consulta SQL
        await prisma.$executeRawUnsafe(sql, ...params)
        
        console.log('Valores de hora atualizados com sucesso via SQL')
      } catch (sqlError) {
        console.error('Erro ao atualizar valores de hora via SQL:', sqlError)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      service: updatedService,
    })
  } catch (error) {
    console.log('Erro ao atualizar serviço:', error)
    
    // Tratamento específico para erros do Prisma
    if (error && typeof error === 'object' && 'name' in error && error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação do Prisma: ' + (error as any).message,
      })
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        service: { errors: error.errors },
      })
    }

    console.error('Erro ao atualizar serviço:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
} 