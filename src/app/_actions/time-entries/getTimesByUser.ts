"use server"

import { db } from "@/app/_lib/prisma"

export const getTimesByUser = async (userId: string) => {
    return await db.timeEntries.findMany({
        where: {
            user_id: userId
        },
        include: {
            user: true,
            stores: true
        },
        orderBy: {
            entrace: 'desc'
        }
    })
}