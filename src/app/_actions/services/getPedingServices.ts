'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

export const getPendingService = async () => {
  const session = await getServerSession(authOptions)
  const today = new Date()

  // Verifica se o usuário está logado
  if (!session?.user?.id) {
    throw new Error('Sessão inválida ou usuário não logado.')
  }

  const userStores = await db.stores.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      id: true,
    },
  })

  const storeIds = userStores.map((store) => store.id)

  // Verifica se existem lojas associadas ao usuário
  if (storeIds.length === 0) {
    console.log('Nenhuma loja encontrada para o usuário.')
    return [] // Retorna um array vazio se o usuário não tiver lojas
  }

  const storesEvents = await db.storeEvents.findMany({
    where: {
      storeId: {
        in: storeIds,
      },
    },
    select: {
      id: true,
    },
  })

  const eventsId = storesEvents.map((event) => event.id)

  return await db.eventsServices.findMany({
    where: {
      accepted: true, // Apenas serviços aceitos
      paymentStatus: 'Pending',
      StoreEventsId: {
        in: eventsId, // Passa um array de IDs válidos
      },
    },
    include: {
      StoreEvents: true,
      Mashguiach: true,
    },
  })
}
