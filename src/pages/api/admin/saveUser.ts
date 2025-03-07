import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  id: z.string().uuid('ID de usuário inválido'),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  roleId: z.number().int().optional(),
  synagogueId: z.number().int().nullable().optional(),
  status: z.boolean().optional(),
  jewishName: z.string().nullable().optional(),
  address_neighbor: z.string().optional(),
  address_number: z.string().optional(),
  address_state: z.string().optional(),
  address_street: z.string().optional(),
  address_zicode: z.string().optional(),
  address_city: z.string().optional(),
  address_lat: z.string().nullable().optional(),
  address_lng: z.string().nullable().optional(),
  pixKey: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
})

type ResponseData = {
  success: boolean
  message?: string
  user?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    // Validar os dados recebidos
    const userData = updateUserSchema.parse(req.body)
    
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    })

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' })
    }

    // Verificar se o email já está em uso por outro usuário
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Este email já está em uso' })
      }
    }

    // Preparar os dados para atualização
    const updateData: any = { ...userData }
    
    // Remover o ID do objeto de atualização
    delete updateData.id
    
    // Se houver senha, fazer o hash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: updateData,
    })

    // Remover a senha do objeto de resposta
    const { password, ...userWithoutPassword } = updatedUser

    return res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: userWithoutPassword,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        user: { errors: error.errors },
      })
    }

    console.error('Erro ao atualizar usuário:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
}
