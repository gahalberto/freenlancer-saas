"use server"

import { db } from "@/app/_lib/prisma"

export const DesativarAction = async (id: string) => {
    return await db.user.update({
        where: {
            id: id
        },
        data: {
            deleteAt: new Date()
        }
    })
}