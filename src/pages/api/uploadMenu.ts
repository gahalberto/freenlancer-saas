import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getSession } from 'next-auth/react'
import { db } from '@/app/_lib/prisma'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/estabelecimentos/menus')

// Configura multer para armazenar os arquivos na memória
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Permitir apenas PDFs
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
const uploadMiddleware = upload.single('pdf')

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
  try {
    console.log('Iniciando processamento de upload de cardápio')
    const session = await getSession({ req })

    if (!session) {
      console.log('Erro: Usuário não autenticado')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method !== 'POST') {
      console.log(`Erro: Método ${req.method} não permitido`)
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    console.log('Executando middleware multer')
    await runMiddleware(req, res, uploadMiddleware)
    console.log('Middleware multer executado com sucesso')

    const { file } = req as any
    console.log('Arquivo recebido:', file ? 'Sim' : 'Não')

    if (!file) {
      console.log('Erro: Nenhum arquivo enviado')
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' })
    }

    console.log('Detalhes do arquivo:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })

    const storeId = req.body.storeId
    console.log('ID do estabelecimento:', storeId)

    if (!storeId) {
      console.log('Erro: ID do estabelecimento não fornecido')
      return res.status(400).json({ success: false, error: 'ID do estabelecimento não fornecido.' })
    }

    // Gerar um nome único para o arquivo
    const fileExtension = path.extname(file.originalname)
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, uniqueFileName)
    console.log('Nome único do arquivo:', uniqueFileName)
    console.log('Caminho do arquivo:', filePath)

    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log('Criando diretório de upload:', UPLOAD_DIR)
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    fs.writeFileSync(filePath, file.buffer)
    console.log('Arquivo salvo em:', filePath)

    // Caminho relativo para o arquivo
    const menuUrl = `/estabelecimentos/menus/${uniqueFileName}`
    console.log('URL do menu:', menuUrl)

    // Atualizando o menuUrl do estabelecimento no banco de dados
    console.log('Atualizando registro no banco de dados para o estabelecimento:', storeId)
    const updatedStore = await db.stores.update({
      where: {
        id: storeId,
      },
      data: {
        menuUrl: menuUrl,
      },
    })
    console.log('Registro atualizado com sucesso:', updatedStore.id)

    return res.status(200).json({ 
      success: true, 
      message: 'Upload de PDF bem-sucedido!', 
      name: uniqueFileName,
      menuUrl: menuUrl
    })
  } catch (error) {
    console.error('Erro ao processar o upload:', error)
    return res.status(500).json({ success: false, error: 'Erro ao processar o upload.' })
  }
}
