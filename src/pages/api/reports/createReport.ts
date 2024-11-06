import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // Importando o UUID
import { db } from "@/app/_lib/prisma";
import { getSession } from 'next-auth/react';

// Definindo uma interface estendida para incluir `file`
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File; // Adiciona o tipo de arquivo do multer
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads/reports');

// Configurando multer para salvar arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configurando o bodyParser
export const config = {
  api: {
    bodyParser: false, // Desativar bodyParser para permitir que multer processe o multipart/form-data
  },
};

// Função para rodar o middleware de upload
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await runMiddleware(req, res, upload.single('image'));

  const { title, description, store } = req.body;
  const file = req.file;

  if (!title || !description || !store) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  let imageUrl = '';
  if (file) {
    // Gerando um nome único usando o UUID
    const fileExtension = path.extname(file.originalname); // Obtém a extensão do arquivo original
    const fileName = `${uuidv4()}${fileExtension}`; // Gera um nome único com UUID e a extensão original
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);
    imageUrl = `/uploads/reports/${fileName}`;
  }

  try {
    const newReport = await db.reports.create({
      data: {
        title,
        description,
        storeId: store,
        imageUrl,
      },
    });

    return res.status(200).json({ success: true, message: "Relatório criado com sucesso", report: newReport });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: "Erro ao criar o relatório", details: error.message });
    } else {
      return res.status(500).json({ error: "Erro desconhecido ao criar o relatório" });
    }
  }
}
