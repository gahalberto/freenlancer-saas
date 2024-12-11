'use server'

import { db } from '@/app/_lib/prisma'
import { Prisma, Stores } from '@prisma/client'

export const editStore = async (data: Stores) => {
  return await db.stores.update({
    where: { id: data.id },
    data,
  })
}
