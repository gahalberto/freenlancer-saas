'use client'

import { CCard, CCardBody, CCardHeader, CCardTitle, CCol, CRow } from '@coreui/react-pro'
import { FinancialMetrics } from '@/app/_actions/dashboard/financeiro/getFinancialMetrics'
import { CChart } from '@coreui/react-chartjs'
import { formatCurrency } from '@/app/_lib/formatters'

interface FinancialChartProps {
  financialData: FinancialMetrics
}

const FinancialChart: React.FC<FinancialChartProps> = ({ financialData }) => {
  // Extrair dados para os gráficos
  const meses = financialData.graficoMensal.map(item => item.mes)
  const receitas = financialData.graficoMensal.map(item => item.receitas)
  const despesas = financialData.graficoMensal.map(item => item.despesas)
  const saldos = financialData.graficoMensal.map(item => item.saldo)
  
  // Dados para o gráfico de top mashguiachim
  const nomesMashguiachim = financialData.topMashguiachim.map(item => item.nome)
  const valoresMashguiachim = financialData.topMashguiachim.map(item => item.totalRecebido)

  return (
    <CRow>
      <CCol xs={12} lg={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>Desempenho Financeiro - Últimos 6 Meses</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CChart
              type="line"
              data={{
                labels: meses,
                datasets: [
                  {
                    label: 'Receitas',
                    backgroundColor: 'rgba(46, 184, 92, 0.2)',
                    borderColor: 'rgba(46, 184, 92, 1)',
                    pointBackgroundColor: 'rgba(46, 184, 92, 1)',
                    pointBorderColor: '#fff',
                    data: receitas,
                    tension: 0.4,
                  },
                  {
                    label: 'Despesas',
                    backgroundColor: 'rgba(229, 83, 83, 0.2)',
                    borderColor: 'rgba(229, 83, 83, 1)',
                    pointBackgroundColor: 'rgba(229, 83, 83, 1)',
                    pointBorderColor: '#fff',
                    data: despesas,
                    tension: 0.4,
                  },
                  {
                    label: 'Saldo',
                    backgroundColor: 'rgba(51, 153, 255, 0.2)',
                    borderColor: 'rgba(51, 153, 255, 1)',
                    pointBackgroundColor: 'rgba(51, 153, 255, 1)',
                    pointBorderColor: '#fff',
                    data: saldos,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(Number(value));
                      }
                    }
                  }
                }
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12} lg={4}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>Top 5 Mashguiachim por Faturamento</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CChart
              type="bar"
              data={{
                labels: nomesMashguiachim,
                datasets: [
                  {
                    label: 'Valor Recebido (R$)',
                    backgroundColor: 'rgba(51, 153, 255, 0.7)',
                    data: valoresMashguiachim,
                  },
                ],
              }}
              options={{
                responsive: true,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.x !== null) {
                          label += formatCurrency(context.parsed.x);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(Number(value));
                      }
                    }
                  }
                }
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FinancialChart 