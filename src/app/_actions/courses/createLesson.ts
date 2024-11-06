"use server"

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Lesson } from "@prisma/client";
import { getServerSession } from "next-auth";

export const createLesson = async (lessonData: { courseId: string, moduleId: string; title: string; contentUrl?: string }) => {
    const session = await getServerSession(authOptions);
    if(!session) return { error: "Não autorizado", status: 401 };
    return await db.lesson.create({
        data: lessonData
    })
}