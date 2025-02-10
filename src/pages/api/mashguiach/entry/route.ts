// pages/api/entry.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, storeId, latitude, longitude } = req.body;

    try {
      const entryTime = await prisma.timeEntries.create({
        data: {
          user_id: userId,       // Certifique-se de validar que não sejam undefined
          store_id: storeId,
          type: 'ENTRADA',
          data_hora: new Date(),
          latitude: latitude,
          longitude: longitude,
        },
      });

      res.status(200).json(entryTime);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar o registro de ponto.' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}
