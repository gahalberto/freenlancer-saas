"use server"

import { db } from "@/app/_lib/prisma"

export const checkTodayEntrace = async (userId: string) => {
  try {
    // Verifica se o usuário está vinculado a alguma loja
    const store = await db.fixedJobs.findFirst({
      where: { 
        user_id: userId,
        deletedAt: null
      },
      select: { store_id: true }
    });
    
    if (!store) {
      throw new Error('Você não está registrado em nenhuma loja! Entre em contato com a administração.');
    }

    // Define o intervalo das últimas 2 horas
    const now = new Date();
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(now.getHours() - 2);

    // Busca se houve uma entrada nas últimas 2 horas
    return await db.timeEntries.findFirst({
      where: {
        user_id: userId,
        entrace: {
          gte: twoHoursAgo,
          lt: now
        },
        exit: null // Garante que é uma entrada sem saída registrada
      },
      orderBy: {
        entrace: 'desc'
      }
    });
  } catch (error: any) {
    console.error("Erro no server ao verificar entrada:", error);
    throw new Error(
      error.message || 
      "Não foi possível verificar sua entrada. Por favor, entre em contato com a administração."
    );
  }
};
