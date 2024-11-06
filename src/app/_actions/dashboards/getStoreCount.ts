"use server"

import { db } from "@/app/_lib/prisma"

export const getStoreCount = async () => {
    return await db.user.count({
        where: {
            roleId: 3
        }
    })
}