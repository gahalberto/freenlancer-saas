import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "../validateToken";
import { db } from "@/app/_lib/prisma";

type ResponseData = {
  success: boolean;
  message?: string;
  events?: any[];
  totalCount?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Verificar o token de autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' });
    }

    // Formato esperado: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Formato de token inválido' });
    }

    // Validar o token
    const { valid, decoded, error } = await validateToken(token);
    if (!valid) {
      return res.status(401).json({ success: false, message: error || 'Token inválido' });
    }

    // Obter mês e ano dos parâmetros da requisição
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    // Validar os parâmetros
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Mês inválido. Deve ser um número entre 1 e 12.' });
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Ano inválido. Deve ser um número entre 2000 e 2100.' });
    }

    // Calcular o primeiro e último dia do mês
    const startDate = new Date(year, month - 1, 1); // Mês em JavaScript é 0-indexed
    const endDate = new Date(year, month, 0); // Último dia do mês
    endDate.setHours(23, 59, 59, 999); // Definir para o final do dia

    // Buscar eventos do mês especificado
    const events = await db.eventsServices.findMany({
      where: {
        arriveMashguiachTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        Mashguiach: true,
        StoreEvents: {
          include: {
            store: true
          }
        }
      },
      orderBy: {
        arriveMashguiachTime: 'asc'
      }
    });

    // Contar o total de eventos
    const totalCount = await db.eventsServices.count({
      where: {
        arriveMashguiachTime: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Retornar os resultados
    return res.status(200).json({
      success: true,
      events,
      totalCount
    });

  } catch (error) {
    console.error('Erro ao buscar eventos por mês/ano:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar eventos' });
  }
}
