"use server"
import { db } from "@/app/_lib/prisma"

export const deleteEvent = async (id: string) => {
    return await db.eventsServices.delete({where: {id}})
}