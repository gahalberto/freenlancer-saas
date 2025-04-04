import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db as prisma } from '@/app/_lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  // Verificar se o usuário está autenticado
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Verificar se o ID foi fornecido
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Verificar se o usuário é admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  });

  if (!user || user.role.name !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Método PUT para atualizar status
  if (req.method === 'PUT') {
    try {
      const { status, response } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status não fornecido' });
      }

      // Atualizar relatório
      const updatedReport = await prisma.problemReport.update({
        where: { id },
        data: { 
          status,
          ...(response !== undefined && { response }),
        },
      });

      return res.status(200).json(updatedReport);
    } catch (error) {
      console.error('Erro ao atualizar relatório de problema:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Método DELETE para excluir relatório
  if (req.method === 'DELETE') {
    try {
      // Excluir relatório
      await prisma.problemReport.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Relatório excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir relatório de problema:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 