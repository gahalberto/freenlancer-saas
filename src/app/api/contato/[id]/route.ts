import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

// Atualizar um contato (marcar como lido)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Verificar se o contato existe
    const contatoExistente = await db.contact.findUnique({
      where: { id }
    })

    if (!contatoExistente) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o contato
    const contatoAtualizado = await db.contact.update({
      where: { id },
      data: body
    })

    return NextResponse.json(contatoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar contato:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar contato' },
      { status: 500 }
    )
  }
}

// Excluir um contato
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o contato existe
    const contatoExistente = await db.contact.findUnique({
      where: { id }
    })

    if (!contatoExistente) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // Excluir o contato
    await db.contact.delete({
      where: { id }
    })

    return NextResponse.json(
      { success: true, message: 'Contato excluído com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir contato:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir contato' },
      { status: 500 }
    )
  }
} 