import { NextApiRequest, NextApiResponse } from 'next';
import { MashguiachEntrace } from '@/app/_actions/time-entries/timeIn';
import { MashguiachExit } from '@/app/_actions/time-entries/timeOut';
import { checkTodayEntrace } from '@/app/_actions/time-entries/checkTodayEntrace';
import { checkTodayExit } from '@/app/_actions/time-entries/checkTodayExit';
import { getTimesByUser } from '@/app/_actions/time-entries/getTimesByUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, type, latitude, longitude } = req.body;

      if (!userId || !type) {
        return res.status(400).json({ error: 'Usuário e tipo são obrigatórios' });
      }

      if (type !== 'ENTRADA' && type !== 'SAIDA') {
        return res.status(400).json({ error: 'Tipo deve ser ENTRADA ou SAIDA' });
      }

      const result = type === 'ENTRADA'
        ? await MashguiachEntrace(userId, latitude, longitude)
        : await MashguiachExit(userId, latitude, longitude);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Erro ao processar a requisição'
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { userId, action } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      let result;

      switch (action) {
        case 'check-entrance':
          result = await checkTodayEntrace(userId as string);
          break;
        case 'check-exit':
          result = await checkTodayExit(userId as string);
          break;
        case 'history':
          result = await getTimesByUser(userId as string);
          break;
        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Erro ao processar a requisição'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 