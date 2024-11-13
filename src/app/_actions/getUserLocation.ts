'use server'

import { db } from '../_lib/prisma'

export const GetUserLocation = async (id: string) => {
  return db.user.findFirst({
    where: { id },
    select: {
      address_lat: true,
      address_lng: true,
    },
  })
}
