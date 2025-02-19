"use server"

import { db } from "@/app/_lib/prisma"

export const MashguiachEntrace = async (userId: string, latitude?: number, longitude?: number) => {
  console.log('userId', userId);
  console.log('latitude', latitude);
  console.log('longitude', longitude);
  try {
    const store = await db.fixedJobs.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        store_id: true
      }
    });
    
    if (!store) {
      throw new Error('Você não está registrado em nenhuma loja! Entre em contato com a administração.');
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const inicioDeAmanha = new Date(inicioDoDia);
    inicioDeAmanha.setDate(inicioDeAmanha.getDate() + 1);
    
    const alreadyExists = await db.timeEntries.findFirst({
        where: {
            user_id: userId,  // Verifica apenas as entradas do usuário atual
            data_hora: {
                gte: inicioDoDia,  
                lt: inicioDeAmanha,       
            },
            type: 'ENTRADA',
        }
    });

    if (alreadyExists) {
        throw new Error('Você já registrou uma entrada hoje!');
    }
    
    return await db.timeEntries.create({
      data: {
        user_id: userId,
        store_id: store.store_id, 
        type: 'ENTRADA',
        data_hora: new Date(),
        latitude: latitude ?? null,  // Usa null em vez de 999
        longitude: longitude ?? null, 
      },
    });
  } catch (error: any) {
    console.error("Erro no server ao registrar entrada:", error);
    throw new Error(error.message || "Não foi possível registrar sua entrada. Por favor, entre em contato com a administração.");
  }
}
