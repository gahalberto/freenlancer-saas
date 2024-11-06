"use server"
import { db } from '@/app/_lib/prisma';

type NotificationParams = {
  message: string;
  redirectUrl?: string;
  userId?: string | null;
  icon?: string;
};

export const createNotification = async ({
  message,
  redirectUrl = '',
  userId = null,
  icon = '',
}: NotificationParams) => {
  if (!message) {
    throw new Error('Message is required');
  }

  try {
    console.log('Creating notification with message:', message);

    const notification = await db.notification.create({
      data: {
        message,
        redirectUrl: redirectUrl || null,
        userId: userId || null,
        icon: icon || null, // Apenas adiciona o ícone se for fornecido
      },
    });

    console.log('Notification created successfully:', notification);
    return notification;
  } catch (error: any) {
    console.error('Error creating notification:', error.message);
    console.error('Stack Trace:', error.stack);
    throw new Error('Failed to create notification');
  }
};
