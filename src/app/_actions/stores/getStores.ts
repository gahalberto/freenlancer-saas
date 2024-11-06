"use server"

import { db } from "@/app/_lib/prisma"

export const getStores = async (userId : string) => {
    return await db.stores.findMany({where: {userId}})
}