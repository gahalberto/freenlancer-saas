'use server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from '@/app/_lib/prisma'

interface DecodedToken extends JwtPayload {
  userId: string
}

export const ResetPassword = async (token: string, password: string) => {
  console.log('Iniciando redefinição de senha')
  console.log(`Token recebido: ${token}`)
  console.log(`Senha recebida: ${password}`)

  const secret = process.env.JWT_SECRET || ''
  if (!secret) {
    console.error('JWT_SECRET não configurado no ambiente')
    throw new Error('A variável de ambiente JWT_SECRET não está configurada')
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
      },
    })

    console.log('Senha alterada com sucesso!')
    return { success: true, message: 'Senha alterada com sucesso' }
  } catch (err: any) {
    console.error('Erro ao redefinir senha:', err.message)
    throw new Error('Erro ao redefinir senha')
  }
}
