"use server"

import { db } from "@/app/_lib/prisma"

export const MashguiachExit = async (userId: string, latitude?: number, longitude?: number) => {
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
            data_hora: {
                gte: inicioDoDia,   // data_hora maior ou igual ao início de hoje
                lt: inicioDeAmanha, // data_hora menor que o início de amanhã          
            },
            type: 'SAIDA',
        }
    })

    if(alreadyExists){
        throw new Error('Você já registrou uma saída hoje!');
    }
    
    return await db.timeEntries.create({
      data: {
        user_id: userId,
        store_id: store.store_id, // Certifique-se de usar o ID correto
        type: 'SAIDA',
        data_hora: new Date(),
        latitude: latitude || 999,
        longitude: longitude || 999,
      },
    });
  } catch (error: any) {
    console.error("Erro no server ao registrar entrada:", error);
    // Lança um novo erro com uma mensagem mais amigável
    throw new Error(error || "Não foi possível registrar sua entrada. Por favor, entre em contato com a administração.");
  }
}
