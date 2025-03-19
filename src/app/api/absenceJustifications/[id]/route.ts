import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

// Obter uma justificativa específica
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

    const justification = await (db as any).absenceJustification.findUnique({
      where: { id },
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
      }
    })

    if (!justification) {
      return NextResponse.json(
        { error: 'Justificativa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissão - apenas o próprio usuário ou admin pode ver
    if (
      justification.user_id !== session.user.id &&
      session.user.roleId !== 3 &&
      session.user.roleId !== 4
    ) {
      return NextResponse.json(
        { error: 'Não autorizado a visualizar esta justificativa' },
        { status: 403 }
      )
    }

    return NextResponse.json(justification)
  } catch (error) {
    console.error('Erro ao buscar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar justificativa' },
      { status: 500 }
    )
  }
}

// Atualizar uma justificativa
export async function PUT(
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

    const data = await req.json()

    // Validar dados
    if (!data.reason) {
      return NextResponse.json(
        { error: 'Campo obrigatório (reason) não preenchido' },
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

    // Verificar permissão - apenas o próprio usuário ou admin pode editar
    // Usuários normais só podem editar se estiver pendente
    if (
      (existingJustification.user_id !== session.user.id ||
        existingJustification.status !== 'Pending') &&
      session.user.roleId !== 3 &&
      session.user.roleId !== 4
    ) {
      return NextResponse.json(
        { error: 'Não autorizado a editar esta justificativa' },
        { status: 403 }
      )
    }

    // Atualizar justificativa
    const justification = await (db as any).absenceJustification.update({
      where: { id },
      data: {
        reason: data.reason,
        attachmentUrl: data.attachmentUrl || existingJustification.attachmentUrl,
        ...(session.user.roleId === 3 || session.user.roleId === 4
          ? { status: data.status || existingJustification.status }
          : {})
      }
    })

    return NextResponse.json(justification)
  } catch (error) {
    console.error('Erro ao atualizar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar justificativa' },
      { status: 500 }
    )
  }
}

// Deletar uma justificativa
export async function DELETE(
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

    // Verificar permissão - apenas o próprio usuário (se pendente) ou admin pode deletar
    if (
      (existingJustification.user_id !== session.user.id ||
        existingJustification.status !== 'Pending') &&
      session.user.roleId !== 3 &&
      session.user.roleId !== 4
    ) {
      return NextResponse.json(
        { error: 'Não autorizado a deletar esta justificativa' },
        { status: 403 }
      )
    }

    // Deletar justificativa
    await (db as any).absenceJustification.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Justificativa removida com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao deletar justificativa:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar justificativa' },
      { status: 500 }
    )
  }
} 