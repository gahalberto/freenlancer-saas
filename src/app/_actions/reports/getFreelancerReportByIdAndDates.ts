"use server"

import { db } from "@/app/_lib/prisma";

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

/**
 * Obtém dados para o relatório de trabalhos freelancer por ID e período
 */
export const getFreelancerReportByIdAndDates = async (
    mashguiachId: string,
    startDate: Date,
    endDate: Date,
    storeId?: string
) => {
    try {
        // Validar parâmetros de entrada
        if (!mashguiachId) {
            throw new Error("ID do mashguiach não fornecido");
        }

        // Verificar se o mashguiach existe
        const mashguiach = await db.user.findUnique({
            where: { id: mashguiachId },
            select: {
                id: true,
                name: true,
                phone: true,
                pixKey: true,
                email: true
            }
        });

        if (!mashguiach) {
            throw new Error("Mashguiach não encontrado");
        }

        // Ajustar final do dia para a data final
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        // Preparar where clause para a consulta
        const whereClause: any = {
            mashguiachId,
            arriveMashguiachTime: {
                gte: startDate,
                lte: adjustedEndDate
            }
        };

        // Se um storeId foi fornecido, adicionar ao filtro
        if (storeId) {
            whereClause.StoreEvents = {
                storeId
            };
        }

        // Buscar serviços do mashguiach no período
        const services = await db.eventsServices.findMany({
            where: whereClause,
            include: {
                StoreEvents: {
                    include: {
                        store: true
                    }
                }
            },
            orderBy: {
                arriveMashguiachTime: 'asc'
            }
        });

        // Processar dados dos serviços
        let totalHours = 0;
        let totalDayHours = 0;
        let totalNightHours = 0;
        let totalValue = 0;
        let totalDayValue = 0;
        let totalNightValue = 0;
        let totalTransport = 0;

        const formattedServices = services.map(service => {
            // Determinar os horários de entrada e saída, priorizando os reais se existirem
            const startTime = service.arriveMashguiachTime;
            const endTime = service.endMashguiachTime;

            // Calcular duração do serviço em horas
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);

            // Arredondar para 2 casas decimais
            const hours = parseFloat(durationHours.toFixed(2));
            
            // Valores por hora (diurno e noturno)
            const dayHourValue = service.dayHourValue || 50;
            const nightHourValue = service.nightHourValue || 75;

            console.log(`Calculando horas para serviço ${service.id} - Início: ${startTime.toISOString()}, Fim: ${endTime.toISOString()}`);
            
            // Usar a função para calcular horas diurnas e noturnas
            const { dayHours, nightHours } = calculateDayAndNightHours(startTime, endTime);
            
            console.log(`Total de horas: ${hours}h (Diurnas: ${dayHours}h, Noturnas: ${nightHours}h)`);
            
            // Calcular valores
            let dayValue = dayHourValue * dayHours;
            let nightValue = nightHours * nightHourValue;
            console.log(`Valores calculados - Diurno: R$${dayValue.toFixed(2)}, Noturno: R$${nightValue.toFixed(2)}`);
            
            // Calcular valor do serviço
            // Se tiver um preço específico para o mashguiach, usar ele
            // Caso contrário, calcular com base nas horas e preço por hora
            let serviceValue: number;
            

                serviceValue = parseFloat((dayValue + nightValue).toFixed(2));
                console.log(`Calculando por hora: R$${serviceValue.toFixed(2)}`);
            
                
            const transportValue = service.transport_price || 0;
            const totalServiceValue = serviceValue + transportValue;

            // Adicionar aos totais
            totalHours += hours;
            totalDayHours += dayHours;
            totalNightHours += nightHours;
            totalValue += serviceValue;

            totalDayValue += dayValue;
            totalNightValue += nightValue;
            totalTransport += transportValue;
            console.log("Valor antes do ajuste:", totalValue);
            if(totalValue < 250){
                totalValue = 250;
            }
            console.log("Valor após o ajuste:", totalValue);
            return {
                id: service.id,
                eventId: service.StoreEventsId,
                eventTitle: service.StoreEvents.title,
                storeId: service.StoreEvents.storeId,
                storeName: service.StoreEvents.store?.title || "Sem estabelecimento",
                date: startTime,
                startTime,
                endTime,
                hours,
                dayHours,
                nightHours,
                dayHourValue,
                nightHourValue,
                dayValue,
                nightValue,
                value: serviceValue,
                transportValue,
                totalValue: totalServiceValue < 250 ? 250 : totalServiceValue,
                hasRealTimes: !!(service.reallyMashguiachArrive && service.reallyMashguiachEndTime),
                observations: service.observationText || ""
            };
        });

        // Agrupar serviços por estabelecimento
        const servicesByStore: Record<string, typeof formattedServices> = {};
        
        formattedServices.forEach(service => {
            if (!servicesByStore[service.storeId]) {
                servicesByStore[service.storeId] = [];
            }
            servicesByStore[service.storeId].push(service);
        });

        // Nome do estabelecimento selecionado, se houver
        let selectedStoreName = null;
        if (storeId) {
            const store = await db.stores.findUnique({
                where: { id: storeId },
                select: { title: true }
            });
            selectedStoreName = store?.title || null;
        }

        const totalValueWithTransport = totalValue + totalTransport;

        return {
            mashguiach,
            startDate,
            endDate: adjustedEndDate,
            services: formattedServices,
            servicesByStore,
            selectedStoreId: storeId || null,
            selectedStoreName,
            totalServices: services.length,
            totalHours: parseFloat(totalHours.toFixed(2)),
            totalDayHours: parseFloat(totalDayHours.toFixed(2)),
            totalNightHours: parseFloat(totalNightHours.toFixed(2)),
            totalDayValue: parseFloat(totalDayValue.toFixed(2)),
            totalNightValue: parseFloat(totalNightValue.toFixed(2)),
            totalValue: parseFloat(totalValue.toFixed(2)),
            totalTransport: parseFloat(totalTransport.toFixed(2)),
            totalValueWithTransport: parseFloat(totalValueWithTransport.toFixed(2))
        };
    } catch (error) {
        console.error("Erro ao gerar relatório de freelancer:", error);
        throw new Error(error instanceof Error ? error.message : "Erro ao gerar relatório de freelancer. Verifique os logs para mais detalhes.");
    }
} 