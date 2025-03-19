import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

// Obter um funcionário específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    const fixedJob = await db.fixedJobs.findUnique({
      where: {
        id,
        deletedAt: null
      },
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

    if (!fixedJob) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(fixedJob)
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar funcionário' },
      { status: 500 }
    )
  }
}

// Atualizar um funcionário
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins (roleId 3 ou 4) podem editar funcionários
    if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar funcionários' },
        { status: 403 }
      )
    }

    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    const data = await req.json()
    
    // Validar dados
    if (!data.price_per_hour) {
      return NextResponse.json(
        { error: 'Campo obrigatório (price_per_hour) não preenchido' },
        { status: 400 }
      )
    }

    // Verificar se o funcionário existe
    const existingFixedJob = await db.fixedJobs.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        WorkSchedule: true
      }
    })

    if (!existingFixedJob) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar com transação para garantir consistência
    const result = await db.$transaction(async (tx) => {
      // Atualizar dados principais
      const fixedJob = await tx.fixedJobs.update({
        where: { id },
        data: {
          price_per_hour: data.price_per_hour,
          monthly_salary: data.monthly_salary || null,
          observationText: data.observationText
        }
      })

      // Atualizar horários de trabalho
      if (data.workSchedule && Array.isArray(data.workSchedule)) {
        // Remover horários existentes
        await tx.workSchedule.deleteMany({
          where: { fixedJobId: id }
        })

        // Criar novos horários
        await Promise.all(
          data.workSchedule.map((schedule: any) =>
            tx.workSchedule.create({
              data: {
                fixedJobId: id,
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
      where: { id },
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

    return NextResponse.json(fixedJobComplete)
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar funcionário' },
      { status: 500 }
    )
  }
}

// Deletar um funcionário (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins (roleId 3 ou 4) podem remover funcionários
    if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      return NextResponse.json(
        { error: 'Você não tem permissão para remover funcionários' },
        { status: 403 }
      )
    }

    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se o funcionário existe
    const existingFixedJob = await db.fixedJobs.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!existingFixedJob) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await db.fixedJobs.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })

    return NextResponse.json(
      { message: 'Funcionário removido com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover funcionário:', error)
    return NextResponse.json(
      { error: 'Erro ao remover funcionário' },
      { status: 500 }
    )
  }
} 