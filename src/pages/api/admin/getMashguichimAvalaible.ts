import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ 
        message: 'Os parâmetros startDateTime e endDateTime são obrigatórios' 
      });
    }

    const start = new Date(startDateTime as string);
    const end = new Date(endDateTime as string);

    // Verificar se as datas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        message: 'Formato de data inválido. Use o formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ' 
      });
    }

    // Obter todos os mashguichim (usuários com roleId específico para mashguiach)
    const allMashguichim = await db.user.findMany({
      where: {
        roleId: 3, // Assumindo que roleId 3 é para mashguichim, ajuste conforme necessário
        status: true,
        deleteAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
      },
    });

    // Extrair dia da semana da data de início
    const dayOfWeek = dayjs(start).format('dddd');

    // Para cada mashguiach, verificar se ele está disponível
    const availableMashguichim = [];

    for (const mashguiach of allMashguichim) {
      // 1. Verificar se o mashguiach tem algum serviço agendado no período
      const hasEventService = await db.eventsServices.findFirst({
        where: {
          mashguiachId: mashguiach.id,
          OR: [
            // Verifica se há sobreposição entre os períodos
            {
              arriveMashguiachTime: {
                lte: end,
              },
              endMashguiachTime: {
                gte: start,
              },
            },
          ],
        },
      });

      if (hasEventService) {
        continue; // Mashguiach já tem serviço, pular para o próximo
      }

      // 2. Verificar se o mashguiach tem trabalho fixo no período
      // 2.1 Primeiro, verificar se há FixedJobs com horários específicos que se sobreponham
      const hasFixedJob = await db.fixedJobs.findFirst({
        where: {
          user_id: mashguiach.id,
          OR: [
            // Caso 1: Ambos timeIn e timeOut são definidos e há sobreposição
            {
              timeIn: {
                not: null,
              },
              timeOut: {
                not: null,
              },
              AND: [
                {
                  timeIn: {
                    lte: end,
                  },
                },
                {
                  timeOut: {
                    gte: start,
                  },
                },
              ],
            },
          ],
          deletedAt: null,
        },
      });

      if (hasFixedJob) {
        continue; // Mashguiach tem trabalho fixo com data específica, pular para o próximo
      }

      // 2.2 Verificar se há FixedJobs com WorkSchedule para o dia da semana
      const hasFixedJobSchedule = await db.fixedJobs.findFirst({
        where: {
          user_id: mashguiach.id,
          deletedAt: null,
          WorkSchedule: {
            some: {
              dayOfWeek: dayOfWeek,
              isDayOff: false,
              OR: [
                // Caso onde há horário definido
                {
                  timeIn: {
                    not: null,
                  },
                  timeOut: {
                    not: null,
                  },
                },
                // Caso onde é um domingo específico (folga)
                {
                  sundayOff: dayjs(start).date() <= 7 ? 1 : 
                             dayjs(start).date() <= 14 ? 2 : 
                             dayjs(start).date() <= 21 ? 3 : 4,
                },
              ],
            },
          },
        },
        include: {
          WorkSchedule: true,
        },
      });

      if (hasFixedJobSchedule) {
        // Verificar se o horário do WorkSchedule se sobrepõe ao período solicitado
        const schedule = hasFixedJobSchedule.WorkSchedule.find(
          (schedule) => schedule.dayOfWeek === dayOfWeek && !schedule.isDayOff
        );

        if (schedule && schedule.timeIn && schedule.timeOut) {
          const [startHour, startMinute] = schedule.timeIn.split(':').map(Number);
          const [endHour, endMinute] = schedule.timeOut.split(':').map(Number);

          const scheduleStart = new Date(start);
          scheduleStart.setHours(startHour, startMinute, 0, 0);

          const scheduleEnd = new Date(start);
          scheduleEnd.setHours(endHour, endMinute, 0, 0);

          // Verificar sobreposição
          if (
            (scheduleStart <= end && scheduleEnd >= start)
          ) {
            continue; // Há sobreposição, pular para o próximo mashguiach
          }
        }
      }

      // Se chegou até aqui, o mashguiach está disponível
      availableMashguichim.push(mashguiach);
    }

    return res.status(200).json({
      data: availableMashguichim,
      count: availableMashguichim.length,
    });
  } catch (error) {
    console.error('Erro ao buscar mashguichim disponíveis:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
