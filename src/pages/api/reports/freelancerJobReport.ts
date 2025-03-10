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

  // Obter token do cabeçalho ou do parâmetro de consulta (opcional)
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

    // Buscar serviços de eventos do usuário no período
    const eventsServices = await db.eventsServices.findMany({
      where: {
        mashguiachId: userId as string,
        arriveMashguiachTime: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      include: {
        StoreEvents: true,
      },
      orderBy: {
        arriveMashguiachTime: 'asc',
      }
    });

    if (eventsServices.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nenhum serviço de evento encontrado para este usuário no período especificado' 
      });
    }

    // Calcular horas trabalhadas e valores
    const reportData = calculateWorkHoursAndValues(eventsServices);

    // Gerar PDF
    const pdfBuffer = await generatePDF(user, reportData, startDateTime, endDateTime);

    // Configurar cabeçalhos para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-freelancer-${userId}-${dayjs(startDateTime).format('YYYY-MM-DD')}-${dayjs(endDateTime).format('YYYY-MM-DD')}.pdf`);
    
    // Enviar o PDF como resposta
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar a solicitação' });
  }
}

// Função para calcular horas trabalhadas e valores
function calculateWorkHoursAndValues(eventsServices: any[]) {
  const reportData = [];
  
  for (const service of eventsServices) {
    // Determinar se usar horários reais ou planejados
    const hasRealTimes = service.reallyMashguiachArrive && service.reallyMashguiachEndTime;
    
    const startTime = hasRealTimes 
      ? new Date(service.reallyMashguiachArrive) 
      : new Date(service.arriveMashguiachTime);
    
    const endTime = hasRealTimes 
      ? new Date(service.reallyMashguiachEndTime) 
      : new Date(service.endMashguiachTime);
    
    // Calcular duração em minutos
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;
    
    // Obter os valores de hora diurna e noturna do serviço
    // Usar valores padrão se não estiverem definidos
    const dayHourValue = (service as any).dayHourValue || 50;
    const nightHourValue = (service as any).nightHourValue || 75;
    
    // Calcular valor com base na hora do dia
    let totalValue = 0;
    let nightHours = 0;
    let dayHours = 0;
    
    // Verificar se o serviço cruza o período noturno (22h às 6h)
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    
    // Criar cópias das datas para manipulação
    const currentTime = new Date(startTime);
    
    // Avançar hora por hora para calcular o valor
    while (currentTime < endTime) {
      const hour = currentTime.getHours();
      
      // Verificar se é horário noturno (22h às 6h)
      if (hour >= 22 || hour < 6) {
        nightHours += 1;
      } else {
        dayHours += 1;
      }
      
      // Avançar 1 hora
      currentTime.setHours(currentTime.getHours() + 1);
    }
    
    // Ajustar a última hora parcial
    const lastHourFraction = endMinutes / 60;
    if (endHour >= 22 || endHour < 6) {
      nightHours -= (1 - lastHourFraction);
    } else {
      dayHours -= (1 - lastHourFraction);
    }
    
    // Calcular valor total usando os valores personalizados
    const dayValue = dayHours * dayHourValue;
    const nightValue = nightHours * nightHourValue;
    totalValue = dayValue + nightValue;
    
    // Adicionar transporte se houver
    if (service.transport_price) {
      totalValue += service.transport_price;
    }
    
    reportData.push({
      service,
      hasRealTimes,
      startTime,
      endTime,
      durationHours,
      dayHours,
      nightHours,
      dayValue,
      nightValue,
      dayHourValue,
      nightHourValue,
      transportValue: service.transport_price || 0,
      totalValue,
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
      doc.fontSize(18).text('Relatório de Trabalhos Freelancer', { align: 'center' });
      doc.moveDown();
      
      // Período do relatório
      doc.fontSize(12).text(`Período: ${dayjs(startDate).format('DD/MM/YYYY')} a ${dayjs(endDate).format('DD/MM/YYYY')}`, { align: 'center' });
      doc.moveDown();
      
      // Informações do Mashguiach
      doc.fontSize(14).text('Informações do Mashguiach', { underline: true });
      doc.fontSize(12).text(`Nome: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Telefone: ${user.phone || 'Não informado'}`);
      doc.text(`PIX: ${user.pixKey || 'Não informado'}`);
      
      doc.moveDown(2);
      
      // Resumo dos serviços
      doc.fontSize(14).text('Resumo dos Serviços', { underline: true });
      doc.moveDown();
      
      let totalGeral = 0;
      
      // Tabela de serviços
      const tableTop = doc.y;
      const tableHeaders = ['Data', 'Evento', 'Início', 'Fim', 'Horas', 'Valor (R$)'];
      const columnWidth = doc.page.width / 6 - 20;
      
      tableHeaders.forEach((header, i) => {
        doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
      });
      
      doc.moveDown();
      let rowTop = doc.y;
      
      // Adicionar linha horizontal
      doc.moveTo(50, rowTop - 5).lineTo(doc.page.width - 50, rowTop - 5).stroke();
      
      // Linhas da tabela
      reportData.forEach((data, index) => {
        // Verificar se precisa de nova página
        if (rowTop > doc.page.height - 150) {
          doc.addPage();
          rowTop = 50;
          
          // Redesenhar cabeçalho
          tableHeaders.forEach((header, i) => {
            doc.text(header, 50 + (i * columnWidth), rowTop, { width: columnWidth, align: 'left' });
          });
          
          doc.moveDown();
          rowTop = doc.y;
          
          // Adicionar linha horizontal
          doc.moveTo(50, rowTop - 5).lineTo(doc.page.width - 50, rowTop - 5).stroke();
        }
        
        // Definir cor do texto com base na presença de horários reais
        if (!data.hasRealTimes) {
          doc.fillColor('red');
        } else {
          doc.fillColor('black');
        }
        
        // Data do evento
        doc.text(dayjs(data.service.arriveMashguiachTime).format('DD/MM/YYYY'), 50, rowTop, { width: columnWidth, align: 'left' });
        
        // Nome do evento
        doc.text(data.service.StoreEvents.title, 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
        
        // Horário de início
        doc.text(dayjs(data.startTime).format('HH:mm'), 50 + (2 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
        
        // Horário de fim
        doc.text(dayjs(data.endTime).format('HH:mm'), 50 + (3 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
        
        // Horas trabalhadas
        doc.text(data.durationHours.toFixed(2), 50 + (4 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
        
        // Valor total
        doc.text(data.totalValue.toFixed(2), 50 + (5 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
        
        // Resetar cor
        doc.fillColor('black');
        
        totalGeral += data.totalValue;
        
        doc.moveDown();
        rowTop = doc.y;
      });
      
      // Adicionar linha horizontal
      doc.moveTo(50, rowTop - 5).lineTo(doc.page.width - 50, rowTop - 5).stroke();
      
      // Total geral
      doc.moveDown();
      doc.fontSize(14).text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, { align: 'right' });
      
      // Detalhes dos serviços
      doc.addPage();
      doc.fontSize(16).text('Detalhes dos Serviços', { align: 'center' });
      doc.moveDown();
      
      reportData.forEach((data, index) => {
        // Título do serviço
        doc.fontSize(14).text(`Serviço ${index + 1}: ${data.service.StoreEvents.title}`, { underline: true });
        doc.moveDown(0.5);
        
        // Informações do serviço
        doc.fontSize(12).text(`Data: ${dayjs(data.service.arriveMashguiachTime).format('DD/MM/YYYY')}`);
        doc.text(`Horário: ${dayjs(data.startTime).format('HH:mm')} às ${dayjs(data.endTime).format('HH:mm')}`);
        
        // Status do check-in
        if (!data.hasRealTimes) {
          doc.fillColor('red').text('Status: Sem registro de check-in/check-out');
        } else {
          doc.fillColor('green').text('Status: Check-in/check-out confirmados');
        }
        doc.fillColor('black');
        
        // Valores e cálculos
        doc.text(`Valor da hora diurna (6h-22h): R$ ${(data.dayHourValue || 50).toFixed(2)}`);
        doc.text(`Valor da hora noturna (22h-6h): R$ ${(data.nightHourValue || 75).toFixed(2)}`);
        doc.text(`Horas diurnas: ${data.dayHours.toFixed(2)} (R$ ${data.dayValue.toFixed(2)})`);
        doc.text(`Horas noturnas: ${data.nightHours.toFixed(2)} (R$ ${data.nightValue.toFixed(2)})`);
        doc.text(`Transporte: R$ ${data.transportValue.toFixed(2)}`);
        doc.text(`Total do serviço: R$ ${data.totalValue.toFixed(2)}`);
        
        // Observações
        if (data.service.observationText) {
          doc.moveDown(0.5);
          doc.text('Observações:', { underline: true });
          doc.text(data.service.observationText);
        }
        
        doc.moveDown(2);
      });
      
      // Legenda
      doc.moveDown(2);
      doc.fontSize(10).text('Legenda:', { underline: true });
      doc.fillColor('red').text('Vermelho: Serviços sem registro de check-in/check-out. Valores calculados com base nos horários planejados.');
      doc.fillColor('black').text('Preto: Serviços com registro de check-in/check-out confirmados.');
      doc.moveDown();
      doc.text('Observação: Serviços realizados entre 22h e 6h são calculados com valores personalizados para hora noturna.');
      
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