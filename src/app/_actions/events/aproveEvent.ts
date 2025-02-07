"use server"

import { db } from "@/app/_lib/prisma"

export const aproveEvent = async (id: string, isApproved: boolean) => {
    console.log("Recebido:", id, isApproved);

    try {
        const updatedEvent = await db.storeEvents.update({
            where: { id },
            data: { isApproved: !isApproved },
        });

        console.log("Atualizado:", updatedEvent);

        return updatedEvent;
    } catch (error) {
        console.error("Erro ao aprovar evento:", error);
        throw new Error("Não foi possível atualizar o status de aprovação do evento.");
    }
};
