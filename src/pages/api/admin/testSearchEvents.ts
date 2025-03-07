import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    // Parâmetros de pesquisa
    const searchParam = req.query.search as string || ''
    const status = req.query.status as string
    
    // Decodificar e limpar o termo de pesquisa
    const search = decodeURIComponent(searchParam).replace(/\+/g, ' ').trim()
    
    console.log('Termo de pesquisa decodificado:', search)
    
    // Construir o filtro de pesquisa
    const where: any = {
      deletedAt: null, // Excluir eventos deletados
    }

    // Adicionar filtro de status (pendente ou aprovado)
    if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'approved') {
      where.isApproved = true
    }

    // Adicionar filtro de pesquisa por título se fornecido
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          clientName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    console.log('Filtro de pesquisa:', JSON.stringify(where))

    // Buscar todos os eventos que correspondem ao filtro
    const allEvents = await prisma.storeEvents.findMany({
      where,
      select: {
        id: true,
        title: true,
        clientName: true,
        date: true,
        isApproved: true,
      },
    })

    console.log(`Encontrados ${allEvents.length} eventos`)

    // Buscar todos os eventos para comparação
    const totalEvents = await prisma.storeEvents.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        clientName: true,
        date: true,
        isApproved: true,
      },
    })

    return res.status(200).json({
      success: true,
      searchTerm: search,
      statusFilter: status || 'all',
      filteredEvents: allEvents,
      totalEventsCount: totalEvents.length,
      pendingEventsCount: totalEvents.filter(e => !e.isApproved).length,
      approvedEventsCount: totalEvents.filter(e => e.isApproved).length,
      allEvents: totalEvents.slice(0, 10), // Retornar apenas os primeiros 10 para não sobrecarregar
    })
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação',
    })
  } finally {
    await prisma.$disconnect()
  }
} 