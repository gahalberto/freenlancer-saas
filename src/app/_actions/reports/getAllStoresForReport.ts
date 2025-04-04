"use server"

import { db } from "@/app/_lib/prisma";

/**
 * Obtém a lista de todos os estabelecimentos para seleção no relatório
 */
export const getAllStoresForReport = async () => {
    try {
        // Buscar todos os estabelecimentos com eventos que tenham serviços freelancer
        const stores = await db.stores.findMany({
            where: {
                StoreEvents: {
                    some: {
                        EventsServices: {
                            some: {
                                // Garante que apenas serviços com mashguiach sejam incluídos
                                NOT: {
                                    mashguiachId: null
                                }
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                title: true,
                address_city: true,
                address_state: true
            },
            orderBy: {
                title: 'asc'
            }
        });

        return stores.map(store => ({
            id: store.id,
            title: store.title,
            location: `${store.address_city}-${store.address_state}`
        }));
    } catch (error) {
        console.error("Erro ao buscar estabelecimentos:", error);
        throw new Error("Falha ao carregar a lista de estabelecimentos");
    }
} 