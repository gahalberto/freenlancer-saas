'use server'

import { db } from '@/app/_lib/prisma'

export const finishAdminService = async (id: string, paymentDate: Date) => {
  console.log(id, paymentDate)
  return await db.eventsServices.update({
    where: { id },
    data: {
      paymentStatus: 'Success',
        paymentDate,
    },
  })

}
