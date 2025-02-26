'use server'

import { db } from '@/app/_lib/prisma'

export const finishAdminService = async (id: string, arrive: Date, end: Date) => {

  return await db.eventsServices.update({
    where: { id },
    data: {
      paymentStatus: 'Success',
        reallyMashguiachArrive: arrive,
        reallyMashguiachEndTime: end
    },
  })

}
