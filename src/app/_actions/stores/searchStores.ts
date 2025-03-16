'use server'

import { db } from '@/app/_lib/prisma'

export const searchStores = async (searchTerm: string) => {
  const term = searchTerm.toLowerCase()

  return await db.stores.findMany({
    where: {
      OR: [
        {
          title: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          address_city: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          address_state: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          address_neighbor: {
            contains: term,
            mode: 'insensitive',
          },
        },
        {
          storeType: {
            title: {
              contains: term,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    include: {
      storeType: true,
      Certifications: true,
    },
  })
} 