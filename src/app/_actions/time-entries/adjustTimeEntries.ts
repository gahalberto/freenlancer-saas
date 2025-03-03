"use server"

import { db } from "@/app/_lib/prisma"

// Função para ajustar um horário para cima (próxima hora)
const adjustUp = (date: Date): Date => {
  const newDate = new Date(date);
  const minutes = date.getMinutes();
  
  if (minutes > 0) {
    newDate.setHours(date.getHours() + 1, 0, 0, 0);
  }
  
  return newDate;
}

// Função para ajustar um horário para baixo (hora atual)
const adjustDown = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(date.getHours(), 0, 0, 0);
  return newDate;
}

// Ajusta um registro específico
export const adjustSingleTimeEntry = async (entryId: number, adjustType: 'up' | 'down') => {
  try {
    const entry = await db.timeEntries.findUnique({
      where: { id: entryId }
    });

    if (!entry) {
      throw new Error("Registro não encontrado");
    }

    const adjustedDate = adjustType === 'up' 
      ? adjustUp(entry.data_hora)
      : adjustDown(entry.data_hora);

    const updatedEntry = await db.timeEntries.update({
      where: { id: entryId },
      data: { data_hora: adjustedDate }
    });

    return updatedEntry;
  } catch (error: any) {
    console.error("Erro ao ajustar registro:", error);
    throw new Error(error.message || "Erro ao ajustar o registro");
  }
}

// Ajusta todos os registros de um usuário em um mês específico
export const adjustAllTimeEntries = async (userId: string, month: number, year: number, adjustType: 'up' | 'down') => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await db.timeEntries.findMany({
      where: {
        user_id: userId,
        data_hora: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const updates = entries.map(entry => 
      db.timeEntries.update({
        where: { id: entry.id },
        data: { 
          data_hora: adjustType === 'up' 
            ? adjustUp(entry.data_hora)
            : adjustDown(entry.data_hora)
        }
      })
    );

    await Promise.all(updates);

    return true;
  } catch (error: any) {
    console.error("Erro ao ajustar registros:", error);
    throw new Error(error.message || "Erro ao ajustar os registros");
  }
} 