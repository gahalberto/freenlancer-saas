import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "../validateToken";
import { db } from "@/app/_lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
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

    try {
        const mashguiachCount = await db.user.count({
            where: {
                roleId: 1
            }
        });

        const storeCount = await db.stores.count();

        const eventsCount = await db.storeEvents.count();

        const pedingFreelasCount = await db.storeEvents.count({
            where: {
                isApproved: false
            }
        });

        const pedingEvents = await db.storeEvents.findMany({
            where: {
                isApproved: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                store: true
            }
        });

        const monthEvents = await db.eventsServices.findMany({
            where: {
                arriveMashguiachTime: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
            }
        });

        const monthEventsCount = await db.eventsServices.count({
            where: {
                arriveMashguiachTime: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
            }
        });

        const todayEventsCount = await db.eventsServices.count({
            where: {
                arriveMashguiachTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)), // Início do dia atual
                    lt: new Date(new Date().setHours(23, 59, 59, 999)) // Fim do dia atual
                }
            }
        });

        const todayEvents = await db.eventsServices.findMany({
            where: {
                arriveMashguiachTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)), // Início do dia atual
                    lt: new Date(new Date().setHours(23, 59, 59, 999)) // Fim do dia atual
                },
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
                arriveMashguiachTime: 'desc'
            }
        });
        
        

        const totalCount = mashguiachCount + storeCount + eventsCount;

        return res.status(200).json({
            mashguiachCount,
            storeCount,
            monthEventsCount,
            eventsCount,
            todayEventsCount,
            pedingEvents,
            monthEvents,
            todayEvents
        });
    
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
}