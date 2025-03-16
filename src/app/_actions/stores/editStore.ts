'use server'

import { db } from '@/app/_lib/prisma'
import { Stores } from '@prisma/client'

export const editStore = async (data: Omit<Stores, 'userId'> & { storeTypeId: string }) => {
  console.log('Atualizando estabelecimento com ID:', data.id);
  const { storeTypeId, ...rest } = data

  try {
    const updatedStore = await db.stores.update({
      where: { id: data.id },
      data: {
        ...rest,
        storeType: {
          connect: {
            id: storeTypeId,
          },
        },
      },
    });
    console.log('Estabelecimento atualizado com sucesso:', updatedStore.id);
    return updatedStore;
  } catch (error) {
    console.error('Erro ao atualizar estabelecimento:', error);
    throw error;
  }
}
