"use server";

import { db } from "@/app/_lib/prisma";
import { Lesson } from "@prisma/client";

interface LessonProps {
    data: {
        title: string;
        contentUrl: string | null;
    };
    lessonId: string;
    textContent: string;
}

export const updateLessonDetails = async ({ data, textContent, lessonId }: LessonProps) => {
    try {
        await db.lesson.update({
            where: {
                id: lessonId,
            },
            data: {
                ...data,
                textContent, // Adiciona o campo de conteúdo atualizado
            },
        });

        return true;
    } catch (error) {
        throw error;
    }
};
