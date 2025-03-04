'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef } from 'react'
// @ts-ignore
import ReactToPrint from 'react-to-print'
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
  
  // Referência para o componente que será impresso
  const reportRef = useRef<HTMLDivElement>(null)

  // Função para obter o nome do mês
  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1)
    return format(date, 'MMMM', { locale: ptBR })
  }

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
    const printContents = reportRef.current?.innerHTML || '';
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o relatório');
      return;
    }
    
    // Adicionar estilos e conteúdo à nova janela
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Mensal de Horas - ${getMonthName(selectedMonth)}/${selectedYear}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20mm;
            }
            .report-header {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .table-primary th {
              background-color: #cfe2ff;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    
    // Imprimir e fechar a janela
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

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
      <CCard className="mb-4">
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
              <CButton color="secondary" onClick={handlePrint}>
                Imprimir Relatório
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Conteúdo que será impresso */}
              <div ref={reportRef} className="report-content">
                <div className="report-header mb-4">
                  <h2 className="text-center">Relatório Mensal de Horas Trabalhadas</h2>
                  <h3 className="text-center mb-4">{getMonthName(selectedMonth)}/{selectedYear}</h3>
                </div>
                
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
                          <CTableHeaderCell scope="col">Dias Trabalhados</CTableHeaderCell>
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
                            <CTableDataCell>{Object.keys(userReport.entriesByDay).length}</CTableDataCell>
                            <CTableDataCell>{userReport.totalHoursWorked} horas</CTableDataCell>
                            <CTableDataCell>{formatCurrency(userReport.hourlyRate)}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(userReport.totalAmount)}</CTableDataCell>
                          </CTableRow>
                        ))}
                        <CTableRow className="table-primary">
                          <CTableHeaderCell colSpan={4}>Total</CTableHeaderCell>
                          <CTableHeaderCell>{reportData.totalHoursAllUsers} horas</CTableHeaderCell>
                          <CTableHeaderCell>-</CTableHeaderCell>
                          <CTableHeaderCell>{formatCurrency(reportData.totalAmountAllUsers)}</CTableHeaderCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </CCol>
                </CRow>
              </div>
            </CCardBody>
          </CCard>
        </>
      )}
    </>
  )
}

export default MonthlyReportPage 