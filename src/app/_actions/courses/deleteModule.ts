"use server"
import { db } from "@/app/_lib/prisma"

export const deleteModule = async (id: string) => {
    return await db.module.delete({where: {id}});
}