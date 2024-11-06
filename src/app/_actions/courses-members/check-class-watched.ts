"use server"
import { db } from "@/app/_lib/prisma"

type PropsType = {
    userId: string,
    lessonId: string
}

export const checkClassWatched = async ({userId, lessonId} : PropsType) => {
    return await db.studentProgress.findFirst({
        where: {
            studentId: userId,
            lessonId
        }
    });
}
