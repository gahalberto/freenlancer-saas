"use server"

import { db } from "@/app/_lib/prisma"

export const getServicesCount = async (id: string) => {
    return await db.eventsServices.count({
        where: {
            StoreEventsId: id,
            mashguiachId: null
        },
    })
}