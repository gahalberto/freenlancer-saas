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
    // Parâmetros de paginação e pesquisa
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const searchParam = req.query.search as string || ''
    const status = req.query.status as string
    
    // Decodificar e limpar o termo de pesquisa
    let search = ''
    try {
      search = decodeURIComponent(searchParam).replace(/\+/g, ' ').trim()
    } catch (e) {
      // Se falhar na decodificação, use o valor original
      search = searchParam.replace(/\+/g, ' ').trim()
    }
    
    console.log('Termo de pesquisa decodificado:', search)
    
    // Calcular o offset para paginação
    const skip = (page - 1) * limit

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
      // Dividir o termo de pesquisa em palavras para busca mais flexível
      const searchTerms = search.split(' ').filter(term => term.length > 0)
      
      if (searchTerms.length > 0) {
        // Criar condições OR para cada termo de pesquisa
        where.OR = searchTerms.flatMap(term => [
          {
            title: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            clientName: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            eventType: {
              contains: term,
              mode: 'insensitive',
            },
          },
          {
            serviceType: {
              contains: term,
              mode: 'insensitive',
            },
          },
        ])
      }
    }

    console.log('Filtro de pesquisa:', JSON.stringify(where))

    // Contar o total de eventos que correspondem ao filtro
    const totalCount = await prisma.storeEvents.count({ where })

    // Buscar os eventos com paginação
    const events = await prisma.storeEvents.findMany({
      where,
      select: {
        id: true,
        title: true,
        clientName: true,
        date: true,
        eventType: true,
        serviceType: true,
        isApproved: true,
      },
      orderBy: {
        date: 'desc', // Ordenar por data decrescente (mais recentes primeiro)
      },
      skip,
      take: limit,
    })

    console.log(`Encontrados ${events.length} eventos de um total de ${totalCount}`)

    // Verificar se há mais eventos para carregar
    const hasMore = totalCount > skip + events.length

    return res.status(200).json({
      success: true,
      searchTerm: search,
      events,
      totalCount,
      hasMore,
      debug: {
        searchTerms: search.split(' ').filter(term => term.length > 0),
        filter: where,
        status: status || 'all',
      }
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