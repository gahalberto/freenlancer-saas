import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getSession } from 'next-auth/react'
import { db } from '@/app/_lib/prisma'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/estabelecimentos/logos')

// Configura multer para armazenar os arquivos na memória
const upload = multer({ storage: multer.memoryStorage() })

export const config = {
  api: {
    bodyParser: false, // Desativa o bodyParser padrão para permitir que multer processe o formulário
  },
}

// Middleware para processar a requisição com multer
const uploadMiddleware = upload.single('image')

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('Middleware running:', req.url)

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  await runMiddleware(req, res, uploadMiddleware)

  const { file } = req as any

  if (!file) {
    return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' })
  }

  // Supondo que você receba courseId junto com o arquivo, talvez no campo adicional do form
  const storeId = req.body.storeId

  if (!storeId) {
    return res.status(400).json({ success: false, error: 'ID do curso não fornecido.' })
  }

  const fileName = file.originalname
  const filePath = path.join(UPLOAD_DIR, fileName)

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  try {
    fs.writeFileSync(filePath, file.buffer)
    console.log('Arquivo salvo em:', filePath)

    // Atualizando o imageUrl do curso no banco de dados
    const updateCourseImageUrl = await db.stores.update({
      where: {
        id: storeId,
      },
      data: {
        imageUrl: `/estabelecimentos/logos/${fileName}`, // Corrigido o caminho
      },
    })

    return res.status(200).json({ success: true, message: 'Upload bem-sucedido!', name: fileName })
  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error)
    return res.status(500).json({ success: false, error: 'Erro ao salvar o arquivo.' })
  }
}
