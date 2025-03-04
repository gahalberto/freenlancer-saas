import { db } from '@/app/_lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { validateToken } from '../validateToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const session = await getServerSession(req, res, authOptions)

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido ou inválido' });
        }

        const token = authHeader.split(' ')[1];

        if (req.headers.session) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }
        
        const isValidToken = await validateToken(token); // função fictícia para validar o token

        if (!isValidToken) {
            return res.status(401).json({ error: 'Token inválido' });
        }


        try {
            const courses = await db.course.findMany();

            res.json(courses)
        } catch (error) {
            console.error('Erro ao buscar eventos no banco de dados:', error)
            res.status(500).json({ error: 'Erro ao buscar eventos' })
        }
    } else {
        return res.status(405).json({ error: 'Método não permitido' });
    }
}