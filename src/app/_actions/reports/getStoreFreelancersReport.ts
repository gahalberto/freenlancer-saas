"use server"

import { db } from "@/app/_lib/prisma";
import { Stores, StoreEvents, EventsServices, User } from "@prisma/client";

type StoreWithRelations = Stores & {
  StoreEvents?: (StoreEvents & {
    EventsServices: (EventsServices & {
      Mashguiach?: User | null
    })[]
  })[];
};

/**
 * Obtém dados para o relatório de freelancers por estabelecimentos
 * Mostra todos os estabelecimentos que têm eventos com freelancers em um período
 * @param startDate Data inicial do período
 * @param endDate Data final do período
 * @param storeId ID do estabelecimento para filtrar (opcional)
 */
export const getStoreFreelancersReport = async (
    startDate: Date,
    endDate: Date,
    storeId?: string
) => {
    try {
        // Ajustar final do dia para a data final
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        // Montar a condição where base
        const whereCondition: any = {
            StoreEvents: {
                some: {
                    AND: [
                        {
                            EventsServices: {
                                some: {
                                    arriveMashguiachTime: {
                                        gte: startDate,
                                        lte: adjustedEndDate
                                    },
                                    NOT: {
                                        mashguiachId: null
                                    }
                                }
                            }
                        },
                        {
                            deletedAt: null,
                            isApproved: true
                        }
                    ]
                }
            }
        };
        
        // Se foi fornecido um ID de estabelecimento, adicionar ao filtro
        if (storeId) {
            whereCondition.id = storeId;
        }

        // Buscar estabelecimentos com serviços no período
        const stores = await db.stores.findMany({
            where: whereCondition,
            include: {
                StoreEvents: {
                    where: {
                        AND: [
                            {
                                EventsServices: {
                                    some: {
                                        arriveMashguiachTime: {
                                            gte: startDate,
                                            lte: adjustedEndDate
                                        },
                                        NOT: {
                                            mashguiachId: null
                                        }
                                    }
                                }
                            },
                            {
                                deletedAt: null,
                                isApproved: true
                            }
                        ]
                    },
                    include: {
                        EventsServices: {
                            where: {
                                arriveMashguiachTime: {
                                    gte: startDate,
                                    lte: adjustedEndDate
                                },
                                NOT: {
                                    mashguiachId: null
                                }
                            },
                            include: {
                                Mashguiach: {
                                    select: {
                                        id: true,
                                        name: true,
                                        phone: true,
                                        email: true,
                                        pixKey: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }) as StoreWithRelations[];

        // Processar dados dos estabelecimentos e serviços
        const storeReports = stores.map(store => {
            // Calcular totais por estabelecimento
            let totalServices = 0;
            let totalValue = 0;
            let totalTransport = 0;
            let totalDayValue = 0;
            let totalNightValue = 0;
            let totalDayHours = 0;
            let totalNightHours = 0;
            const freelancers = new Map();

            // Processar eventos e serviços
            store.StoreEvents?.forEach((event) => {
                event.EventsServices.forEach((service) => {
                    totalServices++;
                    
                    // Obter os valores de hora diurna e noturna do serviço
                    const dayHourValue = service.dayHourValue || 50; // Valor padrão caso não exista
                    const nightHourValue = service.nightHourValue || 75; // Valor padrão caso não exista
                    const transportValue = service.transport_price || 0;
                    
                    // Calcular o valor total do serviço com base nos horários
                    let serviceValue = 0;
                    let dayHours = 0;
                    let nightHours = 0;
                    let dayValue = 0;
                    let nightValue = 0;
                    
                    // Sempre calcular as horas diurnas e noturnas, mesmo para serviços com preço fixo
                    const rawStartTime = service.arriveMashguiachTime;
                    const rawEndTime = service.endMashguiachTime;
                    
                    // Converter para Date, garantindo que são objetos válidos
                    const startTime = new Date(rawStartTime);
                    const endTime = new Date(rawEndTime);
                    
                    console.log("Dados do serviço:", {
                        id: service.id,
                        rawStartTime,
                        rawEndTime,
                        startTimeIsValid: !isNaN(startTime.getTime()),
                        endTimeIsValid: !isNaN(endTime.getTime())
                    });
                    
                    // Calcular horas diurnas e noturnas
                    const hours = calculateDayAndNightHours(startTime, endTime);
                    dayHours = hours.dayHours;
                    nightHours = hours.nightHours;
                    

                        // Caso contrário, calcular valores com base nas horas e tarifas
                        dayValue = dayHours * dayHourValue;
                        nightValue = nightHours * nightHourValue;
                        
                        // Valor total do serviço é a soma dos valores diurno e noturno
                        serviceValue = dayValue + nightValue;

                        if(serviceValue < 250){
                            serviceValue = 250;
                        }
                    
                    
                    // Acumular totais
                    totalValue += serviceValue;
                    if(totalValue < 250){
                        totalValue = 250;
                    }
                    totalTransport += transportValue;
                    totalDayValue += dayValue;
                    totalNightValue += nightValue;
                    totalDayHours += dayHours;
                    totalNightHours += nightHours;

                    // Registrar freelancer e seus serviços
                    if (service.Mashguiach) {
                        const mashguiachId = service.Mashguiach.id;
                        if (!freelancers.has(mashguiachId)) {
                            freelancers.set(mashguiachId, {
                                ...service.Mashguiach,
                                services: [],
                                totalServices: 0,
                                totalValue: 0,
                                totalTransport: 0,
                                totalAmount: 0,
                                totalDayHours: 0,
                                totalNightHours: 0,
                                totalDayValue: 0,
                                totalNightValue: 0
                            });
                        }

                        const freelancer = freelancers.get(mashguiachId);
                        
                        // Garantir que os valores são números válidos e arredondados corretamente
                        const validDayHours = isNaN(dayHours) ? 0 : parseFloat(dayHours.toFixed(2));
                        const validNightHours = isNaN(nightHours) ? 0 : parseFloat(nightHours.toFixed(2));
                        const validDayValue = isNaN(dayValue) ? 0 : parseFloat(dayValue.toFixed(2));
                        const validNightValue = isNaN(nightValue) ? 0 : parseFloat(nightValue.toFixed(2));
                        const validServiceValue = isNaN(serviceValue) ? 0 : parseFloat(serviceValue.toFixed(2));
                        const validTransportValue = isNaN(transportValue) ? 0 : parseFloat(transportValue.toFixed(2));
                        const validTotalValue = validServiceValue + validTransportValue;

                        freelancer.services.push({
                            id: service.id,
                            eventId: event.id,
                            eventTitle: event.title,
                            date: event.date,
                            startTime: rawStartTime,
                            endTime: rawEndTime,
                            value: validServiceValue,
                            dayHours: validDayHours,
                            nightHours: validNightHours,
                            dayValue: validDayValue,
                            nightValue: validNightValue,
                            transportValue: validTransportValue,
                            totalValue: validTotalValue,
                            hasRealTimes: !!(service.reallyMashguiachArrive && service.reallyMashguiachEndTime)
                        });
                        
                        freelancer.totalServices++;
                        freelancer.totalValue += validServiceValue;
                        freelancer.totalTransport += validTransportValue;
                        freelancer.totalAmount = freelancer.totalValue + freelancer.totalTransport;
                        freelancer.totalDayHours += validDayHours;
                        freelancer.totalNightHours += validNightHours;
                        freelancer.totalDayValue += validDayValue;
                        freelancer.totalNightValue += validNightValue;
                    }
                });
            });

            // Construir o endereço completo
            const address = `${store.address_street || ''}, ${store.address_number || ''} - ${store.address_neighbor || ''}, ${store.address_city || ''}-${store.address_state || ''}`;

            // Informações do proprietário não estão disponíveis porque a relação 'user' não existe no modelo Stores
            return {
                id: store.id,
                title: store.title,
                phone: store.phone,
                comercialPhone: store.comercialPhone,
                address,
                owner: null, // Não temos acesso ao proprietário 
                events: store.StoreEvents,
                totalServices,
                totalValue,
                totalDayValue,
                totalNightValue,
                totalDayHours,
                totalNightHours,
                totalTransport,
                totalAmount: totalValue + totalTransport,
                freelancers: Array.from(freelancers.values())
            };
        });

        return {
            startDate,
            endDate: adjustedEndDate,
            stores: storeReports,
            totalStores: storeReports.length,
            totalServices: storeReports.reduce((sum, store) => sum + store.totalServices, 0),
            totalValue: storeReports.reduce((sum, store) => sum + store.totalValue, 0),
            totalDayValue: storeReports.reduce((sum, store) => sum + (store.totalDayValue || 0), 0),
            totalNightValue: storeReports.reduce((sum, store) => sum + (store.totalNightValue || 0), 0),
            totalDayHours: storeReports.reduce((sum, store) => sum + (store.totalDayHours || 0), 0),
            totalNightHours: storeReports.reduce((sum, store) => sum + (store.totalNightHours || 0), 0),
            totalTransport: storeReports.reduce((sum, store) => sum + store.totalTransport, 0),
            totalAmount: storeReports.reduce((sum, store) => sum + store.totalAmount, 0)
        };
    } catch (error) {
        console.error("Erro ao gerar relatório de freelancers por estabelecimento:", error);
        throw new Error(error instanceof Error ? error.message : "Erro ao gerar relatório de freelancers por estabelecimento. Verifique os logs para mais detalhes.");
    }
}

/**
 * Função que calcula as horas diurnas (06h-22h) e noturnas (22h-06h) de um serviço
 * @param startTime Horário de início do serviço
 * @param endTime Horário de término do serviço
 * @returns Objeto com horas diurnas e noturnas
 */
function calculateDayAndNightHours(startTime: Date, endTime: Date): { dayHours: number, nightHours: number } {
    try {
        console.log("Calculando horas para:", { 
            startTime: startTime instanceof Date ? startTime.toISOString() : startTime,
            endTime: endTime instanceof Date ? endTime.toISOString() : endTime,
            isStartValid: startTime instanceof Date && !isNaN(startTime.getTime()),
            isEndValid: endTime instanceof Date && !isNaN(endTime.getTime())
        });
        
        // Verificar se as datas são válidas
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
            console.log("Datas inválidas ou início após o fim, retornando 0 horas");
            return { dayHours: 0, nightHours: 0 };
        }
        
        // Calcular duração total em horas
        const durationMs = endTime.getTime() - startTime.getTime();
        
        // Calcular horas diurnas e noturnas
        let dayHours = 0;
        let nightHours = 0;
        
        // Criar cópia da data de início para iterar
        const currentTime = new Date(startTime);
        
        // Avançar em intervalos de 15 minutos para maior precisão
        const intervalMinutes = 15;
        const intervalMs = intervalMinutes * 60 * 1000;
        const totalIntervals = Math.ceil(durationMs / intervalMs);
        
        for (let i = 0; i < totalIntervals; i++) {
            const hour = currentTime.getHours();
            
            // Verificar se é horário noturno (22h às 6h)
            if (hour >= 22 || hour < 6) {
                nightHours += intervalMinutes / 60;
            } else {
                dayHours += intervalMinutes / 60;
            }
            
            // Avançar para o próximo intervalo
            currentTime.setTime(currentTime.getTime() + intervalMs);
            
            // Se passamos do horário final, ajustar o último intervalo
            if (currentTime > endTime) {
                const overflowMs = currentTime.getTime() - endTime.getTime();
                const overflowHours = overflowMs / (1000 * 60 * 60);
                
                // Subtrair o excesso do tipo de hora apropriado
                const lastHour = new Date(currentTime.getTime() - intervalMs).getHours();
                if (lastHour >= 22 || lastHour < 6) {
                    nightHours -= overflowHours;
                } else {
                    dayHours -= overflowHours;
                }
            }
        }
        
        // Arredondar para 2 casas decimais e garantir valores não negativos
        dayHours = Math.max(0, parseFloat(dayHours.toFixed(2)));
        nightHours = Math.max(0, parseFloat(nightHours.toFixed(2)));
        
        return { dayHours, nightHours };
    } catch (error) {
        console.error("Erro ao calcular horas diurnas/noturnas:", error);
        return { dayHours: 0, nightHours: 0 };
    }
} 