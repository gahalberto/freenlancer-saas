'use server'
import { db } from '@/app/_lib/prisma'

export const deleteEventById = async (id: string) => {
  return await db.storeEvents.update({ where: { id }, data: { deletedAt: new Date() } })
}
