'use server'

import { db } from '@/app/_lib/prisma'

export const getStoreMashguichim = async (storeId: string[]) => {
  return await db.fixedJobs.findMany({ where: { store_id: {
    in: storeId
  } } })
}
