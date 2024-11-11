'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

export const makeAdmin = async (userId: string) => {
  const session = await getServerSession(authOptions)

  await db.user.update({
    data: {
      roleId: 3,
    },
    where: {
      id: userId,
    },
  })
}
