"use server"

import { db } from "@/app/_lib/prisma"

export const getAllFixedJobsTimesByMonth = async (month: number, year: number) => {
    // Cria as datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Busca todos os trabalhos fixos ativos
    const fixedJobs = await db.fixedJobs.findMany({
        where: {
            deletedAt: null
        },
        include: {
            mashguiach: true,
            store: true
        }
    });

    // Para cada trabalho fixo, busca as entradas e saídas do período
    const usersReport = await Promise.all(
        fixedJobs.map(async (job) => {
            const timeEntries = await db.timeEntries.findMany({
                where: {
                    user_id: job.user_id,
                    entrace: {
                        gte: startDate,
                        lte: endDate
                    }
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