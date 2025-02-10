"use server"

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export const getEntriesByDay = async () => {
    return db.timeEntries.count({
        where: {
            type: 'ENTRADA'
        }
    });
}

export const getExitByDay = async () => {
    return db.timeEntries.count({
        where: {
            type: 'SAIDA'
        }
    });
}