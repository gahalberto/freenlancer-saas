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
    const entriesByDay: Record<string, { entrada?: Date, saida?: Date }> = {};
    
    timeEntries.forEach(entry => {
        const day = entry.data_hora.toISOString().split('T')[0];
        
        if (!entriesByDay[day]) {
            entriesByDay[day] = {};
        }
        
        if (entry.type === 'ENTRADA') {
            entriesByDay[day].entrada = entry.data_hora;
        } else if (entry.type === 'SAIDA') {
            entriesByDay[day].saida = entry.data_hora;
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

    // Valor por hora
    const hourlyRate = 39.40;
    const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2));

    return {
        timeEntries,
        entriesByDay,
        hoursWorkedByDay,
        totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        hourlyRate,
        totalAmount
    };
} 