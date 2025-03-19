import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { db } from '@/app/_lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await req.json()
    
    // Validar dados
    if (!data.user_id || !data.store_id || !data.entryType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem permissão para registrar ponto
    // Apenas o próprio usuário ou admin pode registrar
    if (data.user_id !== session.user.id && session.user.roleId !== 3 && session.user.roleId !== 4) {
      return NextResponse.json(
        { error: 'Não autorizado a registrar ponto para outro usuário' },
        { status: 403 }
      )
    }

    // Verificar se já existe um registro para o usuário hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let timeEntry = await db.timeEntries.findFirst({
      where: {
        user_id: data.user_id,
        store_id: data.store_id,
        OR: [
          {
            entrace: {
              gte: today,
              lt: tomorrow
            }
          },
          {
            exit: {
              gte: today,
              lt: tomorrow
            }
          },
          {
            lunchEntrace: {
              gte: today,
              lt: tomorrow
            }
          },
          {
            lunchExit: {
              gte: today,
              lt: tomorrow
            }
          }
        ]
      }
    })

    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date()
    
    // Se não existir registro, criar um novo
    if (!timeEntry) {
      const entryData: any = {
        user_id: data.user_id,
        store_id: data.store_id,
        latitude: data.latitude || null,
        longitude: data.longitude || null
      }

      // Adicionar o tipo de registro
      if (data.entryType === 'entrace') {
        entryData.entrace = timestamp
      } else if (data.entryType === 'exit') {
        entryData.exit = timestamp
      } else if (data.entryType === 'lunchEntrace') {
        entryData.lunchEntrace = timestamp
      } else if (data.entryType === 'lunchExit') {
        entryData.lunchExit = timestamp
      }

      timeEntry = await db.timeEntries.create({
        data: entryData
      })
    } else {
      // Se já existir, atualizar o registro
      const updateData: any = {
        latitude: data.latitude || timeEntry.latitude,
        longitude: data.longitude || timeEntry.longitude
      }

      // Adicionar o tipo de registro
      if (data.entryType === 'entrace') {
        updateData.entrace = timestamp
      } else if (data.entryType === 'exit') {
        updateData.exit = timestamp
      } else if (data.entryType === 'lunchEntrace') {
        updateData.lunchEntrace = timestamp
      } else if (data.entryType === 'lunchExit') {
        updateData.lunchExit = timestamp
      }

      timeEntry = await db.timeEntries.update({
        where: { id: timeEntry.id },
        data: updateData
      })
    }

    return NextResponse.json(timeEntry, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar ponto:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar ponto' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const storeId = url.searchParams.get('storeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Construir filtro
    const filter: any = {}

    if (userId) {
      filter.user_id = userId
    } else if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      // Se não for admin, só pode ver seus próprios registros
      filter.user_id = session.user.id
    }

    if (storeId) {
      filter.store_id = storeId
    }

    // Filtrar por período
    if (startDate || endDate) {
      filter.OR = []
      
      const dateFilter: Record<string, Date> = {}
      
      if (startDate) {
        dateFilter['gte'] = new Date(startDate)
      }
      
      if (endDate) {
        dateFilter['lte'] = new Date(endDate)
      }
      
      if (Object.keys(dateFilter).length > 0) {
        filter.OR.push({ entrace: dateFilter })
        filter.OR.push({ exit: dateFilter })
        filter.OR.push({ lunchEntrace: dateFilter })
        filter.OR.push({ lunchExit: dateFilter })
      }
    }

    const entries = await db.timeEntries.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        stores: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        entrace: 'desc'
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Erro ao buscar registros de ponto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar registros de ponto' },
      { status: 500 }
    )
  }
} 