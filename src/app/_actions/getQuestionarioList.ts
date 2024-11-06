"use server"

import { db } from "../_lib/prisma"

export const getQuestionarioList = () => {
    const lista = db.mashguiachQuestions.findMany({
        include: {
            user: true
        }
    });
    if(lista) return lista;
}

