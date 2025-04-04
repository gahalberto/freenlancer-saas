'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
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

interface Store {
  id: string
  title: string
}

const IndividualReportPage = () => {
  const { data: session, status } = useSession()
  const [mashguichimList, setMashguichimList] = useState<User[]>([])
  const [storesList, setStoresList] = useState<Store[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
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

  useEffect(() => {
    const fetchMashguichim = async () => {
      if (status === 'authenticated') {
        const data = await getAllMashguichim()
        setMashguichimList(data as User[])
      }
    }

    fetchMashguichim()
  }, [status])

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated' && selectedUserId) {
        try {
          // Buscar estabelecimentos onde o mashguiach trabalha
          const response = await fetch(`/api/admin/getUserStores?userId=${selectedUserId}`);
          if (response.ok) {
            const data = await response.json();
            setStoresList(data.stores || []);
          } else {
            console.error("Erro ao buscar estabelecimentos");
          }
        } catch (error) {
          console.error("Erro ao buscar estabelecimentos:", error);
        }
      }
    };

    // Resetar o estabelecimento selecionado quando o usuário mudar
    setSelectedStoreId('');
    fetchStores();
  }, [selectedUserId, status]);

  const generateReport = async () => {
    if (!selectedUserId) {
      alert('Por favor, selecione um mashguiach')
      return
    }

    setLoading(true)
    try {
      const data = await getTimesByUserAndMonth(
        selectedUserId, 
        selectedMonth, 
        selectedYear, 
        selectedStoreId || undefined
      )
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
    const originalContents = document.body.innerHTML;
    
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
          <title>Relatório de Horas - ${mashguichimList.find(m => m.id === selectedUserId)?.name} - ${getMonthName(selectedMonth)}/${selectedYear}</title>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale: ptBR })
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
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Relatório Individual de Horas Trabalhadas</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={3}>
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
              <CCol md={3}>
                <CFormLabel htmlFor="store">Estabelecimento</CFormLabel>
                <CFormSelect
                  id="store"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  disabled={!selectedUserId || storesList.length === 0}
                >
                  <option value="">Todos os estabelecimentos</option>
                  {storesList.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.title}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
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
              <CCol md={3}>
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
                {reportData.storeName && ` - ${reportData.storeName}`}
              </strong>
              <div>
                <CButton 
                  color="warning" 
                  className="me-2"
                  href={`/app/admin/banco-de-horas/editar?userId=${selectedUserId}&month=${selectedMonth}&year=${selectedYear}${selectedStoreId ? `&storeId=${selectedStoreId}` : ''}`}
                >
                  Editar Registros
                </CButton>
                <CButton color="secondary" onClick={handlePrint}>
                  Imprimir Relatório
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Conteúdo que será impresso */}
              <div ref={reportRef} className="report-content">
                <div className="report-header mb-4">
                  <h2 className="text-center">Relatório de Horas Trabalhadas</h2>
                  <h3 className="text-center mb-4">
                    {mashguichimList.find(m => m.id === selectedUserId)?.name} - {getMonthName(selectedMonth)}/{selectedYear}
                    {reportData.storeName && <><br />{reportData.storeName}</>}
                  </h3>
                </div>
                
                <CRow className="mb-4">
                  <CCol>
                    <h4>Resumo</h4>
                    <p><strong>Mashguiach:</strong> {mashguichimList.find(m => m.id === selectedUserId)?.name}</p>
                    <p><strong>Período:</strong> {getMonthName(selectedMonth)}/{selectedYear}</p>
                    {reportData.storeName && (
                      <p><strong>Estabelecimento:</strong> {reportData.storeName}</p>
                    )}
                    <p><strong>Total de Horas Trabalhadas:</strong> {reportData.totalHoursWorked} horas</p>
                    <p><strong>Valor por Hora:</strong> {formatCurrency(reportData.hourlyRate)}</p>
                    <p><strong>Valor Total a Pagar:</strong> {formatCurrency(reportData.totalAmount)}</p>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol>
                    <h4>Detalhamento por Dia</h4>
                    {Object.keys(reportData.entriesByDay).length > 0 ? (
                      <CTable bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Data</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Entrada</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Almoço Entrada</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Almoço Saída</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Saída</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Horas Trabalhadas</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Valor</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {Object.entries(reportData.entriesByDay).map(([day, times]: [string, any]) => (
                            <CTableRow key={day}>
                              <CTableDataCell>{formatDate(day)}</CTableDataCell>
                              <CTableDataCell>{formatTime(times.entrada)}</CTableDataCell>
                              <CTableDataCell>{formatTime(times.almoco?.entrada)}</CTableDataCell>
                              <CTableDataCell>{formatTime(times.almoco?.saida)}</CTableDataCell>
                              <CTableDataCell>{formatTime(times.saida)}</CTableDataCell>
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
                            <CTableHeaderCell colSpan={5}>Total</CTableHeaderCell>
                            <CTableHeaderCell>{reportData.totalHoursWorked} horas</CTableHeaderCell>
                            <CTableHeaderCell>{formatCurrency(reportData.totalAmount)}</CTableHeaderCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    ) : (
                      <div className="alert alert-info">
                        Nenhum registro de ponto encontrado para o período e filtros selecionados.
                      </div>
                    )}
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

export default IndividualReportPage 