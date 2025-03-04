import { NextApiRequest, NextApiResponse } from 'next';
import { getTimesByUserAndMonth } from '@/app/_actions/time-entries/getTimesByUserAndMonth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Obter mês e ano da query ou usar o mês e ano atual
    const currentDate = new Date();
    let month = parseInt(req.query.month as string) || currentDate.getMonth() + 1; // getMonth() retorna 0-11
    let year = parseInt(req.query.year as string) || currentDate.getFullYear();

    // Validar mês e ano
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Mês inválido. Deve estar entre 1 e 12.' });
    }

    if (year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Ano inválido. Deve estar entre 2000 e 2100.' });
    }

    // Buscar os registros de tempo do usuário para o mês e ano especificados
    const timeEntries = await getTimesByUserAndMonth(userId, month, year);

    return res.status(200).json({
      userId,
      month,
      year,
      data: timeEntries
    });
  } catch (error: any) {
    console.error('Erro ao buscar registros de tempo:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar a requisição'
    });
  }
} 