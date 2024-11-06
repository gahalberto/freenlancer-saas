"use server"

import { db } from "@/app/_lib/prisma"

export const getEventInfo = async (id: string) => {
    return await db.storeEvents.findUnique({
        where: {id},
        include: {
            eventOwner: true
        }
    },
)
}