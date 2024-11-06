"use server"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const aproveEvent = async (id: string, isApproved: boolean) => {
    const session = await getServerSession(authOptions);

    try {
        const event = await db.storeEvents.findUnique({
            where: { id },
        });

        if (!event) {
            throw new Error(`Evento com ID ${id} não encontrado.`);
        }

        const updatedEvent = await db.storeEvents.update({
            where: { id },
            data: {
                isApproved: !!isApproved,
            },
        });

        return updatedEvent;
    } catch (error) {
        console.error("Erro ao aprovar evento:", error);
        throw new Error("Não foi possível atualizar o status de aprovação do evento.");
    }
};
