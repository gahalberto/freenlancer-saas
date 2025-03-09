import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateToken } from '../validateToken'

const prisma = new PrismaClient()

type ResponseData = {
  success: boolean
  message?: string
  events?: any[]
  totalCount?: number
  hasMore?: boolean
  debug?: any // Campo para depuração
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    // Obter token do cabeçalho ou do parâmetro de consulta
    let token = ''
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.query.token) {
      token = req.query.token as string
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' })
    }

    // Validar o token
    const { valid, decoded, error } = await validateToken(token)
    if (!valid) {
      return res.status(401).json({ success: false, message: error || 'Token inválido' })
    }

    // Parâmetros de paginação e pesquisa
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const searchParam = req.query.search as string || ''
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string
    const debug = req.query.debug === 'true'
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

    // Adicionar filtro de data se fornecido
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    }

    console.log('Filtro de pesquisa:', JSON.stringify(where))

    // Contar o total de eventos que correspondem ao filtro
    const totalCount = await prisma.storeEvents.count({ where })

    // Buscar os eventos com paginação
    const events = await prisma.storeEvents.findMany({
      where,
      include: {
        EventsServices: {
          orderBy: {
            arriveMashguiachTime: 'asc',
          },
          include: {
            Mashguiach: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        store: true,
        eventOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        
        EventsAdresses: true,
      },
      orderBy: {
        date: 'asc', // Ordenar por data decrescente (mais recentes primeiro)
      },
      skip,
      take: limit,
    })

    console.log(`Encontrados ${events.length} eventos de um total de ${totalCount}`)

    // Verificar se há mais eventos para carregar
    const hasMore = totalCount > skip + events.length

    // Preparar a resposta
    const response: ResponseData = {
      success: true,
      events,
      totalCount,
      hasMore,
    }

    // Adicionar informações de depuração se solicitado
    if (debug) {
      response.debug = {
        searchTerm: search,
        filter: where,
        pagination: { page, limit, skip },
      }
    }

    return res.status(200).json(response)
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
