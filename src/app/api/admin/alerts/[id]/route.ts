import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/alerts/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    
    const alert = await prisma.alert.findUnique({
      where: { id },
    })
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Erro ao buscar alerta:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar alerta' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/alerts/[id] - Atualizar um alerta
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const data = await request.json()
    
    // Verificar se o alerta existe
    const existingAlert = await prisma.alert.findUnique({
      where: { id },
    })
    
    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }
    
    // Atualizar alerta
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data,
    })

    return NextResponse.json(updatedAlert)
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar alerta' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/alerts/[id] - Excluir um alerta
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    
    // Verificar se o alerta existe
    const existingAlert = await prisma.alert.findUnique({
      where: { id },
    })
    
    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }
    
    // Excluir alerta
    await prisma.alert.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir alerta:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir alerta' },
      { status: 500 }
    )
  }
} 