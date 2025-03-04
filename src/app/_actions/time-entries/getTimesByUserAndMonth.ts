"use server"

import { db } from "@/app/_lib/prisma"

export const getTimesByUserAndMonth = async (userId: string, month: number, year: number) => {
    // Cria as datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Busca todas as entradas do usuário no período
    const timeEntries = await db.timeEntries.findMany({
        where: {
            user_id: userId,
            entrace: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            user: true,
            stores: true,
        },
        orderBy: {
            entrace: 'asc'
        }
    });

    // Organiza as entradas por dia
    const entriesByDay: Record<string, any> = {};
    const hoursWorkedByDay: Record<string, number> = {};
    let totalHoursWorked = 0;
    
    timeEntries.forEach(entry => {
        const day = entry.entrace.toISOString().split('T')[0];
        
        entriesByDay[day] = {
            entrada: entry.entrace,
            saida: entry.exit,
            almoco: entry.lunchEntrace && entry.lunchExit ? {
                entrada: entry.lunchEntrace,
                saida: entry.lunchExit
            } : null
        };
        
        // Calcula as horas trabalhadas no dia
        if (entry.entrace && entry.exit) {
            let hoursWorked = (entry.exit.getTime() - entry.entrace.getTime()) / (1000 * 60 * 60);
            
            // Se teve horário de almoço, subtrair
            if (entry.lunchEntrace && entry.lunchExit) {
                const lunchHours = (entry.lunchExit.getTime() - entry.lunchEntrace.getTime()) / (1000 * 60 * 60);
                hoursWorked -= lunchHours;
            }
            
            // Arredonda para 2 casas decimais
            hoursWorked = parseFloat(hoursWorked.toFixed(2));
            
            // Limita o máximo de horas por dia a 24
            hoursWorked = Math.min(hoursWorked, 24);
            
            hoursWorkedByDay[day] = hoursWorked;
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