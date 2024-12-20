'use server'

import { db } from '@/app/_lib/prisma'
import { Stores } from '@prisma/client'

export const editStore = async (data: Omit<Stores, 'userId'> & { storeTypeId: string }) => {
  const { storeTypeId, ...rest } = data

  return await db.stores.update({
    where: { id: data.id },
    data: {
      ...rest,
      storeType: {
        connect: {
          id: storeTypeId,
        },
      },
    },
  })
}
