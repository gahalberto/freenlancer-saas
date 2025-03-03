"use server"

import { db } from "@/app/_lib/prisma"

export const getAllFixedJobsTimesByMonth = async (month: number, year: number) => {
    // Cria as datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Busca todos os usuários com trabalhos fixos
    const fixedJobs = await db.fixedJobs.findMany({
        where: {
            deletedAt: null
        },
        include: {
            mashguiach: true,
            store: true
        }
    });

    // Para cada usuário com trabalho fixo, busca as entradas e saídas no período
    const usersReport = await Promise.all(
        fixedJobs.map(async (job) => {
            // Busca todas as entradas e saídas do usuário no período
            const timeEntries = await db.timeEntries.findMany({
                where: {
                    user_id: job.user_id,
                    store_id: job.store_id,
                    data_hora: {
                        gte: startDate,
                        lte: endDate
                    }
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
            const hourlyRate = job.price_per_hour;
            const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2));

            return {
                job,
                timeEntries,
                entriesByDay,
                hoursWorkedByDay,
                totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
                hourlyRate,
                totalAmount
            };
        })
    );

    // Calcula o total geral
    const totalHoursAllUsers = usersReport.reduce((total, user) => total + user.totalHoursWorked, 0);
    const totalAmountAllUsers = usersReport.reduce((total, user) => total + user.totalAmount, 0);

    return {
        usersReport,
        totalHoursAllUsers: parseFloat(totalHoursAllUsers.toFixed(2)),
        totalAmountAllUsers: parseFloat(totalAmountAllUsers.toFixed(2))
    };
} 