import { NextResponse } from "next/server";
import formidable from "formidable";
import { Readable } from "stream";
import { Buffer } from "buffer";
import path from "path";
import { db } from "@/app/_lib/prisma";
import fs from 'fs';

// Converta o corpo da requisição em um Buffer
async function buffer(request: Request): Promise<Buffer> {
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Função para converter o Buffer em um stream legível
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable._read = () => {}; // No-op _read method
  readable.push(buffer);
  readable.push(null); // Fim do stream
  return readable;
}

export async function POST(request: Request) {
  try {
    // Obtenha o buffer da requisição
    const bodyBuffer = await buffer(request);

    // Converta o buffer em um stream legível
    const stream = bufferToStream(bodyBuffer);

    // Inicialize o formidable e processe o formulário
    const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(stream as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Movendo o arquivo enviado para o diretório de uploads
    const imageFile = files.imageUrl;
    const oldPath = imageFile.filepath;
    const newPath = path.join(process.cwd(), "public/uploads", imageFile.newFilename);

    fs.renameSync(oldPath, newPath);

    // Salvando os dados no banco de dados
    const course = await db.course.create({
      data: {
        title: fields.title as string,
        description: fields.description as string,
        instructor: fields.instructor as string,
        imageUrl: `/uploads/${imageFile.newFilename}`,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar curso" }, { status: 500 });
  }
}
