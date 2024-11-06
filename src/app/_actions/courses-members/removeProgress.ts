"use server";
import { db } from "@/app/_lib/prisma";

type ProgressProps = {
    userId: string;
    courseId: string;
    lessonId: string;
};


export const removeProgress = async ({ userId, lessonId }: ProgressProps) => {

        const removing = await db.studentProgress.deleteMany({
            where: {
                studentId: userId,
                lessonId,
            },
        });

        return removing;
};