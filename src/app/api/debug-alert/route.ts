import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/debug-alert - Criar um alerta de teste para depuração
export async function POST() {
  try {
    // Criar um alerta de teste que expira em 7 dias
    const validFrom = new Date()
    const validTo = new Date()
    validTo.setDate(validTo.getDate() + 7)
    
    // Verificar se já existe um alerta de teste
    const existingAlert = await prisma.alert.findFirst({
      where: {
        title: 'Alerta de Teste',
      },
    })
    
    if (existingAlert) {
      // Atualizar o alerta existente para garantir que esteja ativo
      const updatedAlert = await prisma.alert.update({
        where: { id: existingAlert.id },
        data: {
          active: true,
          validFrom,
          validTo,
          message: 'Este é um alerta de teste atualizado em ' + new Date().toLocaleString() + '. Se você está vendo esta mensagem, o sistema de alertas está funcionando corretamente.',
          // Garantir que seja visível para todos os papéis
          roleIds: [1, 2, 3, 4],
        },
      })
      
      return NextResponse.json({
        success: true,
        message: 'Alerta de teste atualizado',
        alert: updatedAlert,
      })
    }
    
    // Criar um novo alerta de teste
    const alert = await prisma.alert.create({
      data: {
        title: 'Alerta de Teste',
        message: 'Este é um alerta de teste criado em ' + new Date().toLocaleString() + '. Se você está vendo esta mensagem, o sistema de alertas está funcionando corretamente.',
        type: 'primary',
        active: true,
        validFrom,
        validTo,
        // Garantir que seja visível para todos os papéis
        roleIds: [1, 2, 3, 4],
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Alerta de teste criado',
      alert,
    })
  } catch (error) {
    console.error('Erro ao criar alerta de teste:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar alerta de teste',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET /api/debug-alert - Obter o status do alerta de teste
export async function GET() {
  try {
    const alert = await prisma.alert.findFirst({
      where: {
        title: 'Alerta de Teste',
      },
      include: {
        _count: {
          select: {
            dismissals: true,
          },
        },
      },
    })
    
    if (!alert) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum alerta de teste encontrado',
      })
    }
    
    return NextResponse.json({
      success: true,
      alert,
      dismissalsCount: alert._count.dismissals,
    })
  } catch (error) {
    console.error('Erro ao obter alerta de teste:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter alerta de teste',
    }, { status: 500 })
  }
} 