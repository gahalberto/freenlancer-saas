import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

// Aprovar uma justificativa
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
        { error: 'Apenas administradores podem aprovar justificativas' },
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
    const existingJustification = await (db as any).absenceJustification.findUnique({
      where: { id }
    })

    if (!existingJustification) {
      return NextResponse.json(
        { error: 'Justificativa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já está aprovada
    if (existingJustification.status === 'Approved') {
      return NextResponse.json(
        { error: 'Esta justificativa já está aprovada' },
        { status: 400 }
      )
    }

    // Aprovar justificativa
    const justification = await (db as any).absenceJustification.update({
      where: { id },
      data: {
        status: 'Approved'
      }
    })

    return NextResponse.json(justification)
  } catch (error) {
    console.error('Erro ao aprovar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao aprovar justificativa' },
      { status: 500 }
    )
  }
} 