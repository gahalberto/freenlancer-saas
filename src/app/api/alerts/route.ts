import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/alerts - Obtém alertas ativos para o usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const roleId = session.user.roleId
    
    // Buscar alertas ativos para o papel do usuário e que ainda não foram dispensados pelo usuário
    const today = new Date()
    
    // Buscar alertas com validTo maior que hoje OU com validTo nulo (sem data de expiração)
    const alerts = await prisma.alert.findMany({
      where: {
        active: true,
        validFrom: { lte: today },
        OR: [
          { validTo: { gte: today } },
          { validTo: null }
        ],
        roleIds: { has: roleId },
        // Excluir alertas que já foram dispensados pelo usuário
        NOT: {
          dismissals: {
            some: {
              userId
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
  }
}

// POST /api/alerts - Marcar um alerta como lido/dispensado
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('Session user:', session.user);
    
    // Verificar se o ID do usuário está disponível
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const data = await request.json()
    const { alertId } = data
    
    if (!alertId) {
      return NextResponse.json({ error: 'ID do alerta é obrigatório' }, { status: 400 })
    }
    
    // Verificar se o alerta existe
    const alert = await prisma.alert.findUnique({ 
      where: { id: alertId } 
    })
    
    if (!alert) {
      return NextResponse.json({ error: 'Alerta não encontrado' }, { status: 404 })
    }
    
    console.log('Criando dismissal para alertId:', alertId, 'userId:', userId);
    
    // Registrar que o usuário dispensou o alerta
    const dismissal = await prisma.alertDismissal.create({
      data: {
        alertId,
        userId,
      }
    })
    
    return NextResponse.json(dismissal)
  } catch (error) {
    console.error('Erro ao marcar alerta como lido:', error)
    return NextResponse.json({ 
      error: 'Erro ao marcar alerta como lido',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 