import { NextApiRequest, NextApiResponse } from 'next'

export default async function postService(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body
    console.log('body', body)
  } catch (error) {
    console.error('Erro ao buscar eventos no banco de dados:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
}
