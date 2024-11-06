"use server"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getServicesByUser = async () => {
    const session = await getServerSession(authOptions);
    console.log(`OOOOO   MASHGUIACH ${session?.user.id}`)
    const services = await db.eventsServices.findMany({
        where: {
            mashguiachId: session?.user.id,  // Aqui está o filtro pelo mashguiachId correto
            accepted: true         // Apenas serviços aceitos
        },
        include: {
            StoreEvents: true
        }
    })
    
    return services
}
