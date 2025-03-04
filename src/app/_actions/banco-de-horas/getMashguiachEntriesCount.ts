"use server"

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getEntriesByDay = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return db.timeEntries.count({
        where: {
            entrace: {
                gte: today,
                lt: tomorrow
            }
        }
    });
}

export const getExitByDay = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return db.timeEntries.count({
        where: {
            exit: {
                gte: today,
                lt: tomorrow
            }
        }
    });
}

export const getMashguiachEntriesCount = async () => {
    return db.timeEntries.count({
        where: {
            entrace: {
                not: null
            }
        }
    });
}