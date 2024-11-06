"use server"

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

export const CreateEvent = async (data: Omit<Prisma.StoreEventsCreateInput, 'id'>) => {
    console.log("Dados Recebidos no Backend:", data); // Log dos dados recebidos no backend
    const session = await getServerSession(authOptions);

    const event = await db.storeEvents.create({
        data: {
            ...data,
            eventOwner: {
                connect: { id: session?.user.id }, // Certifique-se de que session.user.id está correto
              },
          
        },

    });

    if (event) {
        return event.id;
    }

    return null; // Caso o evento não seja criado por algum motivo
};
