import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/alerts - Listar todos os alertas (para administradores)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const alerts = await prisma.alert.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    )
  }
}

// POST /api/admin/alerts - Criar um novo alerta
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validar dados
    if (!data.title || !data.message || !data.type || !data.validFrom || !data.roleIds || data.roleIds.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }
    
    // Preparar datas
    const validFrom = new Date(data.validFrom)
    const validTo = data.validTo ? new Date(data.validTo) : null
    
    // Criar alerta
    const alert = await prisma.alert.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
        active: data.active || true,
        roleIds: data.roleIds,
        validFrom,
        validTo,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Erro ao criar alerta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar alerta' },
      { status: 500 }
    )
  }
} 