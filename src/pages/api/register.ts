import { db } from '@/app/_lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const { name, phone, email, password } = req.body

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: 'E-mail e senha são obrigatórios',
    })

  try {
    const { name, phone, email, password } = userSchema.parse(req.body)
    const hasUser = await db.user.findFirst({
      where: {
        email,
      },
    })
    if (hasUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado, faça o login',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await db.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        roleId: 1,
      },
    })

    const token = await jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roleId: newUser.roleId,
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '999h' },
    )

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: token,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors, // Acesso garantido porque ZodError tem a propriedade 'errors'
      })
    }
    console.error('Erro inesperado:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  }
}
