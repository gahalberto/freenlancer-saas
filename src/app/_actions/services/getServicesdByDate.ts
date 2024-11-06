"use server"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getServicesByDate = async (date: Date) => {
  // Obtenha o início e o fim do dia para garantir que apenas o dia seja considerado
  const session = await getServerSession(authOptions);

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0) // Define o início do dia (00:00:00.000)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999) // Define o fim do dia (23:59:59.999)

  return await db.eventsServices.findMany({
    where: {
        mashguiachId: session?.user.id,
      arriveMashguiachTime: {
        gte: startOfDay, // Maior ou igual ao início do dia
        lt: endOfDay     // Menor que o fim do dia
      }
    },
    include: {
        StoreEvents: true
    }
  })
}
