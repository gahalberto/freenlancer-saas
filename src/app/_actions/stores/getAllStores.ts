'use server'

import { db } from '@/app/_lib/prisma'

export const getAllStores = async () => {
  return await db.stores.findMany({
    include: { Certifications: true },
  })
}
