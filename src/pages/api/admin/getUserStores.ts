import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  // Verificar a autenticação
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autenticado' })
  }

  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ success: false, message: 'ID de usuário é obrigatório' })
    }

    // Buscar estabelecimentos onde o usuário trabalha como mashguiach fixo
    const fixedJobs = await db.fixedJobs.findMany({
      where: {
        user_id: userId,
        deletedAt: null
      },
      select: {
        store_id: true,
        store: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Extrair informações dos estabelecimentos
    const stores = fixedJobs.map(job => ({
      id: job.store.id,
      title: job.store.title
    }))

    // Adicionar também estabelecimentos onde o usuário trabalhou como freelancer
    const freelancerStores = await db.eventsServices.findMany({
      where: {
        mashguiachId: userId,
        StoreEvents: {
          storeId: {
            notIn: stores.map(store => store.id) // Excluir os que já estão na lista de fixos
          }
        }
      },
      select: {
        StoreEvents: {
          select: {
            storeId: true,
            store: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      distinct: ['StoreEventsId'] // Evitar duplicatas
    })

    // Adicionar estabelecimentos freelancer à lista
    freelancerStores.forEach(service => {
      if (service.StoreEvents?.store) {
        stores.push({
          id: service.StoreEvents.store.id,
          title: service.StoreEvents.store.title
        })
      }
    })

    // Remover duplicatas (caso haja)
    const uniqueStores = stores.filter((store, index, self) => 
      index === self.findIndex(s => s.id === store.id)
    )

    return res.status(200).json({
      success: true,
      stores: uniqueStores
    })
  } catch (error) {
    console.error('Erro ao buscar estabelecimentos do usuário:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar estabelecimentos',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 