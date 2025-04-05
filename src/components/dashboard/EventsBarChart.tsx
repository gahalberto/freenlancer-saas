'use client'

import { CCard, CCardBody, CCardHeader, CCardTitle, CAlert, CSpinner, CButton } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilChartLine, cilSync } from '@coreui/icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Carregar o componente de gráfico com dynamic import (para evitar problemas de SSR)
const CChartBar = dynamic(() => import('@coreui/react-chartjs').then(mod => mod.CChartBar), {
  ssr: false, // Isto é importante para evitar problemas de renderização no servidor
  loading: () => (
    <div style={{ height: '400px' }} className="d-flex align-items-center justify-content-center">
      <CSpinner color="primary" />
      <span className="ms-2">Carregando gráfico...</span>
    </div>
  )
})

// Interface para os dados diários de eventos
interface DailyEventCount {
  date: string
  total: number
  approved: number
  pending: number
}

interface EventsBarChartProps {
  dailyEvents: DailyEventCount[]
  startDate: Date | null
  endDate: Date | null
  formatDate: (date: Date) => string
  onRefresh?: () => Promise<void>
}

export default function EventsBarChart({ dailyEvents, startDate, endDate, formatDate, onRefresh }: EventsBarChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Função para manipular a atualização do gráfico
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Erro ao atualizar gráfico:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  // Preparar dados para o gráfico de eventos por dia
  const chartData = {
    labels: dailyEvents.map(day => {
      // Formatar a data para exibição mais amigável (DD/MM)
      const date = new Date(day.date)
      return format(date, 'dd/MM')
    }),
    datasets: [
      {
        label: 'Total de Eventos',
        backgroundColor: 'rgba(0, 123, 255, 0.6)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
        data: dailyEvents.map(day => day.total),
      },
      {
        label: 'Aprovados',
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1,
        data: dailyEvents.map(day => day.approved),
      },
      {
        label: 'Pendentes',
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
        data: dailyEvents.map(day => day.pending),
      },
    ],
  }

  // Opções do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Eventos por Dia',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            // Format tooltip title to be more readable
            const idx = tooltipItems[0].dataIndex
            const date = dailyEvents[idx] ? new Date(dailyEvents[idx].date) : null
            return date ? format(date, 'dd/MM/yyyy (EEEE)', { locale: ptBR }) : ''
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CCardTitle>
          <div className="d-flex align-items-center">
            <CIcon icon={cilChartLine} className="me-2" />
            <strong>Eventos por Dia</strong>
          </div>
        </CCardTitle>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-gray-400">
            {startDate && endDate 
              ? `Distribuição de eventos no período de ${formatDate(startDate)} até ${formatDate(endDate)}`
              : 'Distribuição de eventos no último mês'}
          </span>
          {onRefresh && (
            <CButton 
              color="info" 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              className="ms-2"
              title="Atualizar gráfico"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <CSpinner size="sm" color="info" />
              ) : (
                <CIcon icon={cilSync} size="sm" />
              )}
            </CButton>
          )}
        </div>
      </CCardHeader>
      <CCardBody>
        {!isMounted ? (
          <div style={{ height: '400px' }} className="d-flex align-items-center justify-content-center">
            <CSpinner color="primary" />
            <span className="ms-2">Preparando gráfico...</span>
          </div>
        ) : hasError ? (
          <CAlert color="danger">
            Ocorreu um erro ao renderizar o gráfico. Por favor, tente novamente mais tarde.
          </CAlert>
        ) : dailyEvents.length > 0 ? (
          <div style={{ height: '400px' }} id="eventsBarChart">
            <CChartBar 
              data={chartData} 
              options={chartOptions} 
              onError={() => setHasError(true)} 
            />
          </div>
        ) : (
          <CAlert color="info">
            Nenhum evento encontrado no período selecionado para exibir no gráfico.
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
} 