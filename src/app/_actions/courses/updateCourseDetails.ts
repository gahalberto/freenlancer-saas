"use server"

import { db } from "@/app/_lib/prisma";
import { Course } from "@prisma/client";

interface courseProps {
    data: Partial<Course>,
    courseId: string
}

export const updateCourseDetails = async ({data, courseId}: courseProps) => {
        try {
        await db.course.update({
            where: {
                id: courseId
            },
            data
        })

        return true;
    } catch (error) {
        throw error;
    }
}