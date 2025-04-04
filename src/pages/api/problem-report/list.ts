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

  // Método GET para listar relatórios
  if (req.method === 'GET') {
    try {
      // Verificar se o usuário é admin ou mashguiach
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
      });

      // Buscar todos os relatórios com informações do usuário
      const reports = await prisma.problemReport.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(reports);
    } catch (error) {
      console.error('Erro ao listar relatórios de problemas:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 