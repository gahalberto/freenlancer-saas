"use server"

import { getServerSession } from "next-auth";
import { db } from "../_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const getCreditsByUser = async () => {
    const session = await getServerSession(authOptions);
    return await db.user.findFirst({
        where: {
            id: session?.user.id
        },
        select: {
            credits: true
        }
    })
}