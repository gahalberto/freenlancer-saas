"use server"

import { db } from "@/app/_lib/prisma"

export const finishService = async (id: string, amount: number) => {
    // Use findUnique ou findFirst ao invés de findMany
    const serviceInfo = await db.eventsServices.findUnique({
        where: { id },
        include: {
            StoreEvents: true // Inclui os dados do evento da loja
        }
    });
    
    if (!serviceInfo) {
        throw new Error(`Serviço com ID ${id} não encontrado.`);
    }

    // Atualiza o status do pagamento para 'Success'
    const service = await db.eventsServices.update({
        where: { id },
        data: {
            paymentStatus: 'Success'
        }
    });

    await db.user.update({
        where: {
            id: serviceInfo.StoreEvents.ownerId as string,
        },
        data: {
            credits: {
                decrement: amount
            }
        }
    });
    
    // Incrementa os créditos do mashguiach
    await db.user.update({
        where: {
            id: service.mashguiachId as string,
        },
        data: {
            credits: {
                increment: amount
            }
        }
    });

    // Cria uma notificação com a mensagem correta
    await db.notification.create({
        data: {
            message: `Chegou R$ ${amount} na sua carteira, do seu trabalho no evento ${serviceInfo.StoreEvents.title} localizado em ${serviceInfo.StoreEvents.address}.`,
            userId: service.mashguiachId as string, // Especifique o mashguiach que receberá a notificação,
            icon: 'cilMoney',
            redirectUrl: `/services/recibos/${serviceInfo}`
        }
    });
}
