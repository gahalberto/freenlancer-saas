"use server"
import { db } from "@/app/_lib/prisma"

export const getNotifications = async (userId: string) => {
  try {
    // Busca notificações globais que o usuário ainda não leu
    const globalNotifications = await db.notification.findMany({
      where: {
        userId: null, // Notificações globais
        NOT: { // Notificação global que o usuário ainda não leu
          readBy: {
            has: userId, // Verifica se o userId está presente na lista readBy
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Busca notificações personalizadas
    const personalizedNotifications = await db.notification.findMany({
      where: {
        userId: userId, // Notificações específicas para o usuário
        read: false, // Apenas notificações não lidas
      },
      orderBy: { createdAt: 'desc' },
    });

    // Combina notificações globais e personalizadas, sem duplicação no campo `readBy`
    const allNotifications = [...globalNotifications, ...personalizedNotifications].map(notification => {
      // Remove duplicações no campo `readBy` (garantindo que o ID do usuário seja único)
      notification.readBy = [...new Set(notification.readBy)];
      return notification;
    });

    return allNotifications;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return false;
  }
};
