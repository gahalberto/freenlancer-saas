"use server";
import { db } from "@/app/_lib/prisma";

type ProgressProps = {
    userId: string;
    courseId: string;
    lessonId: string;
};

// Função auxiliar para verificar se o curso existe
const verifyCourseExists = async (courseId: string) => {
    const courseExists = await db.course.findUnique({
        where: { id: courseId },
    });

    if (!courseExists) {
        throw new Error("Curso não encontrado");
    }
    return courseExists;
};

// Função auxiliar para verificar se a lição existe
const verifyLessonExists = async (lessonId: string) => {
    const lessonExists = await db.lesson.findUnique({
        where: { id: lessonId },
    });

    if (!lessonExists) {
        throw new Error("Lição não encontrada");
    }
    return lessonExists;
};

export const postNewProgress = async ({ userId, courseId, lessonId }: ProgressProps) => {
    // Verifique se o curso e a lição existem
    await verifyCourseExists(courseId);
    await verifyLessonExists(lessonId);

    // Verifique se o progresso já foi registrado
    const existingProgress = await db.studentProgress.findFirst({
        where: {
            studentId: userId,
            courseId,
            lessonId,
        },
    });

    if (!existingProgress) {
        // Cria o progresso apenas se não houver um registro existente
        const newProgress = await db.studentProgress.create({
            data: {
                studentId: userId,
                courseId,
                lessonId,
                progress: 1, // Progresso inicial
            },
        });

        return newProgress;
    }

    return existingProgress; // Retorna o progresso já existente
};