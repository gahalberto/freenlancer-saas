'use client'

import { FinancialMetrics } from '@/app/_actions/dashboard/financeiro/getFinancialMetrics'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
} from '@coreui/react-pro'
import { formatCurrency } from '@/app/_lib/formatters'
import Link from 'next/link'

interface FinancialTablesProps {
  financialData: FinancialMetrics
}

const FinancialTables: React.FC<FinancialTablesProps> = ({ financialData }) => {
  return (
    <CRow>
      <CCol xs={12} lg={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>
              <strong>Top Mashguiachim</strong>
            </CCardTitle>
            <span className="text-gray-400">
              Por valor recebido nos serviços aprovados (considerando taxas diurnas e noturnas)
            </span>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nome</CTableHeaderCell>
                  <CTableHeaderCell>Total Recebido</CTableHeaderCell>
                  <CTableHeaderCell>Eventos</CTableHeaderCell>
                  <CTableHeaderCell>Média por Evento</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {financialData.topMashguiachim.map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell>{item.nome}</CTableDataCell>
                    <CTableDataCell>{formatCurrency(item.totalRecebido)}</CTableDataCell>
                    <CTableDataCell>{item.totalEventos}</CTableDataCell>
                    <CTableDataCell>
                      {item.totalEventos > 0
                        ? formatCurrency(item.totalRecebido / item.totalEventos)
                        : formatCurrency(0)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12} lg={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>
              <strong>Desempenho Mensal</strong>
            </CCardTitle>
            <span className="text-gray-400">
              Últimos 6 meses (eventos aprovados, calculados com valores diurnos/noturnos)
            </span>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Mês</CTableHeaderCell>
                  <CTableHeaderCell>Receitas</CTableHeaderCell>
                  <CTableHeaderCell>Despesas</CTableHeaderCell>
                  <CTableHeaderCell>Saldo</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {financialData.graficoMensal.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{item.mes}</CTableDataCell>
                    <CTableDataCell className="text-success">{formatCurrency(item.receitas)}</CTableDataCell>
                    <CTableDataCell className="text-danger">{formatCurrency(item.despesas)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={item.saldo >= 0 ? 'success' : 'danger'}>
                        {formatCurrency(item.saldo)}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <CCardTitle>
                <strong>Relatórios Detalhados</strong>
              </CCardTitle>
              <span className="text-gray-400">
                Métricas baseadas em serviços com eventos aprovados, usando taxas diferenciadas por horário
              </span>
            </div>
            <div className="d-flex gap-2">
              <Link href="/app?financial=true">
                <CButton color="primary" size="sm">
                  Relatório de Eventos
                </CButton>
              </Link>
              <Link href="/app?financial=true">
                <CButton color="success" size="sm">
                  Relatório de Serviços Fixos
                </CButton>
              </Link>
              <Link href="/app?financial=true">
                <CButton color="info" size="sm">
                  Relatório de Mashguiachim
                </CButton>
              </Link>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4">
              <CCol xs={12}>
                <div className="alert alert-info">
                  <h6 className="alert-heading fw-bold">Cálculo de Valores por Faixa Horária</h6>
                  <p className="mb-0">
                    Os valores pagos aos Mashguiachim são calculados com base em taxas diferenciadas por horário:
                  </p>
                  <ul className="mb-0">
                    <li><strong>Horário Diurno (6h às 22h):</strong> Valor padrão conforme dayHourValue do serviço</li>
                    <li><strong>Horário Noturno (22h às 6h):</strong> Valor padrão conforme nightHourValue do serviço</li>
                  </ul>
                </div>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} md={4}>
                <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                  <div className="text-medium-emphasis small">Receita Total (Eventos Aprovados)</div>
                  <div className="fs-5 fw-semibold">{formatCurrency(financialData.totalReceitas)}</div>
                </div>
              </CCol>
              <CCol xs={12} md={4}>
                <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                  <div className="text-medium-emphasis small">Despesa Total</div>
                  <div className="fs-5 fw-semibold">{formatCurrency(financialData.totalDespesas)}</div>
                </div>
              </CCol>
              <CCol xs={12} md={4}>
                <div className={`border-start border-start-4 border-start-${financialData.saldoGeral >= 0 ? 'info' : 'warning'} py-1 px-3 mb-3`}>
                  <div className="text-medium-emphasis small">Saldo Líquido</div>
                  <div className="fs-5 fw-semibold">{formatCurrency(financialData.saldoGeral)}</div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FinancialTables 