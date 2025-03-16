import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, assunto, mensagem } = body

    // Validação básica
    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Salvar o contato no banco de dados
    const contato = await db.contact.create({
      data: {
        nome,
        email,
        telefone,
        assunto,
        mensagem
      }
    })

    return NextResponse.json(
      { success: true, message: 'Mensagem enviada com sucesso', id: contato.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar contato:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Buscar todos os contatos ordenados por data de criação (mais recentes primeiro)
    const contatos = await db.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contatos)
  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contatos' },
      { status: 500 }
    )
  }
} 