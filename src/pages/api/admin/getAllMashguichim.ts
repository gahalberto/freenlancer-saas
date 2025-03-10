import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';
import { validateToken } from '../validateToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  // Formato esperado: "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  // Validar o token
  const { valid, decoded, error } = await validateToken(token);
  if (!valid) {
    return res.status(401).json({ error: error || 'Token inválido' });
  }


  try {
    const mashguichim = await db.user.findMany({
      where: {
        roleId: 1
      },
      orderBy: {
        name: 'asc'
      }
    }
);

    console.log(mashguichim)

    return res.status(200).json({
        mashguichim
        });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
} 