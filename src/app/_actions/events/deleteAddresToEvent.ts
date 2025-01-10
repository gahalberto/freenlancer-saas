'use server'
import { db } from '@/app/_lib/prisma'

export const deleteAddresToEvenet = async (id: string) => {
  return await db.eventsAdresses.delete({ where: { id } })
}
