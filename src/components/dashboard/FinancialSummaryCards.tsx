'use client'

import { FinancialMetrics } from '@/app/_actions/dashboard/financeiro/getFinancialMetrics'
import {
  CCol,
  CRow,
  CWidgetStatsF,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilMoney,
  cilArrowTop,
  cilArrowBottom,
  cilWallet,
  cilCalendar,
  cilBriefcase,
  cilInstitution,
} from '@coreui/icons'
import { formatCurrency } from '@/app/_lib/formatters'

interface FinancialSummaryCardsProps {
  financialData: FinancialMetrics
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ financialData }) => {
  return (
    <CRow>
      {/* Resumo Geral */}
      <CCol sm={6} lg={3}>
        <CWidgetStatsF
          className="mb-3"
          color={financialData.saldoGeral >= 0 ? 'success' : 'danger'}
          icon={<CIcon icon={cilWallet} height={24} />}
          title="Saldo Geral"
          value={formatCurrency(financialData.saldoGeral)}
          footer={
            <div className="d-flex justify-content-between">
              <div>
                <span className="text-success">
                  <CIcon icon={cilArrowTop} /> {formatCurrency(financialData.totalReceitas)}
                </span>
              </div>
              <div>
                <span className="text-danger">
                  <CIcon icon={cilArrowBottom} /> {formatCurrency(financialData.totalDespesas)}
                </span>
              </div>
            </div>
          }
        />
      </CCol>

      {/* Resumo Mês Atual */}
      <CCol sm={6} lg={3}>
        <CWidgetStatsF
          className="mb-3"
          color={financialData.saldoMesAtual >= 0 ? 'success' : 'danger'}
          icon={<CIcon icon={cilCalendar} height={24} />}
          title="Saldo Mês Atual"
          value={formatCurrency(financialData.saldoMesAtual)}
          footer={
            <div className="d-flex justify-content-between">
              <div>
                <span className="text-success">
                  <CIcon icon={cilArrowTop} /> {formatCurrency(financialData.receitasMesAtual)}
                </span>
              </div>
              <div>
                <span className="text-danger">
                  <CIcon icon={cilArrowBottom} /> {formatCurrency(financialData.despesasMesAtual)}
                </span>
              </div>
            </div>
          }
        />
      </CCol>

      {/* Resumo Eventos */}
      <CCol sm={6} lg={3}>
        <CWidgetStatsF
          className="mb-3"
          color="info"
          icon={<CIcon icon={cilInstitution} height={24} />}
          title="Serviços de Eventos"
          value={financialData.eventosRealizados.toString()}
          footer={
            <div className="d-flex justify-content-between">
              <div>
                <span className="text-medium-emphasis">
                  {formatCurrency(financialData.totalReceitasEventos)}
                </span>
              </div>
              <div>
                <span className="text-medium-emphasis">
                  {financialData.eventosAgendados}
                </span>
              </div>
            </div>
          }
        />
      </CCol>

      {/* Resumo Serviços Fixos */}
      <CCol sm={6} lg={3}>
        <CWidgetStatsF
          className="mb-3"
          color="warning"
          icon={<CIcon icon={cilBriefcase} height={24} />}
          title="Serviços Fixos"
          value={financialData.servicosFixosAtivos.toString()}
          footer={
            <div className="d-flex justify-content-between">
              <div>
                <span className="text-medium-emphasis">
                  {formatCurrency(financialData.totalReceitasServicoFixo)}
                </span>
              </div>
              <div>
                <span className="text-medium-emphasis">
                  {formatCurrency(financialData.totalDespesasServicoFixo)}
                </span>
              </div>
            </div>
          }
        />
      </CCol>
    </CRow>
  )
}

export default FinancialSummaryCards 