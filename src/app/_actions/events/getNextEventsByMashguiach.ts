'use server'

import { db } from '@/app/_lib/prisma'

export const getNextEventsMashguiach = async (userId: string) => {
    return await db.eventsServices.findMany({
        where: {
            mashguiachId: userId,
            arriveMashguiachTime: {
                gte: new Date()
            }
        },
        include: {
            StoreEvents: true
        }
    })
}
