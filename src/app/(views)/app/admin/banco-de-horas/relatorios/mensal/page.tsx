'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { getAllFixedJobsTimesByMonth } from '@/app/_actions/time-entries/getAllFixedJobsTimesByMonth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MonthlyReportPage = () => {
  const { data: session, status } = useSession()
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const data = await getAllFixedJobsTimesByMonth(selectedMonth, selectedYear)
      setReportData(data)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Ocorreu um erro ao gerar o relatório')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1)
    return format(date, 'MMMM', { locale: ptBR })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }

  return (
    <>
      <CCard className="mb-4 print:hidden">
        <CCardHeader>
          <strong>Relatório Mensal de Horas Trabalhadas - Todos os Mashguichim</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="month">Mês</CFormLabel>
                <CFormSelect
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="year">Ano</CFormLabel>
                <CFormInput
                  id="year"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton
                  color="primary"
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {reportData && (
        <>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>
                Relatório Mensal de Horas - {getMonthName(selectedMonth)}/{selectedYear}
              </strong>
              <CButton color="secondary" onClick={handlePrint} className="print:hidden">
                Imprimir
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-4">
                <CCol>
                  <h4>Resumo Geral</h4>
                  <p><strong>Período:</strong> {getMonthName(selectedMonth)}/{selectedYear}</p>
                  <p><strong>Total de Mashguichim:</strong> {reportData.usersReport.length}</p>
                  <p><strong>Total de Horas Trabalhadas:</strong> {reportData.totalHoursAllUsers} horas</p>
                  <p><strong>Valor Total a Pagar:</strong> {formatCurrency(reportData.totalAmountAllUsers)}</p>
                </CCol>
              </CRow>

              <CRow>
                <CCol>
                  <h4>Detalhamento por Mashguiach</h4>
                  <CTable bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Mashguiach</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Estabelecimento</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Horas Trabalhadas</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Valor por Hora</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Valor Total</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportData.usersReport.map((userReport: any, index: number) => (
                        <CTableRow key={userReport.job.id}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{userReport.job.mashguiach.name}</CTableDataCell>
                          <CTableDataCell>{userReport.job.store.title}</CTableDataCell>
                          <CTableDataCell>{userReport.totalHoursWorked} horas</CTableDataCell>
                          <CTableDataCell>{formatCurrency(userReport.hourlyRate)}</CTableDataCell>
                          <CTableDataCell>{formatCurrency(userReport.totalAmount)}</CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow className="table-primary">
                        <CTableHeaderCell colSpan={3}>Total</CTableHeaderCell>
                        <CTableHeaderCell>{reportData.totalHoursAllUsers} horas</CTableHeaderCell>
                        <CTableHeaderCell>-</CTableHeaderCell>
                        <CTableHeaderCell>{formatCurrency(reportData.totalAmountAllUsers)}</CTableHeaderCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </>
      )}
    </>
  )
}

export default MonthlyReportPage 