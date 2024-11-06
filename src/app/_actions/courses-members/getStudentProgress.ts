"use server"
import { db } from "@/app/_lib/prisma"

type StudentProgressProps = {
    userId: string,
    courseId: string
}

export const getStudentProgress = async ({ userId, courseId }: StudentProgressProps) => {
    // Encontra o progresso do aluno (lições que ele completou)
    const progress = await db.studentProgress.findMany({
        where: {
            studentId: userId,
            courseId,
        },
    });

    // Encontra todas as lições do curso
    const lessons = await db.lesson.findMany({
        where: { courseId },
    });

    const completedLessons = progress.length; // Número de lições completadas
    const totalLessons = lessons.length; // Total de lições no curso

    if (totalLessons === 0) return 0; // Evita divisão por zero

    // Calcula o progresso percentual
    const averageProgress = (completedLessons / totalLessons) * 100;

    return averageProgress;
};
