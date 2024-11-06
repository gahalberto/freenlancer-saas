import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

type Data = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    roleId: number;
  };
  token?: string;
};

// Função para validar o token
export async function validateToken(token: string): Promise<{ valid: boolean; decoded?: any; error?: string }> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: 'Token inválido ou expirado' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '999h' }
    );

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId
    };

    return res.status(200).json({ success: true, user: userData, token });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
