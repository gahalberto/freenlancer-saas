'use server'
import { db } from '@/app/_lib/prisma'

export const deleteEventById = async (id: string) => {
  try {
    // Verificar se o evento existe antes de tentar atualizá-lo
    const eventExists = await db.storeEvents.findUnique({
      where: { id }
    });

    if (!eventExists) {
      throw new Error("Evento não encontrado");
    }

    return await db.storeEvents.update({ 
      where: { id }, 
      data: { deletedAt: new Date() } 
    });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw error;
  }
}
