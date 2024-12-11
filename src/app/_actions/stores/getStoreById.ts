'use server'
import { db } from '@/app/_lib/prisma'

export const getStoreById = async (id: string) => {
  return await db.stores.findUnique({
    where: { id },
  })
}
