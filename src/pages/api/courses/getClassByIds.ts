import { db } from "@/app/_lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        // Certifique-se de que `id` está presente para evitar consultas inválidas
        if (!id) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        const classes = await db.lesson.findMany({
            where: {
                courseId: id as string // Filtra usando o campo 'id' da tabela 'lesson'
            }
        });

        res.json(classes);
    } catch (error) {
        console.error('Erro ao buscar as aulas:', error);
        res.status(500).json({ error: 'Erro ao buscar aulas' });
    }
}
