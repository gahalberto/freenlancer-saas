import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { validateToken } from '../validateToken'

const prisma = new PrismaClient()

// Schema de validação para atualização de loja
const updateStoreSchema = z.object({
  id: z.string().uuid('ID de loja inválido'),
  title: z.string().min(1, 'Título é obrigatório').optional(),
  userId: z.string().uuid('ID de usuário inválido').nullable().optional(),
  isMashguiach: z.boolean().optional(),
  mashguiachId: z.string().uuid('ID de mashguiach inválido').nullable().optional(),
  storeTypeId: z.string().uuid('ID de tipo de loja inválido').optional(),
  isAutomated: z.boolean().optional(),
  address_zipcode: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_neighbor: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  comercialPhone: z.string().optional(),
  phone: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  menuUrl: z.string().nullable().optional(),
})

type ResponseData = {
  success: boolean
  message?: string
  store?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  // Validar o token de autenticação
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' })
  }

  // Formato esperado: "Bearer <token>"
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Formato de token inválido' })
  }

  // Validar o token
  const { valid, decoded, error } = await validateToken(token)
  if (!valid) {
    return res.status(401).json({ success: false, message: error || 'Token inválido' })
  }

  try {
    // Validar os dados recebidos
    const storeData = updateStoreSchema.parse(req.body)
    
    // Verificar se a loja existe
    const existingStore = await prisma.stores.findUnique({
      where: { id: storeData.id },
    })

    if (!existingStore) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' })
    }

    // Verificar se o tipo de loja existe, se estiver sendo atualizado
    if (storeData.storeTypeId && storeData.storeTypeId !== existingStore.storeTypeId) {
      const storeTypeExists = await prisma.storesType.findUnique({
        where: { id: storeData.storeTypeId },
      })

      if (!storeTypeExists) {
        return res.status(400).json({ success: false, message: 'Tipo de loja não encontrado' })
      }
    }

    // Preparar os dados para atualização
    const updateData: any = { ...storeData }
    
    // Remover o ID do objeto de atualização
    delete updateData.id

    // Atualizar a loja
    const updatedStore = await prisma.stores.update({
      where: { id: storeData.id },
      data: updateData,
      include: {
        storeType: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Loja atualizada com sucesso',
      store: updatedStore,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        store: { errors: error.errors },
      })
    }

    console.error('Erro ao atualizar loja:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
} 