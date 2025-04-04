import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db as prisma } from '@/app/_lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Configuração para permitir upload de arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função para salvar o arquivo
const saveFile = async (file: formidable.File): Promise<string> => {
  // Cria diretório de uploads se não existir
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Gera um nome de arquivo único
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const uniqueFilename = `${timestamp}-${file.originalFilename}`;
  const uploadPath = path.join(uploadDir, uniqueFilename);

  // Lê o arquivo do local temporário e salva no diretório de uploads
  const data = fs.readFileSync(file.filepath);
  fs.writeFileSync(uploadPath, data as unknown as string | NodeJS.ArrayBufferView);
  fs.unlinkSync(file.filepath); // Exclui o arquivo temporário

  // Retorna o caminho relativo do arquivo para salvar no banco de dados
  return `/uploads/${uniqueFilename}`;
}

// Função para processar o formulário
const parseForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> => {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Verificar se o usuário está autenticado
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Método POST para criar um novo relatório
  if (req.method === 'POST') {
    try {
      // Processar o formulário com arquivo
      const { fields, files } = await parseForm(req);
      
      // Extrair dados do formulário
      const userId = fields.userId?.[0] || '';
      const title = fields.title?.[0] || '';
      const description = fields.description?.[0] || '';
      const url = fields.url?.[0] || '';
      
      // Verificar se o ID do usuário na sessão corresponde ao ID enviado
      if (session.user.id !== userId) {
        return res.status(403).json({ error: 'Usuário não autorizado' });
      }

      // Processa o screenshot se existir
      let screenshotUrl = undefined;
      const screenshot = files.screenshot?.[0];
      if (screenshot) {
        screenshotUrl = await saveFile(screenshot);
      }

      // Criar o relatório
      const report = await prisma.problemReport.create({
        data: {
          userId,
          title,
          description,
          url,
          screenshotUrl,
          status: 'PENDING',
        },
      });

      return res.status(201).json(report);
    } catch (error) {
      console.error('Erro ao criar relatório de problema:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 