'use server'

import { db } from '../_lib/prisma'
import bcrypt from 'bcryptjs'

export const registerUser = async (data: {
  name: string
  email: string
  password: string
  phone: string
  address: string
  roleId: string
}) => {
  // Criptografar a senha antes de salvar
  const hashedPassword = await bcrypt.hash(data.password, 10)

  if (data.roleId != '1' && data.roleId != '2') {
    throw new Error('Escola uma opção, se você é Mashguiach ou Restaurante!')
    return false
  }

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error(
      'Este e-mail já está em uso, volte a página de login e clique em esqueci minha senha, caso você esqueceu sua senha!',
    )
    return false
  }

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: hashedPassword, // Armazena a senha criptografada
      roleId: parseInt(data.roleId),
    },
  })
}
