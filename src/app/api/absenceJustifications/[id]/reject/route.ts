import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { db } from '@/app/_lib/prisma'

// Rejeitar uma justificativa
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é administrador (roleId 3 ou 4)
    if (session.user.roleId !== 3 && session.user.roleId !== 4) {
      return NextResponse.json(
        { error: 'Apenas administradores podem rejeitar justificativas' },
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

    // Verificar se a justificativa existe
    const existingJustification = await db.absenceJustification.findUnique({
      where: { id }
    })

    if (!existingJustification) {
      return NextResponse.json(
        { error: 'Justificativa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já está rejeitada
    if (existingJustification.status === 'Rejected') {
      return NextResponse.json(
        { error: 'Esta justificativa já está rejeitada' },
        { status: 400 }
      )
    }

    // Rejeitar justificativa
    const justification = await db.absenceJustification.update({
      where: { id },
      data: {
        status: 'Rejected'
      }
    })

    return NextResponse.json(justification)
  } catch (error) {
    console.error('Erro ao rejeitar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao rejeitar justificativa' },
      { status: 500 }
    )
  }
} 