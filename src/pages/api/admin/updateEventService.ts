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
      
      // Calcular horas diurnas e noturnas
      let dayHours = 0;
      let nightHours = 0;
      
      // Criar cópia da data de início para iterar
      const currentTime = new Date(startDateTime);
      
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
        if (currentTime > endDateTime) {
          const overflowMs = currentTime.getTime() - endDateTime.getTime();
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
      
      // Calcular preço total
      const dayValue = Math.max(0, dayHours) * dayHourValue;
      const nightValue = Math.max(0, nightHours) * nightHourValue;
      const totalValue = dayValue + nightValue;
      
      // Atualizar o preço total
      updateData.mashguiachPrice = totalValue;
      
      console.log('Preço recalculado:', {
        dayHours: Math.max(0, dayHours),
        nightHours: Math.max(0, nightHours),
        dayValue,
        nightValue,
        totalValue
      });
    }

    // Atualizar o serviço
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

    return res.status(200).json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      service: updatedService,
    })
  } catch (error) {
    console.log('Erro ao atualizar serviço:', error)
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