"use server"

import { db } from "@/app/_lib/prisma"
import { Course } from "@prisma/client"

export const postNewCourse = async (data: Course) => {
    try {
        await db.course.create({
            data
        })
        return true;
    } catch (error) {
        console.error('Aconteceu um erro')
        throw error
    }
}