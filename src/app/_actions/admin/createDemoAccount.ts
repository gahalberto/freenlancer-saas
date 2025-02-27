'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

type PropsType = {
  email: string
  name: string
  password: string
}
export const createDemoAccount = async (data: PropsType) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('Usuário não autenticado')
  }

  console.log('received data', data)

  const emailAlreadyExists = await db.user.findFirst({
    where: { email: data.email },
  })

  if (emailAlreadyExists) {
    throw new Error('Email já cadastrado')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  return await db.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      roleId: 4,
      isAdminPreview: true,
    },
  })
}
