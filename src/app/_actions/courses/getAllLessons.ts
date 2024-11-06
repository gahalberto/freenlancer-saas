"use server"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getAllLessons = async (moduleId: string) => {
  const session = await getServerSession(authOptions);
  // Busca todas as aulas do módulo
  const classes = await db.lesson.findMany({
    where: { moduleId },
    orderBy: { createdAt: 'asc' } // ou 'desc' para ordem descendente
  });

  // Para cada aula, verifica se o aluno já assistiu
  const classesWithProgress = await Promise.all(classes.map(async (lesson) => {
    const progress = await db.studentProgress.findFirst({
      where: {
        lessonId: lesson.id,
        studentId: session?.user.id, // Verifica o progresso por aluno
      }
    });

    return {
      ...lesson,
      watched: !!progress // Adiciona um campo 'watched' indicando se foi assistido ou não
    };
  }));

  return classesWithProgress;
}
