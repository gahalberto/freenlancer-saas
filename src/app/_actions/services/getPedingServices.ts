'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

export const getPendingService = async () => {
  const today = new Date()

  const storesEvents = await db.storeEvents.findMany({
    where: {
      date: {
        lt: new Date()
      }
    }
    })

  const eventsId = storesEvents.map((event) => event.id)

  return await db.eventsServices.findMany({
    where: {
      // accepted: true, // Apenas serviços aceitos
      paymentStatus: 'Pending',
    },
    include: {
      StoreEvents: true,
      Mashguiach: true,
    },
  })
}
