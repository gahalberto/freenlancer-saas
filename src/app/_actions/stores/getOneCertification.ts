'use server'
import { db } from '@/app/_lib/prisma'

export const getCertificate = async (id: string) => {
  return await db.certifications.findUnique({
    where: {
      id: id,
    },
    include: {
      store: true,
    },
  })
}
