"use server"

import { db } from "@/app/_lib/prisma"

export const getEventsToAproveCount = async () => {
    try {
        const count = await db.storeEvents.count({ 
            where: { 
                isApproved: false 
            } 
        });
        return count;
    } catch (error) {
        console.error("Erro ao contar eventos não aprovados:", error);
        throw new Error("Não foi possível contar os eventos não aprovados.");
    }
};
