'use server'
import { db } from '@/app/_lib/prisma'
import { createNotification } from '../notifications/createNotification'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

type CreateEventServicesInput = {
  StoreEventsId: string
  arriveMashguiachTime: Date
  endMashguiachTime: Date
  isApproved: boolean
  mashguiachPrice: number
  mashguiachPricePerHour: number
  observationText: string
  productionOrEvent: string
  address_zipcode: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_city: string
  address_state: string
}

export const createEventServices = async (data: CreateEventServicesInput) => {
  console.log('Iniciando a criação do serviço de eventos com dados:', data)
  const session = await getServerSession(authOptions)

  // Criando o serviço de eventos no banco de dados
  const createService = await db.eventsServices.create({
    data: {
      StoreEventsId: data.StoreEventsId,
      arriveMashguiachTime: data.arriveMashguiachTime,
      endMashguiachTime: data.endMashguiachTime,
      isApproved: data.isApproved,
      mashguiachPrice: data.mashguiachPrice,
      mashguiachPricePerHour: data.mashguiachPricePerHour,
      observationText: data.observationText,
      workType: data.productionOrEvent === 'PRODUCAO' ? 'PRODUCAO' : 'EVENTO',
      address_zipcode: data.address_zipcode,
      address_street: data.address_street,
      address_number: data.address_number,
      address_neighbor: data.address_neighbor,
      address_city: data.address_city,
      address_state: data.address_state,
    },
  })

  //  const tokens = await db.notificationToken.findMany();

  if (createService) {
    await db.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        credits: {
          decrement: data.mashguiachPrice,
        },
      },
    })

    await db.creditsTranscition.create({
      data: {
        user1: session?.user.id as string,
        amount: data.mashguiachPrice,
        serviceId: createService.id, // Valor dinâmico correto
        status: 'Pending',
        description: [
          {
            message: `O usuário ${session?.user.id} contratou um serviço de Mashguiach`,
            date: new Date(),
          },
        ],
        createdAt: new Date(), // Adicionei o campo createdAt
        updateAt: new Date(), // Adicionei o campo updateAt
      },
    })

    await createNotification({
      message: 'Novo trabalho disponível, confira',
      redirectUrl: '/events/${createService.id}',
      userId: '',
      icon: 'cilPlus',
    })
  }
  return createService
}
