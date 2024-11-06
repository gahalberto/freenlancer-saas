"use server"

import { db } from "@/app/_lib/prisma"

export const getAllEvents = async () => {
    return await db.storeEvents.findMany();
}