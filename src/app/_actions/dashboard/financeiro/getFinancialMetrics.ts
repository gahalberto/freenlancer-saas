'use server'

import { db } from '@/app/_lib/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import { TransactionStatus, WORKTYPE } from '@prisma/client'

export interface FinancialMetrics {
  // Métricas gerais
  totalReceitas: number
  totalDespesas: number
  saldoGeral: number
  
  // Métricas de eventos
  totalReceitasEventos: number
  totalDespesasEventos: number
  saldoEventos: number
  eventosRealizados: number
  eventosAgendados: number
  
  // Métricas de serviços fixos
  totalReceitasServicoFixo: number
  totalDespesasServicoFixo: number
  saldoServicoFixo: number
  servicosFixosAtivos: number
  
  // Métricas por período
  receitasMesAtual: number
  despesasMesAtual: number
  saldoMesAtual: number
  
  // Top mashguiachim por faturamento
  topMashguiachim: Array<{
    id: string
    nome: string
    totalRecebido: number
    totalEventos: number
  }>
  
  // Gráficos de receitas e despesas (últimos 6 meses)
  graficoMensal: Array<{
    mes: string
    receitas: number
    despesas: number
    saldo: number
  }>
}

/**
 * Calcula o valor total a pagar considerando dayValue e nightValue
 * @param startTime Horário de entrada
 * @param endTime Horário de saída
 * @param dayHourValue Valor da hora diurna (6h00-22h00)
 * @param nightHourValue Valor da hora noturna (22h00-6h00)
 * @returns Valor total a pagar
 */
function calcularValorComFaixaHoraria(
  startTime: Date,
  endTime: Date,
  dayHourValue: number,
  nightHourValue: number
): number {
  // Clona as datas para não modificar as originais
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  // Se datas inválidas ou horário de fim antes do início, retorna 0
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return 0
  }
  
  let valorTotal = 0
  let currentTime = new Date(start)
  
  // Loop em intervalos de 1 hora até atingir o horário de fim
  while (currentTime < end) {
    const nextHour = new Date(currentTime)
    nextHour.setHours(nextHour.getHours() + 1)
    
    // Determina o final do intervalo atual (próxima hora ou horário de fim, o que vier primeiro)
    const intervalEnd = nextHour < end ? nextHour : end
    
    // Calcula a duração do intervalo em horas
    const intervalDuration = (intervalEnd.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
    
    // Determina se é horário diurno (6h00-22h00) ou noturno (22h00-6h00)
    const hora = currentTime.getHours()
    const valorHora = (hora >= 6 && hora < 22) ? dayHourValue : nightHourValue
    
    // Adiciona o valor deste intervalo
    valorTotal += valorHora * intervalDuration
    
    // Avança para o próximo intervalo
    currentTime = nextHour
  }
  
  return valorTotal
}

/**
 * Busca métricas financeiras para o dashboard
 * @returns Objeto com as métricas financeiras
 */
