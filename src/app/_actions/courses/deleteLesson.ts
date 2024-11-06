"use server"

import { db } from "@/app/_lib/prisma"

export const deleteLesson = async (id: string) => {
    return await db.lesson.delete({
        where: {id}
    })
}