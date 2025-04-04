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
  CBadge,
  CCollapse,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody
} from '@coreui/react-pro'
import { getStoreFreelancersReport } from '@/app/_actions/reports/getStoreFreelancersReport'
import { getAllStoresForReport } from '@/app/_actions/reports/getAllStoresForReport'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CIcon } from '@coreui/icons-react'
import { cilChevronCircleDownAlt, cilChevronCircleUpAlt } from '@coreui/icons'
import FinishJobModal from '@/components/events/finishJobModal'

type Store = {
  id: string;
  title: string;
  location: string;
};

const EstabelecimentosFreelancersReportPage = () => {
  const { data: session, status } = useSession()
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [storesList, setStoresList] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [loadingStores, setLoadingStores] = useState<boolean>(false)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({})
  const [expandedFreelancers, setExpandedFreelancers] = useState<Record<string, boolean>>({})
  const [finishJobModalVisible, setFinishJobModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // Referência para o componente que será impresso
  const reportRef = useRef<HTMLDivElement>(null)

  // Carregar a lista de estabelecimentos para o filtro
  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        setLoadingStores(true);
        try {
          const stores = await getAllStoresForReport();
          setStoresList(stores);
        } catch (error) {
          console.error('Erro ao carregar estabelecimentos:', error);
          alert('Ocorreu um erro ao carregar a lista de estabelecimentos');
        } finally {
          setLoadingStores(false);
        }
      }
    };

    fetchStores();
  }, [status]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim')
      return
    }

    setLoading(true)
    try {
      const data = await getStoreFreelancersReport(
        new Date(startDate),
        new Date(endDate),
        selectedStoreId || undefined // Se vazio, passa undefined para buscar todos
      )
      setReportData(data)
      
      // Inicializar todos os estabelecimentos como colapsados
      const initialStoreState: Record<string, boolean> = {};
      data.stores.forEach((store: any) => {
        initialStoreState[store.id] = false;
      });
      setExpandedStores(initialStoreState);
      
      // Inicializar todos os freelancers como colapsados
      const initialFreelancerState: Record<string, boolean> = {};
      data.stores.forEach((store: any) => {
        store.freelancers.forEach((freelancer: any) => {
          initialFreelancerState[`${store.id}-${freelancer.id}`] = false;
        });
      });
      setExpandedFreelancers(initialFreelancerState);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Ocorreu um erro ao gerar o relatório')
    } finally {
      setLoading(false)
    }
  }

  const toggleStore = (storeId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  const toggleFreelancer = (storeId: string, freelancerId: string) => {
    const key = `${storeId}-${freelancerId}`;
    setExpandedFreelancers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
          <title>Relatório de Freelancers por Estabelecimento</title>
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
              margin-top: 20px;
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .store-title {
              font-size: 1.3em;
              color: #333;
              border-bottom: 2px solid #666;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .freelancer-section {
              margin-top: 15px;
              margin-bottom: 20px;
              padding-left: 20px;
            }
            .freelancer-title {
              font-size: 1.1em;
              color: #444;
              margin-bottom: 10px;
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
            .accordion-section {
              margin-bottom: 10px;
            }
            .accordion-header {
              background-color: #f0f0f0;
              padding: 10px;
              font-weight: bold;
              cursor: pointer;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .accordion-content {
              padding: 10px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 4px 4px;
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

  const handleFinishEventModal = (service: any) => {
    setSelectedService(service);
    setFinishJobModalVisible(true);
  };

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
          <strong>Relatório de Freelancers por Estabelecimento</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="startDate">Data Inicial</CFormLabel>
                <CFormInput
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="endDate">Data Final</CFormLabel>
                <CFormInput
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="storeId">Estabelecimento</CFormLabel>
                <CFormSelect
                  id="storeId"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  disabled={loadingStores}
                >
                  <option value="">Todos os estabelecimentos</option>
                  {storesList.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.title} ({store.location})
                    </option>
                  ))}
                </CFormSelect>
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
                    onClick={handlePrint}
                    className="me-2"
                  >
                    Imprimir Relatório
                  </CButton>
                )}
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {reportData && (
        <CCard className="mb-4">
          <CCardHeader>
            <strong>
              Relatório de Freelancers por Estabelecimento - {formatDate(reportData.startDate)} a {formatDate(reportData.endDate)}
              {selectedStoreId && storesList.find(s => s.id === selectedStoreId) && ` - ${storesList.find(s => s.id === selectedStoreId)?.title}`}
            </strong>
          </CCardHeader>
          <CCardBody>
            <div ref={reportRef} className="report-content">
              <div className="report-header mb-4">
                <h2 className="text-center">Relatório de Freelancers por Estabelecimento</h2>
                <p className="text-center report-subtitle">
                  Período: {formatDate(reportData.startDate)} a {formatDate(reportData.endDate)}
                  {selectedStoreId && storesList.find(s => s.id === selectedStoreId) && 
                    <><br />Estabelecimento: {storesList.find(s => s.id === selectedStoreId)?.title}</>
                  }
                </p>
              </div>
              
              <CRow className="mb-4">
                <CCol>
                  <div className="summary-section">
                    <h4>Resumo Geral</h4>
                    <p><strong>Total de Estabelecimentos:</strong> {reportData.totalStores}</p>
                    <p><strong>Total de Serviços:</strong> {reportData.totalServices}</p>
                    <p><strong>Horas Diurnas (06h-22h):</strong> {reportData.totalDayHours?.toFixed(2) || 0} h - {formatCurrency(reportData.totalDayValue || 0)}</p>
                    <p><strong>Horas Noturnas (22h-06h):</strong> {reportData.totalNightHours?.toFixed(2) || 0} h - {formatCurrency(reportData.totalNightValue || 0)}</p>
                    <p><strong>Valor Total dos Serviços:</strong> {formatCurrency(reportData.totalValue)}</p>
                    <p><strong>Valor Total de Transporte:</strong> {formatCurrency(reportData.totalTransport)}</p>
                    <p><strong>Valor Total a Pagar:</strong> {formatCurrency(reportData.totalAmount)}</p>
                  </div>
                </CCol>
              </CRow>

              {reportData.stores.length > 0 ? (
                <CAccordion flush activeItemKey="0">
                  {reportData.stores.map((store: any, storeIndex: number) => (
                    <CAccordionItem key={store.id} itemKey={storeIndex.toString()}>
                      <CAccordionHeader>
                        <div>
                          {store.title} - {formatCurrency(store.totalAmount)} ({store.totalServices} serviços)
                        </div>
                      </CAccordionHeader>
                      <CAccordionBody>
                        <div className="store-details mb-3">
                          <h5>Dados do Estabelecimento</h5>
                          <p><strong>Endereço:</strong> {store.address}</p>
                          <p><strong>Telefone:</strong> {store.phone || "Não informado"}</p>
                          <p><strong>Telefone Comercial:</strong> {store.comercialPhone || "Não informado"}</p>
                          <p><strong>Proprietário:</strong> {store.owner?.name || "Não informado"}</p>
                        </div>
                        
                        <div className="store-summary mb-3">
                          <h5>Resumo Financeiro</h5>
                          <p><strong>Total de Serviços:</strong> {store.totalServices}</p>
                          <p><strong>Horas Diurnas (06h-22h):</strong> {store.totalDayHours?.toFixed(2) || 0} h - {formatCurrency(store.totalDayValue || 0)}</p>
                          <p><strong>Horas Noturnas (22h-06h):</strong> {store.totalNightHours?.toFixed(2) || 0} h - {formatCurrency(store.totalNightValue || 0)}</p>
                          <p><strong>Valor dos Serviços:</strong> {formatCurrency(store.totalValue)}</p>
                          <p><strong>Valor de Transporte:</strong> {formatCurrency(store.totalTransport)}</p>
                          <p><strong>Total a Pagar:</strong> {formatCurrency(store.totalAmount)}</p>
                        </div>
                        
                        <div className="freelancers-list">
                          <h5>Freelancers</h5>
                          {store.freelancers.length > 0 ? (
                            <CAccordion flush className="mt-2 mb-3">
                              {store.freelancers.map((freelancer: any, freelancerIndex: number) => (
                                <CAccordionItem key={freelancer.id} itemKey={freelancerIndex.toString()}>
                                  <CAccordionHeader>
                                    <div>{freelancer.name} - {formatCurrency(freelancer.totalAmount)} ({freelancer.totalServices} serviços)</div>
                                  </CAccordionHeader>
                                  <CAccordionBody>
                                    <div className="freelancer-details mb-2">
                                      <p><strong>Telefone:</strong> {freelancer.phone || "Não informado"}</p>
                                      <p><strong>Email:</strong> {freelancer.email || "Não informado"}</p>
                                      <p><strong>Chave PIX:</strong> {freelancer.pixKey || "Não informada"}</p>
                                    </div>
                                    
                                    <h6>Serviços Realizados</h6>
                                    <CTable bordered responsive>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell>Data</CTableHeaderCell>
                                          <CTableHeaderCell>Evento</CTableHeaderCell>
                                          <CTableHeaderCell>Entrada</CTableHeaderCell>
                                          <CTableHeaderCell>Saída</CTableHeaderCell>
                                          <CTableHeaderCell>H. Diurnas</CTableHeaderCell>
                                          <CTableHeaderCell>H. Noturnas</CTableHeaderCell>
                                          <CTableHeaderCell>V. Diurno</CTableHeaderCell>
                                          <CTableHeaderCell>V. Noturno</CTableHeaderCell>
                                          <CTableHeaderCell>Transporte</CTableHeaderCell>
                                          <CTableHeaderCell>Total</CTableHeaderCell>
                                          <CTableHeaderCell>Status</CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {freelancer.services.map((service: any) => (
                                          <CTableRow key={service.id}>
                                            <CTableDataCell>{formatDate(service.date)}</CTableDataCell>
                                            <CTableDataCell>{service.eventTitle}</CTableDataCell>
                                            <CTableDataCell>{formatTime(service.startTime)}</CTableDataCell>
                                            <CTableDataCell>{formatTime(service.endTime)}</CTableDataCell>
                                            <CTableDataCell>{service.dayHours?.toFixed(2) || 0} h</CTableDataCell>
                                            <CTableDataCell>{service.nightHours?.toFixed(2) || 0} h</CTableDataCell>
                                            <CTableDataCell>{formatCurrency(service.dayValue || 0)}</CTableDataCell>
                                            <CTableDataCell>{formatCurrency(service.nightValue || 0)}</CTableDataCell>
                                            <CTableDataCell>{formatCurrency(service.transportValue)}</CTableDataCell>
                                            <CTableDataCell>{formatCurrency(service.totalValue)}</CTableDataCell>
                                            <CTableDataCell>
                                            {service.hasRealTimes ? (
                                                <CBadge color="success">Check-in realizado</CBadge>
                                              ) : (
                                                <CBadge color="danger">Sem check-in</CBadge>
                                              )}
                                            {service.paymentStatus === 'Success' ? (
                                                <CBadge color="success">Pagamentoo Realizado dia {formatDate(service.paymentDate)}</CBadge>
                                              ) : (
                                                <CBadge color="danger" onClick={() => handleFinishEventModal(service)}>Pagamento Pendente</CBadge>
                                              )}
                                              
                                            </CTableDataCell>
                                          </CTableRow>
                                        ))}
                                        <CTableRow className="total-row">
                                          <CTableDataCell colSpan={4}>Total</CTableDataCell>
                                          <CTableDataCell>{freelancer.totalDayHours?.toFixed(2) || 0} h</CTableDataCell>
                                          <CTableDataCell>{freelancer.totalNightHours?.toFixed(2) || 0} h</CTableDataCell>
                                          <CTableDataCell>{formatCurrency(freelancer.totalDayValue || 0)}</CTableDataCell>
                                          <CTableDataCell>{formatCurrency(freelancer.totalNightValue || 0)}</CTableDataCell>
                                          <CTableDataCell>{formatCurrency(freelancer.totalTransport)}</CTableDataCell>
                                          <CTableDataCell>{formatCurrency(freelancer.totalAmount)}</CTableDataCell>
                                          <CTableDataCell></CTableDataCell>
                                        </CTableRow>
                                      </CTableBody>
                                    </CTable>
                                  </CAccordionBody>
                                </CAccordionItem>
                              ))}
                            </CAccordion>
                          ) : (
                            <p>Nenhum freelancer encontrado para este estabelecimento no período.</p>
                          )}
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              ) : (
                <div className="alert alert-info">
                  Nenhum estabelecimento encontrado com serviços de freelancer no período selecionado.
                </div>
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
                    <strong>Horas Diurnas (06h-22h):</strong> Horas trabalhadas entre 06h da manhã e 22h da noite, calculadas com valor de {formatCurrency(50)} por hora (ou valor personalizado).
                  </p>
                  <p>
                    <strong>Horas Noturnas (22h-06h):</strong> Horas trabalhadas entre 22h da noite e 06h da manhã, calculadas com valor de {formatCurrency(75)} por hora (ou valor personalizado).
                  </p>
                  <p>
                    <strong>Total a Pagar:</strong> Soma dos valores dos serviços (diurno + noturno) mais o valor do transporte para cada freelancer.
                  </p>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      )}

      {finishJobModalVisible && selectedService && (
        <FinishJobModal
          onClose={() => setFinishJobModalVisible(false)}
          service={selectedService}
          serviceId={selectedService.id}
        />
      )}
    </>
  )
}

export default EstabelecimentosFreelancersReportPage 