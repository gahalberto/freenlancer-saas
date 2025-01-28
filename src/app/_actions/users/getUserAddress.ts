'use server'

import { db } from '@/app/_lib/prisma'

export const findStoreAddress = async (id: string) => {
    console.log(id)
  // Busca o ID do proprietário do evento
  const storeId = await db.storeEvents.findUnique({
    where: {
      id,
    },
    select: {
      storeId: true, // Retorna apenas o ownerId
    },
  });

  if (!storeId) return;

  // Usa o ownerId para buscar o endereço da loja
  const res = await db.stores.findFirst({
    where: {
      id: storeId.storeId, // Acessa diretamente o ownerId aqui
    },
    select: {
      address_city: true,
      address_neighbor: true,
      address_number: true,
      address_zipcode: true,
      address_state: true,
      address_street: true,
    },
  });

  return res;
};
