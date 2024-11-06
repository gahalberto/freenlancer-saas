"use server"

import { db } from "@/app/_lib/prisma"

export const getAllCourses = async  () => {
    return await db.course.findMany({});
}