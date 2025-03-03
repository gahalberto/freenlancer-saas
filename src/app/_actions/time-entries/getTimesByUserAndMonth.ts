"use server"

import { db } from "@/app/_lib/prisma"

export const getTimesByUserAndMonth = async (userId: string, month: number, year: number) => {
    // Cria as datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Busca todas as entradas e saídas do usuário no período
    const timeEntries = await db.timeEntries.findMany({
        where: {
            user_id: userId,
            data_hora: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            user: true,
            stores: true,
        },
        orderBy: {
            data_hora: 'asc'
        }
    });

    // Organiza as entradas e saídas por dia
    const entriesByDay: Record<string, { entrada?: Date, entradaId?: number, saida?: Date, saidaId?: number }> = {};
    
    timeEntries.forEach(entry => {
        const day = entry.data_hora.toISOString().split('T')[0];
        
        if (!entriesByDay[day]) {
            entriesByDay[day] = {};
        }
        
        if (entry.type === 'ENTRADA') {
            entriesByDay[day].entrada = entry.data_hora;
            entriesByDay[day].entradaId = entry.id;
        } else if (entry.type === 'SAIDA') {
            entriesByDay[day].saida = entry.data_hora;
            entriesByDay[day].saidaId = entry.id;
        }
    });

    // Calcula as horas trabalhadas por dia
    const hoursWorkedByDay: Record<string, number> = {};
    let totalHoursWorked = 0;
    
    Object.entries(entriesByDay).forEach(([day, times]) => {
        if (times.entrada && times.saida) {
            const hoursWorked = (times.saida.getTime() - times.entrada.getTime()) / (1000 * 60 * 60);
            hoursWorkedByDay[day] = parseFloat(hoursWorked.toFixed(2));
            totalHoursWorked += hoursWorked;
        }
    });

    // Busca o valor por hora do trabalho fixo do usuário
    const fixedJob = await db.fixedJobs.findFirst({
        where: {
            user_id: userId,
            deletedAt: null
        }
    });

    const hourlyRate = fixedJob?.price_per_hour ?? 39.40; // Usa o valor do trabalho fixo ou o padrão
    const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2));

    return {
        entriesByDay,
        hoursWorkedByDay,
        totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        hourlyRate,
        totalAmount
    };
} 