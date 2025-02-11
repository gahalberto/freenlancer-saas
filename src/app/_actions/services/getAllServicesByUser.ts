"use server"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getAllServicesByUser = async (mashguiachId: string) => {
    const services = await db.eventsServices.findMany({
        where: {
            mashguiachId,  // Aqui está o filtro pelo mashguiachId correto
        },
        include: {
            StoreEvents: true
        },
        orderBy: {
            arriveMashguiachTime: 'desc'
        }
    })
    
    return services
}
