"use server"

import { db } from "@/app/_lib/prisma"

export const DeleteUser = async (id: string) => {
    return await db.user.delete({
        where: {
            id: id
        }
    })
}