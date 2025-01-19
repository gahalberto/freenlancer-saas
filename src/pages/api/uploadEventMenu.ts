import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getSession } from 'next-auth/react'
import { db } from '@/app/_lib/prisma'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/estabelecimentos/menus')

// Configura multer para armazenar os arquivos na memória
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Permitir apenas arquivos PDF
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Somente arquivos PDF são permitidos.'))
    }
    cb(null, true)
  },
})

export const config = {
  api: {
    bodyParser: false, // Desativa o bodyParser padrão para permitir que multer processe o formulário
  },
}

// Middleware para processar a requisição com multer
const uploadMiddleware = upload.single('menuFile')

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Processar o middleware
    await runMiddleware(req, res, uploadMiddleware)

    const { file } = req as any

    // Extrair os dados do formulário do `req.body`
    const {
      title,
      responsable,
      responsableTelephone,
      nrPax,
      address_zicode = '',
      address_street = '',
      address_number = '',
      address_neighbor = '',
      address_city = '',
      address_state = '',
      store,
      eventType,
      serviceType,
      date,
      userId,
    } = req.body

    // Validar os dados obrigatórios
    if (!title || !store || !responsable || !date) {
      return res.status(400).json({ error: 'Dados incompletos fornecidos no formulário.' })
    }

    const ownerExists = await db.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!ownerExists) {
      return res.status(400).json({ error: 'Usuário não encontrado.' })
    }

    // Criar o evento no banco de dados
    const event = await db.storeEvents.create({
      data: {
        title,
        responsable,
        responsableTelephone,
        clientName: responsable, // Cliente assumido como responsável
        nrPax: parseInt(nrPax, 10),
        address_zicode,
        address_street,
        address_number,
        address_neighbor,
        address_city,
        address_state,
        isApproved: false,
        store: {
          connect: { id: store },
        },
        eventType,
        serviceType,
        date: new Date(date),
        eventOwner: {
          connect: { id: session.user.id },
        },
      },
    })

    if (file) {
      // Salvar o arquivo PDF
      const fileName = `${Date.now()}-${file.originalname}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
      }
      fs.writeFileSync(filePath, file.buffer)

      // Atualizar o evento com o caminho do PDF
      const updatedEvent = await db.storeEvents.update({
        where: {
          id: event.id,
        },
        data: {
          menuUrl: `/estabelecimentos/menus/${fileName}`,
        },
      })

      // Retornar sucesso
      return res.status(200).json({
        success: true,
        message: 'Evento criado com sucesso com arquivo!',
        id: updatedEvent.id, // Inclui o ID do evento
        event: updatedEvent,
      })
    } else {
      return res.status(200).json({
        success: true,
        message: 'Evento criado com sucesso sem arquivo!',
        id: event.id, // Inclui o ID do evento
        event: event,
      })
    }
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return res.status(500).json({ error: 'Erro interno ao processar o evento.' })
  }
}
