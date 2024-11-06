"use server"

import { db } from "../_lib/prisma"

export const getUsers = () => {
    const users = db.user.findMany({
    });
    if(users) return users;
}

