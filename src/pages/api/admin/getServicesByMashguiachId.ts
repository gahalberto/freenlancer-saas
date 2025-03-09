import { db } from "@/app/_lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "../validateToken";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    // Verificar se o método é GET
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Método não permitido' })
    }
    
    try {
        const { mashguiachId } = req.query;

        if (!mashguiachId) {
            return res.status(400).json({ success: false, message: 'ID do mashguiach é obrigatório' });
        }

        let token = ''
        const authHeader = req.headers.authorization
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1]
        } else if (req.query.token) {
          token = req.query.token as string
        }
    
        if (!token) {
          return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' })
        }
    
        // Validar o token
        const { valid, decoded, error } = await validateToken(token)
        if (!valid) {
          return res.status(401).json({ success: false, message: error || 'Token inválido' })
        }
    

        const services = await db.eventsServices.findMany({
            where: {
                mashguiachId: mashguiachId as string
            },
            include: {
                Mashguiach: true,
                StoreEvents: true,
            },
            orderBy: {
                arriveMashguiachTime: 'desc'
            }
        });

        return res.status(200).json({ success: true, services });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    }
}