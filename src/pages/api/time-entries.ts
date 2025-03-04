import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, type, latitude, longitude } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Usuário é obrigatório' });
      }

      if (!type || !['ENTRADA', 'SAIDA', 'ALMOCO_ENTRADA', 'ALMOCO_SAIDA'].includes(type)) {
        return res.status(400).json({ 
          error: 'Tipo deve ser ENTRADA, SAIDA, ALMOCO_ENTRADA ou ALMOCO_SAIDA' 
        });
      }

      // Verificar se o usuário está vinculado a alguma loja
      const store = await db.fixedJobs.findFirst({
        where: { user_id: userId },
        select: { store_id: true }
      });

      if (!store) {
        return res.status(400).json({
          error: 'Você não está registrado em nenhuma loja! Entre em contato com a administração.'
        });
      }

      // Definir o intervalo das últimas 24 horas
      const now = new Date();
      const oneDayAgo = new Date(now);
      oneDayAgo.setHours(now.getHours() - 24);

      // Buscar o registro mais recente do usuário
      const lastEntry = await db.timeEntries.findFirst({
        where: {
          user_id: userId,
          entrace: {
            gte: oneDayAgo
          }
        },
        orderBy: {
          entrace: 'desc'
        }
      });

      switch (type) {
        case 'ENTRADA':
          // Verificar se já existe uma entrada sem saída nas últimas 24 horas
          if (lastEntry && !lastEntry.exit) {
            return res.status(400).json({
              error: 'Você já tem uma entrada registrada sem saída'
            });
          }

          // Criar novo registro
          const newEntry = await db.timeEntries.create({
            data: {
              user_id: userId,
              store_id: store.store_id,
              entrace: now,
              latitude,
              longitude
            }
          });
          return res.status(200).json(newEntry);

        case 'SAIDA':
          // Verificar se existe uma entrada sem saída
          if (!lastEntry || lastEntry.exit) {
            return res.status(400).json({
              error: 'Não há entrada registrada sem saída'
            });
          }

          // Atualizar o registro com a saída
          const exitEntry = await db.timeEntries.update({
            where: { id: lastEntry.id },
            data: { exit: now }
          });
          return res.status(200).json(exitEntry);

        case 'ALMOCO_ENTRADA':
          // Verificar se existe uma entrada sem saída e sem entrada de almoço
          if (!lastEntry || lastEntry.exit || lastEntry.lunchEntrace) {
            return res.status(400).json({
              error: 'Não é possível registrar entrada de almoço'
            });
          }

          // Atualizar o registro com a entrada do almoço
          const lunchEntry = await db.timeEntries.update({
            where: { id: lastEntry.id },
            data: { lunchEntrace: now }
          });
          return res.status(200).json(lunchEntry);

        case 'ALMOCO_SAIDA':
          // Verificar se existe entrada de almoço sem saída
          if (!lastEntry || !lastEntry.lunchEntrace || lastEntry.lunchExit) {
            return res.status(400).json({
              error: 'Não há entrada de almoço registrada sem saída'
            });
          }

          // Atualizar o registro com a saída do almoço
          const lunchExit = await db.timeEntries.update({
            where: { id: lastEntry.id },
            data: { lunchExit: now }
          });
          return res.status(200).json(lunchExit);
      }
    } catch (error: any) {
      console.error('Erro ao processar registro:', error);
      return res.status(500).json({
        error: error.message || 'Erro ao processar a requisição'
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      // Buscar o registro mais recente do usuário
      const lastEntry = await db.timeEntries.findFirst({
        where: {
          user_id: userId as string
        },
        orderBy: {
          entrace: 'desc'
        }
      });

      return res.status(200).json({
        lastEntry,
        status: {
          hasOpenEntry: lastEntry && !lastEntry.exit,
          isOnLunch: lastEntry && lastEntry.lunchEntrace && !lastEntry.lunchExit
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Erro ao processar a requisição'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 