'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
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
import { User } from '@prisma/client'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getTimesByUserAndMonth } from '@/app/_actions/time-entries/getTimesByUserAndMonth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const IndividualReportPage = () => {
  const { data: session, status } = useSession()
  const [mashguichimList, setMashguichimList] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchMashguichim = async () => {
      if (status === 'authenticated') {
        const data = await getAllMashguichim()
        setMashguichimList(data as User[])
      }
    }

    fetchMashguichim()
  }, [status])

  const generateReport = async () => {
    if (!selectedUserId) {
      alert('Por favor, selecione um mashguiach')
      return
    }

    setLoading(true)
    try {
      const data = await getTimesByUserAndMonth(selectedUserId, selectedMonth, selectedYear)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
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
          <strong>Relatório Individual de Horas Trabalhadas</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="mashguiach">Mashguiach</CFormLabel>
                <CFormSelect
                  id="mashguiach"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Selecione um mashguiach</option>
                  {mashguichimList.map((mashguiach) => (
                    <option key={mashguiach.id} value={mashguiach.id}>
                      {mashguiach.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
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
              <CCol md={4}>
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
                Relatório de Horas - {mashguichimList.find(m => m.id === selectedUserId)?.name} - {getMonthName(selectedMonth)}/{selectedYear}
              </strong>
              <CButton color="secondary" onClick={handlePrint} className="print:hidden">
                Imprimir
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-4">
                <CCol>
                  <h4>Resumo</h4>
                  <p><strong>Mashguiach:</strong> {mashguichimList.find(m => m.id === selectedUserId)?.name}</p>
                  <p><strong>Período:</strong> {getMonthName(selectedMonth)}/{selectedYear}</p>
                  <p><strong>Total de Horas Trabalhadas:</strong> {reportData.totalHoursWorked} horas</p>
                  <p><strong>Valor por Hora:</strong> {formatCurrency(reportData.hourlyRate)}</p>
                  <p><strong>Valor Total a Pagar:</strong> {formatCurrency(reportData.totalAmount)}</p>
                </CCol>
              </CRow>

              <CRow>
                <CCol>
                  <h4>Detalhamento por Dia</h4>
                  <CTable bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Data</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Entrada</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Saída</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Horas Trabalhadas</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Valor</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Object.entries(reportData.entriesByDay).map(([day, times]: [string, any]) => (
                        <CTableRow key={day}>
                          <CTableDataCell>{formatDate(day)}</CTableDataCell>
                          <CTableDataCell>
                            {times.entrada ? format(new Date(times.entrada), 'HH:mm', { locale: ptBR }) : '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {times.saida ? format(new Date(times.saida), 'HH:mm', { locale: ptBR }) : '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {reportData.hoursWorkedByDay[day] ? `${reportData.hoursWorkedByDay[day]} horas` : '-'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {reportData.hoursWorkedByDay[day] 
                              ? formatCurrency(reportData.hoursWorkedByDay[day] * reportData.hourlyRate) 
                              : '-'}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow className="table-primary">
                        <CTableHeaderCell colSpan={3}>Total</CTableHeaderCell>
                        <CTableHeaderCell>{reportData.totalHoursWorked} horas</CTableHeaderCell>
                        <CTableHeaderCell>{formatCurrency(reportData.totalAmount)}</CTableHeaderCell>
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

export default IndividualReportPage 