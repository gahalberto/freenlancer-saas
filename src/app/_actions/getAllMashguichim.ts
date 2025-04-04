"use server"

import { db } from "../_lib/prisma"

export const getAllMashguichim = async () => {
    return await db.user.findMany({where: {roleId: 1}, orderBy: { name: 'asc' }})
}

// Função auxiliar para converter string de hora (HH:MM) para minutos desde meia-noite
const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Nova função que filtra mashguiach disponíveis com base no horário
export const getAvailableMashguichim = async (arriveMashguiachTime: Date, endMashguiachTime: Date) => {
    // Primeiro, obtemos todos os mashguiach
    const allMashguichim = await db.user.findMany({
        where: { roleId: 1 },
        orderBy: { name: 'asc' }
    });

    // Obtemos o dia da semana do evento (0 = domingo, 1 = segunda, etc.)
    const dayOfWeek = arriveMashguiachTime.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dayOfWeek];

    // Convertemos os horários do evento para minutos desde meia-noite para facilitar a comparação
    const arriveMinutes = arriveMashguiachTime.getHours() * 60 + arriveMashguiachTime.getMinutes();
    const endMinutes = endMashguiachTime.getHours() * 60 + endMashguiachTime.getMinutes();

    // Caso especial: se o horário de término for 00:00, consideramos como 24:00 (fim do dia)
    const adjustedEndMinutes = endMinutes === 0 ? 24 * 60 : endMinutes;

    console.log(`Buscando mashguiach disponíveis para ${dayName} das ${arriveMashguiachTime.getHours()}:${arriveMashguiachTime.getMinutes()} às ${endMashguiachTime.getHours()}:${endMashguiachTime.getMinutes()}`);
    console.log(`Convertido para minutos: ${arriveMinutes} até ${adjustedEndMinutes}`);

    // Filtramos os mashguiach que têm trabalhos fixos nesse horário
    const unavailableMashguichimIds = new Set();

    // Buscar todos os trabalhos fixos para o dia da semana especificado
    const fixedJobs = await db.fixedJobs.findMany({
        where: {
            deletedAt: null,
        },
        include: {
            WorkSchedule: {
                where: {
                    dayOfWeek: dayName,
                }
            },
            mashguiach: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    console.log(`Encontrados ${fixedJobs.length} trabalhos fixos para ${dayName}`);

    // Verificar cada trabalho fixo para ver se há conflito de horário
    for (const job of fixedJobs) {
        for (const schedule of job.WorkSchedule) {
            if (schedule.timeIn && schedule.timeOut) {
                // Converter os horários do trabalho fixo para minutos
                const scheduleStartMinutes = timeToMinutes(schedule.timeIn);
                
                // Caso especial: se o horário de término for 00:00, consideramos como 24:00 (fim do dia)
                let scheduleEndMinutes = timeToMinutes(schedule.timeOut);
                if (scheduleEndMinutes === 0) {
                    scheduleEndMinutes = 24 * 60; // 24 horas em minutos
                }
                
                console.log(`Verificando mashguiach ${job.mashguiach.name} (${job.mashguiach.id}) com horário fixo de ${schedule.timeIn} às ${schedule.timeOut} (${scheduleStartMinutes} até ${scheduleEndMinutes} minutos)`);

                // Verificar se há sobreposição de horários
                // Há sobreposição se:
                // 1. O início do evento está dentro do período do trabalho fixo, OU
                // 2. O fim do evento está dentro do período do trabalho fixo, OU
                // 3. O evento engloba completamente o período do trabalho fixo
                const hasOverlap = 
                    // Caso 1: Início do evento dentro do período do trabalho fixo
                    (arriveMinutes >= scheduleStartMinutes && arriveMinutes < scheduleEndMinutes) ||
                    // Caso 2: Fim do evento dentro do período do trabalho fixo
                    (adjustedEndMinutes > scheduleStartMinutes && adjustedEndMinutes <= scheduleEndMinutes) ||
                    // Caso 3: Evento engloba completamente o período do trabalho fixo
                    (arriveMinutes <= scheduleStartMinutes && adjustedEndMinutes >= scheduleEndMinutes);

                if (hasOverlap) {
                    console.log(`Mashguiach ${job.mashguiach.name} (${job.mashguiach.id}) indisponível devido a sobreposição de horário`);
                    unavailableMashguichimIds.add(job.user_id);
                    break;
                }
            }
        }
    }

    // Filtrar os mashguiach disponíveis
    const availableMashguichim = allMashguichim.filter(
        mashguiach => !unavailableMashguichimIds.has(mashguiach.id)
    );

    console.log(`Total de ${availableMashguichim.length} mashguiach disponíveis de ${allMashguichim.length}`);
    
    return availableMashguichim;
}

// Função para calcular o preço do mashguiach baseado nos horários
export const calculateMashguiachPrice = (
    arriveMashguiachTime: Date,
    endMashguiachTime: Date,
    dayHourValue: number,
    nightHourValue: number
): number => {
    console.log('Calculando preço com os seguintes parâmetros:', {
        arriveMashguiachTime: arriveMashguiachTime.toISOString(),
        endMashguiachTime: endMashguiachTime.toISOString(),
        dayHourValue,
        nightHourValue
    });

    // Verifica se os valores são números
    if (isNaN(dayHourValue) || isNaN(nightHourValue)) {
        console.error('Valores inválidos para cálculo de preço:', { dayHourValue, nightHourValue });
        return 0;
    }

    // Se as datas são inválidas, retorna 0
    if (!arriveMashguiachTime || !endMashguiachTime || !(arriveMashguiachTime instanceof Date) || !(endMashguiachTime instanceof Date)) {
        console.error('Datas inválidas para cálculo de preço:', { arriveMashguiachTime, endMashguiachTime });
        return 0;
    }

    let totalPrice = 0;
    let dayHours = 0;
    let nightHours = 0;
    
    // Clone da data para não modificar a original
    let currentTime = new Date(arriveMashguiachTime.getTime());
    
    // Calcula a quantidade de horas entre as datas
    while (currentTime < endMashguiachTime) {
        const hour = currentTime.getHours();
        const isNightTime = hour >= 22 || hour < 6;
        
        // Incrementa contador de horas por período
        if (isNightTime) {
            nightHours++;
        } else {
            dayHours++;
        }
        
        // Avança para a próxima hora
        currentTime.setTime(currentTime.getTime() + 60 * 60 * 1000);
    }
    
    // Calcula o preço baseado no número de horas em cada período
    const dayPrice = dayHours * dayHourValue;
    const nightPrice = nightHours * nightHourValue;
    totalPrice = dayPrice + nightPrice;
    
    console.log(`Horas diurnas: ${dayHours} x R$${dayHourValue} = R$${dayPrice}`);
    console.log(`Horas noturnas: ${nightHours} x R$${nightHourValue} = R$${nightPrice}`);
    console.log('Preço total calculado:', totalPrice);
    
    return totalPrice;
};