"use server"

import { db } from "@/app/_lib/prisma"

export const getTimesByUserAndMonth = async (userId: string, month: number, year: number) => {
    // Cria as datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Busca todas as entradas do usuário no período
    const timeEntries = await db.timeEntries.findMany({
        where: {
            user_id: userId,
            entrace: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            entrace: 'asc'
        }
    })

    // Organiza as entradas por dia
    const entriesByDay: Record<string, any> = {}
    let totalHoursWorked = 0

    timeEntries.forEach(entry => {
        // Ignora entradas sem horário de entrada
        if (!entry.entrace) return

        const day = entry.entrace.toISOString().split('T')[0]
        
        entriesByDay[day] = {
            entrada: entry.entrace,
            saida: entry.exit,
            almoco: entry.lunchEntrace && entry.lunchExit ? {
                entrada: entry.lunchEntrace,
                saida: entry.lunchExit
            } : null
        }

        // Calcula as horas trabalhadas no dia
        if (entry.entrace && entry.exit) {
            let hoursWorked = (entry.exit.getTime() - entry.entrace.getTime()) / (1000 * 60 * 60)

            // Se teve horário de almoço, subtrair
            if (entry.lunchEntrace && entry.lunchExit) {
                const lunchHours = (entry.lunchExit.getTime() - entry.lunchEntrace.getTime()) / (1000 * 60 * 60)
                hoursWorked -= lunchHours
            }

            // Arredonda para 2 casas decimais
            hoursWorked = parseFloat(hoursWorked.toFixed(2))
            
            // Limita o máximo de horas por dia a 24
            hoursWorked = Math.min(hoursWorked, 24)

            entriesByDay[day].horasTrabalhadasNoDia = hoursWorked
            totalHoursWorked += hoursWorked
        }
    })

    // Busca o valor por hora do usuário
    const fixedJob = await db.fixedJobs.findFirst({
        where: {
            user_id: userId,
            deletedAt: null
        }
    })

    // Valor padrão por hora caso não tenha um trabalho fixo
    const hourlyRate = fixedJob?.price_per_hour || 39.40
    const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2))

    return {
        userId,
        month,
        year,
        entriesByDay,
        totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        hourlyRate,
        totalAmount
    }
} 