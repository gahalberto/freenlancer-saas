'use server'

import { db } from '@/app/_lib/prisma'

export const getStores = async (userId: string) => {
  console.log("USER ID DO STORES", userId)
  return await db.stores.findMany({ where: { userId }, include: { Certifications: true } })
}
