"use server"

import { db } from "../_lib/prisma"

export const getAllMashguichim = async () => {
    return await db.user.findMany({where: {roleId: 1}})
}