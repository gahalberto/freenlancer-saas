"use server"

import { db } from "@/app/_lib/prisma"

export const getEventsToAproveCount = async () => {
    const today = new Date();
    try {
        const count = await db.storeEvents.count({ 
            where: { 
                isApproved: false, 
                deletedAt: null,
                date: {
                    gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
                }
            } 
        });
        return count;
    } catch (error) {
        console.error("Erro ao contar eventos não aprovados:", error);
        throw new Error("Não foi possível contar os eventos não aprovados.");
    }
};
