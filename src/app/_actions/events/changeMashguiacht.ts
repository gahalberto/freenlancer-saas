'use server'

import { db } from '@/app/_lib/prisma'
import { EventsAdresses } from '@prisma/client'

type Props = {
        serviceId: string,
        mashguiachSelected: string
}

export const ChangeMashguiach = async (serviceId: string, mashguiachSelected: string) => {
  return await db.eventsServices.update({
    data: {mashguiachId: mashguiachSelected},
    where: {id: serviceId}
  })
}
