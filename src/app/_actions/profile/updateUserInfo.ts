"use server"

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

type UpdateUserType = {
    data: Partial<User>
    userId: string
}

export const updateUserInfo = async ({data, userId}: UpdateUserType) => {
    const session = await getServerSession(authOptions);
    if(!session) return { error: "Não autorizado", status: 401 };
    
    return db.user.update({
        data,
        where:{
            id: userId
        }
    })
}