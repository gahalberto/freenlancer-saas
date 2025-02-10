'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

export const ChangeUserPassword = async (userId: string, password: string) => {
  const session = await getServerSession(authOptions)

  const hashedPassword = await bcrypt.hash(password, 10)

  return await db.user.update({
    data: {
      password: hashedPassword,
    },
    where: {
      id: userId,
    },
  })
}
