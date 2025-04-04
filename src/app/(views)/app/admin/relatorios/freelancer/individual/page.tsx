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
  CBadge
} from '@coreui/react-pro'
import { User } from '@prisma/client'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getFreelancerReportByIdAndDates } from '@/app/_actions/reports/getFreelancerReportByIdAndDates'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

interface Store {
  id: string
  title: string
}

const FreelancerIndividualReportPage = () => {
  const { data: session, status } = useSession()
  const [mashguichimList, setMashguichimList] = useState<User[]>([])
  const [storesList, setStoresList] = useState<Store[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showByStore, setShowByStore] = useState<boolean>(false)
  
  // Referência para o componente que será impresso
  const reportRef = useRef<HTMLDivElement>(null)

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

    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim')
      return
    }

    setLoading(true)
    try {
      const result = await getFreelancerReportByIdAndDates(
        selectedUserId,
        new Date(startDate),
        new Date(endDate),
        selectedStoreId || undefined
      )
      console.log("Dados retornados do relatório:", result);
      console.log("Primeiro serviço:", result.services[0]);
      setReportData(result)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      toast.error("Erro ao gerar relatório. Por favor, tente novamente.")
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
          <title>Relatório de Serviços Freelancer - ${reportData?.mashguiach?.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20mm;
              color: #333;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .report-subtitle {
              color: #555;
              font-size: 1.1em;
              margin-bottom: 10px;
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
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .summary-section {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .store-section {
              margin-top: 40px;
              margin-bottom: 30px;
              page-break-before: always;
            }
            .store-title {
              font-size: 1.3em;
              color: #333;
              border-bottom: 2px solid #666;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .total-row {
              font-weight: bold;
              background-color: #e8f4ff;
            }
            .badge {
              display: inline-block;
              padding: 3px 6px;
              border-radius: 3px;
              font-size: 0.85em;
              font-weight: bold;
            }
            .badge-success {
              background-color: #d4edda;
              color: #155724;
            }
            .badge-danger {
              background-color: #f8d7da;
              color: #721c24;
            }
            .observation-text {
              font-style: italic;
              color: #555;
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

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
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
          <strong>Relatório Individual de Serviços Freelancer</strong>
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
                <CFormLabel htmlFor="startDate">Data Inicial</CFormLabel>
                <CFormInput
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="endDate">Data Final</CFormLabel>
                <CFormInput
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton
                  color="primary"
                  onClick={generateReport}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </CButton>
                {reportData && (
                  <CButton
                    color="secondary"
                    onClick={() => setShowByStore(!showByStore)}
                    className="me-2"
                  >
                    {showByStore 
                      ? 'Visualizar Lista Completa' 
                      : 'Agrupar por Estabelecimento'
                    }
                  </CButton>
                )}
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
                Relatório de Serviços Freelancer - {reportData.mashguiach.name}
                {reportData.selectedStoreName && ` - ${reportData.selectedStoreName}`}
              </strong>
              <div>
                <CButton color="secondary" onClick={handlePrint}>
                  Imprimir Relatório
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Conteúdo que será impresso */}
              <div ref={reportRef} className="report-content">
                <div className="report-header mb-4">
                  <h2 className="text-center">Relatório de Serviços Freelancer</h2>
                  <h3 className="text-center">{reportData.mashguiach.name}</h3>
                  <p className="text-center report-subtitle">
                    Período: {formatDate(reportData.startDate)} a {formatDate(reportData.endDate)}
                    {reportData.selectedStoreName && <><br />{reportData.selectedStoreName}</>}
                  </p>
                </div>
                
                <CRow className="mb-4">
                  <CCol>
                    <div className="summary-section">
                      <h4>Dados do Mashguiach</h4>
                      <p><strong>Nome:</strong> {reportData.mashguiach.name}</p>
                      <p><strong>Telefone:</strong> {reportData.mashguiach.phone || "Não informado"}</p>
                      <p><strong>Email:</strong> {reportData.mashguiach.email || "Não informado"}</p>
                      <p><strong>Chave PIX:</strong> {reportData.mashguiach.pixKey || "Não informada"}</p>
                      <h4 className="mt-4">Resumo Financeiro</h4>
                      <p><strong>Total de Serviços:</strong> {reportData.totalServices}</p>
                      <p><strong>Total de Horas Trabalhadas:</strong> {reportData.totalHours} horas</p>
                      <p><strong>Horas Diurnas:</strong> {reportData.totalDayHours} horas ({formatCurrency(reportData.totalDayValue)})</p>
                      <p><strong>Horas Noturnas:</strong> {reportData.totalNightHours} horas ({formatCurrency(reportData.totalNightValue)})</p>
                      <p><strong>Valor do Transporte:</strong> {formatCurrency(reportData.totalTransport)}</p>
                      <p><strong>Valor Total a Receber:</strong> {formatCurrency(reportData.totalValueWithTransport)}</p>
                    </div>
                  </CCol>
                </CRow>

                {!showByStore && (
                  <CRow>
                    <CCol>
                      <h4>Detalhamento dos Serviços</h4>
                      {reportData.services.length > 0 ? (
                        <CTable bordered responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell>Data</CTableHeaderCell>
                              <CTableHeaderCell>Evento</CTableHeaderCell>
                              <CTableHeaderCell>Estabelecimento</CTableHeaderCell>
                              <CTableHeaderCell>Entrada</CTableHeaderCell>
                              <CTableHeaderCell>Saída</CTableHeaderCell>
                              <CTableHeaderCell>Horas Diurnas</CTableHeaderCell>
                              <CTableHeaderCell>Horas Noturnas</CTableHeaderCell>
                              <CTableHeaderCell>Valor Diurno</CTableHeaderCell>
                              <CTableHeaderCell>Valor Noturno</CTableHeaderCell>
                              <CTableHeaderCell>Transporte</CTableHeaderCell>
                              <CTableHeaderCell>Total</CTableHeaderCell>
                              <CTableHeaderCell>Status</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {reportData.services.map((service: any) => (
                              <CTableRow key={service.id}>
                                <CTableDataCell>{formatDate(service.date)}</CTableDataCell>
                                <CTableDataCell>{service.eventTitle}</CTableDataCell>
                                <CTableDataCell>{service.storeName}</CTableDataCell>
                                <CTableDataCell>{formatTime(service.startTime)}</CTableDataCell>
                                <CTableDataCell>{formatTime(service.endTime)}</CTableDataCell>
                                <CTableDataCell>{service.dayHours} h (R${service.dayHourValue || 50}/h)</CTableDataCell>
                                <CTableDataCell>{service.nightHours} h (R${service.nightHourValue || 75}/h)</CTableDataCell>
                                <CTableDataCell>{formatCurrency(service.dayValue)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(service.nightValue)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(service.transportValue)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(service.totalValue)}</CTableDataCell>
                                <CTableDataCell>
                                  {service.hasRealTimes ? (
                                    <CBadge color="success">Check-in realizado</CBadge>
                                  ) : (
                                    <CBadge color="danger">Sem check-in</CBadge>
                                  )}
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                            <CTableRow className="total-row">
                              <CTableDataCell colSpan={5}>Total</CTableDataCell>
                              <CTableDataCell>{reportData.totalDayHours} h</CTableDataCell>
                              <CTableDataCell>{reportData.totalNightHours} h</CTableDataCell>
                              <CTableDataCell>{formatCurrency(reportData.totalDayValue)}</CTableDataCell>
                              <CTableDataCell>{formatCurrency(reportData.totalNightValue)}</CTableDataCell>
                              <CTableDataCell>{formatCurrency(reportData.totalTransport)}</CTableDataCell>
                              <CTableDataCell>{formatCurrency(reportData.totalValue + reportData.totalTransport)}</CTableDataCell>
                              <CTableDataCell></CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      ) : (
                        <div className="alert alert-info">
                          Nenhum serviço encontrado para o período e filtros selecionados.
                        </div>
                      )}
                    </CCol>
                  </CRow>
                )}

                {showByStore && Object.keys(reportData.servicesByStore).length > 0 && (
                  <>
                    {Object.entries(reportData.servicesByStore).map(([storeId, services]: [string, any]) => {
                      // Calcular totais por estabelecimento
                      let storeHours = 0;
                      let storeDayHours = 0;
                      let storeNightHours = 0;
                      let storeDayValue = 0;
                      let storeNightValue = 0;
                      let storeValue = 0;
                      let storeTransport = 0;
                      
                      services.forEach((service: any) => {
                        storeHours += service.hours;
                        storeDayHours += service.dayHours;
                        storeNightHours += service.nightHours;
                        storeDayValue += service.dayValue;
                        storeNightValue += service.nightValue;
                        storeValue += service.value;
                        storeTransport += service.transportValue;
                      });

                      return (
                        <div key={storeId} className="store-section">
                          <h4 className="store-title">{services[0].storeName}</h4>
                          <CTable bordered responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Data</CTableHeaderCell>
                                <CTableHeaderCell>Evento</CTableHeaderCell>
                                <CTableHeaderCell>Entrada</CTableHeaderCell>
                                <CTableHeaderCell>Saída</CTableHeaderCell>
                                <CTableHeaderCell>Horas Diurnas</CTableHeaderCell>
                                <CTableHeaderCell>Horas Noturnas</CTableHeaderCell>
                                <CTableHeaderCell>Valor Diurno</CTableHeaderCell>
                                <CTableHeaderCell>Valor Noturno</CTableHeaderCell>
                                <CTableHeaderCell>Transporte</CTableHeaderCell>
                                <CTableHeaderCell>Total</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {services.map((service: any) => (
                                <CTableRow key={service.id}>
                                  <CTableDataCell>{formatDate(service.date)}</CTableDataCell>
                                  <CTableDataCell>{service.eventTitle}</CTableDataCell>
                                  <CTableDataCell>{formatTime(service.startTime)}</CTableDataCell>
                                  <CTableDataCell>{formatTime(service.endTime)}</CTableDataCell>
                                  <CTableDataCell>{service.dayHours} h (R${service.dayHourValue || 50}/h)</CTableDataCell>
                                  <CTableDataCell>{service.nightHours} h (R${service.nightHourValue || 75}/h)</CTableDataCell>
                                  <CTableDataCell>{formatCurrency(service.dayValue)}</CTableDataCell>
                                  <CTableDataCell>{formatCurrency(service.nightValue)}</CTableDataCell>
                                  <CTableDataCell>{formatCurrency(service.transportValue)}</CTableDataCell>
                                  <CTableDataCell>{formatCurrency(service.totalValue)}</CTableDataCell>
                                  <CTableDataCell>
                                    {service.hasRealTimes ? (
                                      <CBadge color="success">Check-in realizado</CBadge>
                                    ) : (
                                      <CBadge color="danger">Sem check-in</CBadge>
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                              <CTableRow className="total-row">
                                <CTableDataCell colSpan={4}>Total {services[0].storeName}</CTableDataCell>
                                <CTableDataCell>{storeDayHours.toFixed(2)} h</CTableDataCell>
                                <CTableDataCell>{storeNightHours.toFixed(2)} h</CTableDataCell>
                                <CTableDataCell>{formatCurrency(storeDayValue)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(storeNightValue)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(storeTransport)}</CTableDataCell>
                                <CTableDataCell>{formatCurrency(storeValue + storeTransport)}</CTableDataCell>
                                <CTableDataCell></CTableDataCell>
                              </CTableRow>
                            </CTableBody>
                          </CTable>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Observações e legenda */}
                <CRow className="mt-4">
                  <CCol>
                    <h5>Observações</h5>
                    <p>
                      <strong>Check-in realizado:</strong> Indica que o mashguiach registrou entrada e saída no sistema.
                    </p>
                    <p>
                      <strong>Sem check-in:</strong> O mashguiach não registrou entrada e saída. Os horários são baseados no agendamento ou foram inseridos pelo administrador.
                    </p>
                    <p>
                      <strong>Valores:</strong> Hora diurna (6h às 22h) e hora noturna (22h às 6h) são calculadas com valores diferentes.
                    </p>
                    <p>
                      <strong>Total:</strong> Soma dos valores dos serviços mais o valor do transporte.
                    </p>
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

export default FreelancerIndividualReportPage 