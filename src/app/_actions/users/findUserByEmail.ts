'use server'

import { db } from '@/app/_lib/prisma'

export const findUserByEmail = async (email: string) => {
  return await db.user.findFirst({ where: { email } })
}
