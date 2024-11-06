"use server"
import { db } from "@/app/_lib/prisma"

export const getStoresTypes = async () => {
    return await db.storesType.findMany();
}