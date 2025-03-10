import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/_lib/prisma';
import { validateToken } from '../validateToken';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

type ResponseData = {
  success: boolean;
  message?: string;
  pdfUrl?: string;
  reportData?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar se o método é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  // Obter token do cabeçalho ou do parâmetro de consulta
  let token = '';
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  // Validar o token se fornecido
  if (token) {
    const { valid, error } = await validateToken(token);
    if (!valid) {
      return res.status(401).json({ success: false, message: error || 'Token inválido' });
    }
  }
  // Se não houver token, continuar sem validação (para permitir acesso público ao relatório)

  try {
    // Obter parâmetros da requisição
    const { userId, startDate, endDate, month, year } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    // Validar e configurar datas
    let startDateTime: Date;
    let endDateTime: Date;

    if (startDate && endDate) {
      // Usar intervalo de datas específico
      startDateTime = new Date(startDate as string);
      endDateTime = new Date(endDate as string);
      
      // Ajustar o final do dia para endDateTime
      endDateTime.setHours(23, 59, 59, 999);
    } else if (month && year) {
      // Usar mês e ano
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum)) {
        return res.status(400).json({ success: false, message: 'Mês ou ano inválido' });
      }
      
      startDateTime = new Date(yearNum, monthNum - 1, 1); // Primeiro dia do mês
      endDateTime = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Último dia do mês
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Forneça startDate e endDate OU month e year' 
      });
    }

    // Verificar se as datas são válidas
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Datas inválidas' });
    }

    // Buscar o usuário (Mashguiach)
    const user = await db.user.findUnique({
      where: { id: userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pixKey: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Buscar trabalhos fixos do usuário
    const fixedJobs = await db.fixedJobs.findMany({
      where: {
        user_id: userId as string,
        deletedAt: null,
      },
      include: {
        store: true,
        WorkSchedule: true,
      }
    });

    if (fixedJobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Nenhum trabalho fixo encontrado para este usuário' });
    }

    // Buscar registros de tempo no período
    const timeEntries = await db.timeEntries.findMany({
      where: {
        user_id: userId as string,
        entrace: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      include: {
        stores: true,
      },
      orderBy: {
        entrace: 'asc',
      }
    });

    // Calcular horas trabalhadas e valores por estabelecimento
    const reportData = await calculateWorkHoursAndValues(timeEntries, fixedJobs);

    // Gerar PDF
    const pdfBuffer = await generatePDF(user, reportData, startDateTime, endDateTime);

    // Configurar cabeçalhos para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${userId}-${dayjs(startDateTime).format('YYYY-MM-DD')}-${dayjs(endDateTime).format('YYYY-MM-DD')}.pdf`);
    
    // Enviar o PDF como resposta
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar a solicitação' });
  }
}

// Função para calcular horas trabalhadas e valores
async function calculateWorkHoursAndValues(timeEntries: any[], fixedJobs: any[]) {
  // Agrupar entradas por estabelecimento
  const entriesByStore: { [key: string]: any[] } = {};
  
  timeEntries.forEach(entry => {
    const storeId = entry.store_id;
    if (!entriesByStore[storeId]) {
      entriesByStore[storeId] = [];
    }
    entriesByStore[storeId].push(entry);
  });

  // Calcular horas e valores para cada estabelecimento
  const reportData = [];
  
  for (const storeId in entriesByStore) {
    const entries = entriesByStore[storeId];
    const fixedJob = fixedJobs.find(job => job.store_id === storeId);
    
    if (!fixedJob) continue; // Pular se não houver trabalho fixo para este estabelecimento
    
    let totalMinutes = 0;
    const entriesDetails = [];
    
    for (const entry of entries) {
      if (entry.entrace && entry.exit) {
        // Calcular tempo de trabalho (considerando almoço se houver)
        const entraceTime = new Date(entry.entrace).getTime();
        const exitTime = new Date(entry.exit).getTime();
        
        let workMinutes = Math.floor((exitTime - entraceTime) / (1000 * 60));
        
        // Subtrair tempo de almoço se houver
        if (entry.lunchEntrace && entry.lunchExit) {
          const lunchEntraceTime = new Date(entry.lunchEntrace).getTime();
          const lunchExitTime = new Date(entry.lunchExit).getTime();
          const lunchMinutes = Math.floor((lunchExitTime - lunchEntraceTime) / (1000 * 60));
          workMinutes -= lunchMinutes;
        }
        
        totalMinutes += workMinutes;
        
        entriesDetails.push({
          date: dayjs(entry.entrace).format('DD/MM/YYYY'),
          entrace: dayjs(entry.entrace).format('HH:mm'),
          exit: dayjs(entry.exit).format('HH:mm'),
          lunchEntrace: entry.lunchEntrace ? dayjs(entry.lunchEntrace).format('HH:mm') : '-',
          lunchExit: entry.lunchExit ? dayjs(entry.lunchExit).format('HH:mm') : '-',
          workMinutes,
          workHours: (workMinutes / 60).toFixed(2),
        });
      }
    }
    
    const totalHours = totalMinutes / 60;
    const totalValue = totalHours * fixedJob.price_per_hour;
    
    reportData.push({
      store: entries[0].stores,
      fixedJob,
      totalHours,
      totalValue,
      entriesDetails,
    });
  }
  
  return reportData;
}

// Função para gerar o PDF
async function generatePDF(user: any, reportData: any[], startDate: Date, endDate: Date) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });
      
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Configurar fonte e tamanho
      doc.font('Helvetica');
      
      // Título
      doc.fontSize(18).text('Relatório de Trabalho Fixo', { align: 'center' });
      doc.moveDown();
      
      // Período do relatório
      doc.fontSize(12).text(`Período: ${dayjs(startDate).format('DD/MM/YYYY')} a ${dayjs(endDate).format('DD/MM/YYYY')}`, { align: 'center' });
      doc.moveDown();
      
      // Informações do Mashguiach
      doc.fontSize(14).text('Informações do Mashguiach', { underline: true });
      doc.fontSize(12).text(`Nome: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Telefone: ${user.phone || 'Não informado'}`);
      doc.text(`PIX:: ${user.pixKey || 'Não informado'}`);
            
      doc.moveDown(2);
      
      // Resumo por estabelecimento
      doc.fontSize(14).text('Resumo por Estabelecimento', { underline: true });
      doc.moveDown();
      
      let totalGeral = 0;
      
      reportData.forEach((data, index) => {
        // Informações do estabelecimento
        doc.fontSize(12).text(`Estabelecimento: ${data.store.title}`, { continued: true });
        doc.text(`  (${data.store.address_city} - ${data.store.address_state})`, { underline: true });
        
        doc.text(`Valor por hora: R$ ${data.fixedJob.price_per_hour.toFixed(2)}`);
        doc.text(`Total de horas trabalhadas: ${data.totalHours.toFixed(2)} horas`);
        doc.text(`Valor total: R$ ${data.totalValue.toFixed(2)}`);
        
        totalGeral += data.totalValue;
        
        doc.moveDown();
        
        // Tabela de detalhes
        doc.fontSize(10).text('Detalhes dos dias trabalhados:', { underline: true });
        doc.moveDown(0.5);
        
        // Cabeçalho da tabela
        const tableTop = doc.y;
        const tableHeaders = ['Data', 'Entrada', 'Saída', 'Almoço Início', 'Almoço Fim', 'Horas'];
        const columnWidth = 80;
        
        tableHeaders.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
        });
        
        doc.moveDown();
        let rowTop = doc.y;
        
        // Linhas da tabela
        data.entriesDetails.forEach((detail: any, i: number) => {
          // Verificar se precisa de nova página
          if (rowTop > doc.page.height - 100) {
            doc.addPage();
            rowTop = 50;
            
            // Redesenhar cabeçalho
            tableHeaders.forEach((header, i) => {
              doc.text(header, 50 + (i * columnWidth), rowTop, { width: columnWidth, align: 'left' });
            });
            
            doc.moveDown();
            rowTop = doc.y;
          }
          
          doc.text(detail.date, 50, rowTop, { width: columnWidth, align: 'left' });
          doc.text(detail.entrace, 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
          doc.text(detail.exit, 50 + (2 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
          doc.text(detail.lunchEntrace, 50 + (3 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
          doc.text(detail.lunchExit, 50 + (4 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
          doc.text(`${detail.workHours}h`, 50 + (5 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
          
          doc.moveDown();
          rowTop = doc.y;
        });
        
        doc.moveDown();
        
        // Adicionar página para o próximo estabelecimento (exceto o último)
        if (index < reportData.length - 1) {
          doc.addPage();
        }
      });
      
      // Total geral
      doc.moveDown();
      doc.fontSize(14).text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, { align: 'right' });
      
      // Rodapé
      doc.moveDown(2);
      doc.fontSize(10).text(`Relatório gerado em ${dayjs().format('DD/MM/YYYY [às] HH:mm')}`, { align: 'center' });
      
      // Finalizar o documento
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
} 