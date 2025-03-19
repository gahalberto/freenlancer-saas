import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { db } from '@/app/_lib/prisma'

// Obter todas as justificativas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é administrador (roleId 3 ou 4)
    if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      // Se não for admin, retornar apenas justificativas do próprio usuário
      const justifications = await (db as any).absenceJustification.findMany({
        where: {
          user_id: session.user.id
        },
        include: {
          user: {
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(justifications)
    }

    // Se for admin, retornar todas as justificativas
    const justifications = await (db as any).absenceJustification.findMany({
      include: {
        user: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(justifications)
  } catch (error) {
    console.error('Erro ao buscar justificativas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar justificativas' },
      { status: 500 }
    )
  }
}

// Criar nova justificativa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await req.json()
    
    // Validar dados
    if (!data.user_id || !data.store_id || !data.date || !data.reason) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se usuário pode cadastrar essa justificativa
    // Se não for admin, só pode cadastrar para si mesmo
    if (session.user.roleId !== 3 && session.user.roleId !== 4 && data.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para cadastrar justificativas para outros usuários' },
        { status: 403 }
      )
    }

    // Criar justificativa
    const justification = await (db as any).absenceJustification.create({
      data: {
        user_id: data.user_id,
        store_id: data.store_id,
        date: new Date(data.date),
        reason: data.reason,
        attachmentUrl: data.attachmentUrl || null,
        status: 'Pending' // Status inicial sempre pendente
      }
    })

    return NextResponse.json(justification, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar justificativa' },
      { status: 500 }
    )
  }
} 