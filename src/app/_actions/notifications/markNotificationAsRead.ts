"use server"
import { db } from "@/app/_lib/prisma"

export const markNotificationAsRead = async (notificationId: number, userId: string) => {
    await db.notification.update({
        where: { id: notificationId },
        data: {
            readBy: {
                push: userId
            }
        }
    })
}