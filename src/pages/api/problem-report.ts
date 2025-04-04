import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db as prisma } from '@/app/_lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Verificar se o usuário está autenticado
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Método POST para criar um novo relatório
  if (req.method === 'POST') {
    try {
      const { userId, title, description, url } = req.body;

      // Verificar se o ID do usuário na sessão corresponde ao ID enviado
      if (session.user.id !== userId) {
        return res.status(403).json({ error: 'Usuário não autorizado' });
      }

      // Criar o relatório
      const report = await prisma.problemReport.create({
        data: {
          userId,
          title,
          description,
          url,
          status: 'PENDING',
        },
      });

      return res.status(201).json(report);
    } catch (error) {
      console.error('Erro ao criar relatório de problema:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 