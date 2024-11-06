"use server"

import { db } from "@/app/_lib/prisma"

export const getEventServices = async (id: string) => {    
    return await db.eventsServices.findMany({
        where: {
            StoreEventsId: id, // Comparar diretamente com o ID do evento
        },
    });
};
