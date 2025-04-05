'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react-pro'
import { DailyEventCount } from '@/app/_actions/dashboard/getEstablishmentMetrics'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface EstablishmentBarChartProps {
  dailyEvents: DailyEventCount[]
}

const EstablishmentBarChart: React.FC<EstablishmentBarChartProps> = ({ dailyEvents }) => {
  // Cores para o gráfico
  const colors = {
    primary: '#321fdb',
    info: '#39f',
    danger: '#e55353',
    warning: '#f9b115',
    success: '#2eb85c',
    transparent: 'transparent',
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context: any) {
            return `${context[0].label}`
          },
          label: function(context: any) {
            return `Eventos: ${context.raw}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Para mostrar apenas números inteiros no eixo Y
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  }

  const data = {
    labels: dailyEvents.map(item => item.formattedDate),
    datasets: [
      {
        label: 'Quantidade de Eventos',
        data: dailyEvents.map(item => item.count),
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 40,
      },
    ],
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CCardTitle>Eventos Diários (últimos 7 dias)</CCardTitle>
        <p className="text-medium-emphasis small">
          Distribução de eventos realizados nos últimos 7 dias
        </p>
      </CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <Bar options={options} data={data} />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default EstablishmentBarChart 