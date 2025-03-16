'use server'
import { db } from '@/app/_lib/prisma'

export const getStoreById = async (id: string) => {
  console.log('Buscando estabelecimento com ID:', id);
  const store = await db.stores.findUnique({
    where: { id },
  });
  console.log('Estabelecimento encontrado:', !!store);
  return store;
}
