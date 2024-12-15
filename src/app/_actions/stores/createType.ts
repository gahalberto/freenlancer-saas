'use server'
import { db } from '@/app/_lib/prisma'

export const createType = async (title: string) => {
  return await db.storesType.create({
    data: {
      title,
    },
  })
}

export const deleteType = async (id: string) => {
  return await db.storesType.delete({
    where: {
      id,
    },
  })
}
