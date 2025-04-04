"use server"

import { db } from "@/app/_lib/prisma"

export const getTimesByUserAndMonth = async (userId: string, month: number, year: number, storeId?: string) => {
    try {
        // Validar parâmetros de entrada
        if (!userId) {
            throw new Error("ID de usuário não fornecido");
        }

        if (month < 1 || month > 12) {
            throw new Error("Mês inválido");
        }

        if (year < 2000 || year > 2100) {
            throw new Error("Ano inválido");
        }

        // Cria as datas de início e fim do mês
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Verifica se o usuário existe
        const userExists = await db.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!userExists) {
            throw new Error("Usuário não encontrado");
        }

        // Preparar where clause para filtrar por storeId se fornecido
        const whereClause: any = {
            user_id: userId,
            entrace: {
                gte: startDate,
                lte: endDate
            }
        };

        // Se um storeId foi fornecido, adicionar ao filtro
        if (storeId) {
            whereClause.store_id = storeId;
        }

        // Busca todas as entradas do usuário no período (apenas leitura)
        const timeEntries = await db.timeEntries.findMany({
            where: whereClause,
            orderBy: {
                entrace: 'asc'
            }
        })

        // Organiza as entradas por dia
        const entriesByDay: Record<string, any> = {}
        const hoursWorkedByDay: Record<string, number> = {} 
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

                hoursWorkedByDay[day] = hoursWorked
                totalHoursWorked += hoursWorked
            }
        })

        // Busca o valor por hora do usuário (apenas leitura, sem atualização)
        const fixedJobWhere: any = {
            user_id: userId,
            deletedAt: null
        };

        // Se um storeId foi fornecido, adicionar ao filtro de trabalho fixo
        if (storeId) {
            fixedJobWhere.store_id = storeId;
        }

        const fixedJob = await db.fixedJobs.findFirst({
            where: fixedJobWhere
        });

        // Valor padrão por hora caso não tenha um trabalho fixo
        const hourlyRate = fixedJob?.price_per_hour || 39.40
        const totalAmount = parseFloat((totalHoursWorked * hourlyRate).toFixed(2))

        // Obter o nome do estabelecimento se storeId foi fornecido
        let storeName = null;
        if (storeId) {
            const store = await db.stores.findUnique({
                where: { id: storeId },
                select: { title: true }
            });
            storeName = store?.title;
        }

        return {
            userId,
            month,
            year,
            storeId,
            storeName,
            entriesByDay,
            hoursWorkedByDay,
            totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
            hourlyRate,
            totalAmount
        }
    } catch (error) {
        console.error("Erro ao buscar dados para o relatório:", error);
        throw new Error(error instanceof Error ? error.message : "Erro ao gerar relatório. Verifique os logs para mais detalhes.");
    }
} 