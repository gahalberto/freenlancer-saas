import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';
import { validateToken } from '../validateToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar o token de autenticação
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

  const { service_id, user_id } = req.query;
  
  if (!service_id || !user_id) {
    return res.status(400).json({ error: 'ID da serviço e usuário são obrigatórios' });
  }

  try {
    // Busca todas as entradas do usuário no período
    const services = await db.eventsServices.update({
      where: {
        id: service_id as string
      },
      data: {
        mashguiachId: user_id as string
      }
    });

    return res.status(200).json({
        message: 'Freela aceita com sucesso'
    });
  } catch (error) {
    console.error('Erro ao aceitar freela:', error);
    return res.status(500).json({ error: 'Erro ao aceitar freela' });
  }
} 