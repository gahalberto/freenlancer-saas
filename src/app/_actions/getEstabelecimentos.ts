"use server"

import { db } from "../_lib/prisma"

export const getEstabelecimentos = () => {
    const users = db.user.findMany({
        where: {
            roleId: 3
        }
    });
    if(users) return users;
}

