import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { db } from '@/app/_lib/prisma'

// Obter todos os funcionários fixos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }


    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')
    const userId = url.searchParams.get('userId')

    const where: any = {
      deletedAt: null
    }

    if (storeId) {
      where.store_id = storeId
    }

    if (userId) {
      where.user_id = userId
    }

    const fixedJobs = await db.fixedJobs.findMany({
      where,
      include: {
        mashguiach: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        store: {
          select: {
            id: true,
            title: true
          }
        },
        WorkSchedule: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(fixedJobs)
  } catch (error) {
    console.error('Erro ao buscar funcionários fixos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar funcionários fixos' },
      { status: 500 }
    )
  }
}

// Cadastrar novo funcionário fixo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('Sessão não encontrada - autenticação falhou')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins (roleId 3 ou 4) podem cadastrar funcionários
    if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      console.log(`Usuário não autorizado: roleId = ${session.user.roleId}`)
      return NextResponse.json(
        { error: 'Você não tem permissão para cadastrar funcionários' },
        { status: 403 }
      )
    }

    const data = await req.json()
    console.log('Dados recebidos na API:', data)
    
    // Validar dados
    if (!data.user_id || !data.store_id) {
      console.log('Campos obrigatórios não preenchidos:', { 
        user_id: !!data.user_id, 
        store_id: !!data.store_id, 
      })
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se já existe um vínculo ativo para este funcionário nesta loja
    const existingJob = await db.fixedJobs.findFirst({
      where: {
        user_id: data.user_id,
        store_id: data.store_id,
        deletedAt: null
      }
    })

    if (existingJob) {
      console.log('Vínculo já existe:', existingJob.id)
      return NextResponse.json(
        { error: 'Este funcionário já está vinculado a esta loja' },
        { status: 400 }
      )
    }

    try {
      // Criar o vínculo com transação para garantir que todos os dados relacionados sejam salvos
      const result = await db.$transaction(async (tx) => {
        // Criar o vínculo principal
        const fixedJob = await tx.fixedJobs.create({
          data: {
            user_id: data.user_id,
            store_id: data.store_id,
            price_per_hour: 0,
            monthly_salary: data.monthly_salary ? Number(data.monthly_salary) : null,
            observationText: data.observationText || null
          }
        })

        // Criar os horários de trabalho
        if (data.workSchedule && Array.isArray(data.workSchedule)) {
          await Promise.all(
            data.workSchedule.map((schedule: any) =>
              tx.workSchedule.create({
                data: {
                  fixedJobId: fixedJob.id,
                  dayOfWeek: schedule.dayOfWeek,
                  timeIn: schedule.timeIn,
                  timeOut: schedule.timeOut,
                  isDayOff: schedule.isDayOff || false,
                  sundayOff: schedule.sundayOff || null
                }
              })
            )
          )
        }

        return fixedJob
      })

      // Buscar os dados completos para retornar
      const fixedJobComplete = await db.fixedJobs.findUnique({
        where: { id: result.id },
        include: {
          mashguiach: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          store: {
            select: {
              id: true,
              title: true
            }
          },
          WorkSchedule: true
        }
      })

      console.log('Funcionário criado com sucesso:', result.id)
      return NextResponse.json(fixedJobComplete, { status: 201 })
    } catch (dbError: any) {
      console.error('Erro no banco de dados:', dbError)
      return NextResponse.json(
        { error: `Erro ao salvar no banco de dados: ${dbError.message || 'Erro desconhecido'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao cadastrar funcionário fixo:', error)
    return NextResponse.json(
      { error: `Erro ao cadastrar funcionário fixo: ${error.message || 'Erro desconhecido'}` },
      { status: 500 }
    )
  }
} 