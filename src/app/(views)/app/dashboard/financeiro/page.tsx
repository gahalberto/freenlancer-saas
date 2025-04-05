'use client'

import { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCardTitle, CCol, CContainer, CRow, CSpinner } from '@coreui/react-pro'
import { useSession } from 'next-auth/react'
import FinancialSummaryCards from '@/components/dashboard/FinancialSummaryCards'
import FinancialChart from '@/components/dashboard/FinancialChart'
import FinancialTables from '@/components/dashboard/FinancialTables'
import { getFinancialMetrics, FinancialMetrics } from '@/app/_actions/dashboard/financeiro/getFinancialMetrics'
import DashboardAlert from '@/components/dashboard/DashboardAlert'

const FinancialDashboard = () => {
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getFinancialMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <CCard className="mb-4">
        <CCardBody>
          <p className="text-center">Erro ao carregar dados financeiros. Por favor, tente novamente mais tarde.</p>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CContainer fluid>
      <CRow>
        <CCol xs={12}>
          <h2 className="mb-4">Dashboard Financeiro</h2>
          <p className="text-muted">
            Todas as métricas são baseadas em serviços com eventos aprovados. 
            Os cálculos consideram valores diferenciados para horário diurno (6h às 22h) e noturno (22h às 6h).
          </p>
        </CCol>
      </CRow>

      <DashboardAlert />

      {/* Cards de resumo financeiro */}
      <FinancialSummaryCards financialData={metrics} />

      {/* Gráficos financeiros */}
      <FinancialChart financialData={metrics} />

      {/* Tabelas financeiras */}
      <FinancialTables financialData={metrics} />
    </CContainer>
  )
}

export default FinancialDashboard 