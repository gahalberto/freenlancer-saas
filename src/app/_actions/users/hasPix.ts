'use server'

import { db } from '@/app/_lib/prisma'

export const userHasPix = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  return await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      pixKey: true,
    },
  })
}

export const updateUserPix = async (userId: string, pixKey: string) => {
  return await db.user.update({
    where: {
      id: userId,
    },
    data: {
      pixKey,
    },
  })
}
