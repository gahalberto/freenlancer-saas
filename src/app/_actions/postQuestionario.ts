"use server"
import { db } from "../_lib/prisma";
import { MashguiachQuestions } from "@prisma/client";

export const postQuestionario = async (data: Omit<MashguiachQuestions, 'id'>) => {
    try {
        await db.mashguiachQuestions.create({
            data,
        });
        await db.user.update({
            data: {
                asweredQuestions: true
            },
            where: {
                id: data.userId
            }
        })
    } catch (error) {
        console.error("Erro ao salvar os dados no banco de dados:", error);
        throw error;
    }
};
