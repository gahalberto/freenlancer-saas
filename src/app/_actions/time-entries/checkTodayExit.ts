"use server"

import { db } from "@/app/_lib/prisma"

export const checkTodayExit = async (userId: string) => {
  try {
    // Define o intervalo das últimas 2 horas
    const now = new Date();
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(now.getHours() - 2);

    // Busca se houve uma saída nas últimas 2 horas
    return await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        exit: {
          gte: twoHoursAgo,
          lt: now
        }
      },
      orderBy: {
        exit: 'desc'
      }
    });
  } catch (error: any) {
    console.error("Erro no server ao verificar saída:", error);
    throw new Error(
      error.message || 
      "Não foi possível verificar sua saída. Por favor, entre em contato com a administração."
    );
  }
};
