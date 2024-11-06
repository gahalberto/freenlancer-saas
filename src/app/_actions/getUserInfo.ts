"use server"

import { db } from "../_lib/prisma"

export const getUserInfo = async (userId: string) => {
    const users = await db.user.findMany({
        where: {
            id: userId
        }
    });
    if(users) return users;
}