export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  try {
    // Obter a data atual e primeiro dia do mês
    const hoje = new Date()
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)
    
    // Buscar todos os serviços de eventos aprovados
    const servicosEventos = await db.eventsServices.findMany({
      where: {
        StoreEvents: {
          isApproved: true
        }
      },
      include: {
        StoreEvents: true,
        Mashguiach: true
      }
    })
    
    // Calcular o total de receitas de eventos aprovados
    const totalReceitasEventos = servicosEventos.reduce((total, servico) => {
      return total + (servico.mashguiachPrice || 0)
    }, 0)
    
    // Calcular o total de despesas de eventos aprovados (pagamentos aos mashguiachim)
    const totalDespesasEventos = servicosEventos.reduce((total, servico) => {
      const dayValue = servico.dayHourValue || 50 // Valor padrão se não definido
      const nightValue = servico.nightHourValue || 75 // Valor padrão se não definido
      
      const valorServico = calcularValorComFaixaHoraria(
        new Date(servico.arriveMashguiachTime),
        new Date(servico.endMashguiachTime),
        dayValue,
        nightValue
      )
      
      return total + valorServico
    }, 0)
    
    // Buscar todos os trabalhos fixos ativos
    const trabalhosFixos = await db.fixedJobs.findMany({
      where: {
        deletedAt: null
      },
      include: {
        store: true,
        mashguiach: true
      }
    })
    
    // Calcular o total de receitas de serviços fixos
    const totalReceitasServicoFixo = trabalhosFixos.reduce((total, trabalho) => {
      return total + (trabalho.price || 0)
    }, 0)
    
    // Calcular o total de despesas de serviços fixos (salários mensais)
    const totalDespesasServicoFixo = trabalhosFixos.reduce((total, trabalho) => {
      return total + (trabalho.monthly_salary || 0)
    }, 0)
    
    // Buscar serviços de eventos do mês atual (só eventos aprovados)
    const servicosEventosMesAtual = servicosEventos.filter(servico => {
      const dataServico = new Date(servico.arriveMashguiachTime)
      return dataServico >= primeiroDiaMes && dataServico <= ultimoDiaMes
    })
    
    // Calcular receitas e despesas do mês atual
    const receitasMesAtual = servicosEventosMesAtual.reduce((total, servico) => {
      return total + (servico.mashguiachPrice || 0)
    }, 0) + totalReceitasServicoFixo
    
    // Usando a nova função para calcular despesas do mês atual com faixa horária
    const despesasMesAtual = servicosEventosMesAtual.reduce((total, servico) => {
      const dayValue = servico.dayHourValue || 50 // Valor padrão se não definido
      const nightValue = servico.nightHourValue || 75 // Valor padrão se não definido
      
      const valorServico = calcularValorComFaixaHoraria(
        new Date(servico.arriveMashguiachTime),
        new Date(servico.endMashguiachTime),
        dayValue,
        nightValue
      )
      
      return total + valorServico
    }, 0) + totalDespesasServicoFixo
    
    // Calcular os top mashguiachim por faturamento
    const mashguiachimMap = new Map<string, { 
      id: string, 
      nome: string, 
      totalRecebido: number, 
      totalEventos: number 
    }>()
    
    servicosEventos.forEach(servico => {
      if (servico.mashguiachId && servico.Mashguiach) {
        const mashguiachId = servico.mashguiachId
        const dadosAtuais = mashguiachimMap.get(mashguiachId) || { 
          id: mashguiachId, 
          nome: servico.Mashguiach.name, 
          totalRecebido: 0, 
          totalEventos: 0 
        }
        
        // Calcular valor recebido pelo mashguiach neste serviço considerando faixa horária
        const dayValue = servico.dayHourValue || 50
        const nightValue = servico.nightHourValue || 75
        
        const valorRecebido = calcularValorComFaixaHoraria(
          new Date(servico.arriveMashguiachTime),
          new Date(servico.endMashguiachTime),
          dayValue,
          nightValue
        )
        
        mashguiachimMap.set(mashguiachId, {
          ...dadosAtuais,
          totalRecebido: dadosAtuais.totalRecebido + valorRecebido,
          totalEventos: dadosAtuais.totalEventos + 1
        })
      }
    })
    
    // Transformar o Map em array e ordenar por totalRecebido (decrescente)
    const topMashguiachim = Array.from(mashguiachimMap.values())
      .sort((a, b) => b.totalRecebido - a.totalRecebido)
      .slice(0, 5) // Top 5
    
    // Gerar dados para o gráfico mensal (últimos 6 meses)
    const graficoMensal = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = 5; i >= 0; i--) {
      const dataMes = new Date()
      dataMes.setMonth(dataMes.getMonth() - i)
      
      const mesPrimeiroDia = new Date(dataMes.getFullYear(), dataMes.getMonth(), 1)
      const mesUltimoDia = new Date(dataMes.getFullYear(), dataMes.getMonth() + 1, 0, 23, 59, 59)
      
      // Filtrar serviços deste mês (só eventos aprovados)
      const servicosMes = servicosEventos.filter(servico => {
        const dataServico = new Date(servico.arriveMashguiachTime)
        return dataServico >= mesPrimeiroDia && dataServico <= mesUltimoDia
      })
      
      // Calcular receitas do mês
      const receitasMes = servicosMes.reduce((total, servico) => {
        return total + (servico.mashguiachPrice || 0)
      }, 0) + totalReceitasServicoFixo
      
      // Calcular despesas do mês considerando faixa horária
      const despesasMes = servicosMes.reduce((total, servico) => {
        const dayValue = servico.dayHourValue || 50
        const nightValue = servico.nightHourValue || 75
        
        const valorServico = calcularValorComFaixaHoraria(
          new Date(servico.arriveMashguiachTime),
          new Date(servico.endMashguiachTime),
          dayValue,
          nightValue
        )
        
        return total + valorServico
      }, 0) + totalDespesasServicoFixo
      
      graficoMensal.push({
        mes: `${mesesNomes[dataMes.getMonth()]}/${dataMes.getFullYear()}`,
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      })
    }
    
    // Contagem de eventos realizados e agendados (quantidade de services com eventos aprovados)
    // Eventos realizados são os serviços de eventos aprovados com data no passado
    const eventosRealizados = servicosEventos.filter(servico => {
      const dataServico = new Date(servico.arriveMashguiachTime)
      return dataServico < hoje
    }).length
    
    // Eventos agendados são os serviços de eventos aprovados com data no futuro
    const eventosAgendados = servicosEventos.filter(servico => {
      const dataServico = new Date(servico.arriveMashguiachTime)
      return dataServico >= hoje
    }).length
    
    // Cálculos finais
    const saldoEventos = totalReceitasEventos - totalDespesasEventos
    const saldoServicoFixo = totalReceitasServicoFixo - totalDespesasServicoFixo
    const saldoMesAtual = receitasMesAtual - despesasMesAtual
    const totalReceitas = totalReceitasEventos + totalReceitasServicoFixo
    const totalDespesas = totalDespesasEventos + totalDespesasServicoFixo
    const saldoGeral = totalReceitas - totalDespesas
    
    // Quantidade de serviços fixos ativos
    const servicosFixosAtivos = trabalhosFixos.length
    
    return {
      totalReceitas,
      totalDespesas,
      saldoGeral,
      
      totalReceitasEventos,
      totalDespesasEventos,
      saldoEventos,
      eventosRealizados,
      eventosAgendados,
      
      totalReceitasServicoFixo,
      totalDespesasServicoFixo,
      saldoServicoFixo,
      servicosFixosAtivos,
      
      receitasMesAtual,
      despesasMesAtual,
      saldoMesAtual,
      
      topMashguiachim,
      graficoMensal
    }
  } catch (error) {
    console.error('Erro ao buscar métricas financeiras:', error)
    throw new Error('Erro ao buscar métricas financeiras')
  }
} 