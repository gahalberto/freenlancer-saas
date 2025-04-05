'use client'

import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CSpinner,
  CWidgetStatsF,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CAlert,
  CFormLabel,
  CInputGroup,
  CFormInput,
  CDatePicker,
  CTooltip,
} from '@coreui/react-pro'
import { useSession } from 'next-auth/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilInstitution,
  cilCalendar,
  cilBriefcase,
  cilClock,
  cilMoney,
  cilWallet,
  cilDollar,
  cilBank,
  cilFilter,
  cilSync,
} from '@coreui/icons'
import Link from 'next/link'
import { 
  getDashboardMetrics, 
  getPendingEvents, 
  getUpcomingEvents,
  getEventsCountByDay 
} from '@/app/_actions/dashboard/getDashboardMetrics'
import { aproveEvent } from '@/app/_actions/events/aproveEvent'
import NewsSection from '@/components/dashboard/NewsSection'
import DashboardAlert from '@/components/dashboard/DashboardAlert'
import { useRouter } from 'next/navigation'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventsBarChart from '@/components/dashboard/EventsBarChart'

// Interface para os dados diários de eventos
interface DailyEventCount {
  date: string
  total: number
  approved: number
  pending: number
}

// Interfaces para as métricas e eventos
interface DashboardMetrics {
  totalMashguichim: number
  totalEstablishments: number
  totalEventsThisYear: number
  totalFixedJobs: number
  totalPendingEvents: number
  totalUpcomingEvents: number
  totalPendingPayments: number
  totalPendingAmount: number
  totalAmountThisMonth: number
  totalAmountAllTime: number
}

interface Event {
  id: string
  title: string
  date: Date
  storeName: string
  status: string
  mashguiachName: string | null
}

const Admin2Dashboard = () => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [dailyEvents, setDailyEvents] = useState<DailyEventCount[]>([])
  const router = useRouter()
  
  // Estado para filtros de data
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [filterVisible, setFilterVisible] = useState(false)

  // Função para buscar as métricas e eventos
  const fetchDashboardData = async (start?: Date | null, end?: Date | null) => {
    try {
      setLoading(true)
      
      // Adicionar timestamp para evitar cache das requisições
      const timestamp = new Date().getTime()
      
      // Buscar métricas com filtro de período
      const metricsData = await getDashboardMetrics(start || undefined, end || undefined)
      setMetrics(metricsData as DashboardMetrics)
      
      // Buscar eventos pendentes (sem filtro de período)
      const pendingEventsData = await getPendingEvents()
      setPendingEvents(pendingEventsData as Event[])
      
      // Buscar próximos eventos (sem filtro de período)
      const upcomingEventsData = await getUpcomingEvents()
      setUpcomingEvents(upcomingEventsData as Event[])
      
      // Buscar dados para o gráfico de eventos por dia
      const dailyEventsData = await getEventsCountByDay(start || undefined, end || undefined)
      setDailyEvents(dailyEventsData as DailyEventCount[])
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData(startDate, endDate)
    }
  }, [status])

  // Função para aplicar os filtros
  const handleApplyFilters = () => {
    fetchDashboardData(startDate, endDate)
  }

  // Função para resetar filtros
  const handleResetFilters = () => {
    setStartDate(subMonths(new Date(), 1))
    setEndDate(new Date())
    fetchDashboardData(subMonths(new Date(), 1), new Date())
  }

  // Função para formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning'
      case 'APROVADO':
        return 'success'
      case 'CANCELADO':
        return 'danger'
      default:
        return 'info'
    }
  }

  // Função para verificar se o evento está próximo (3 dias ou menos)
  const isEventClose = (eventDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDay = new Date(eventDate)
    eventDay.setHours(0, 0, 0, 0)
    
    // Calcular a diferença em dias
    const diffTime = eventDay.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Retornar true se a diferença for 3 dias ou menos (e positiva)
    return diffDays >= 0 && diffDays <= 3
  }

  const handleApproveEvent = async (eventId: string, isApproved: boolean) => {
    try {
      await aproveEvent(eventId, isApproved)
      fetchDashboardData(startDate, endDate)
    } catch (error) {
      console.error('Erro ao aprovar evento:', error)
    }
  }

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Função para forçar a atualização de dados
  const handleRefreshData = () => {
    fetchDashboardData(startDate, endDate)
  }

  // Função específica para atualizar apenas os dados do gráfico
  const handleRefreshChart = async () => {
    try {
      setLoading(true)
      const dailyEventsData = await getEventsCountByDay(startDate || undefined, endDate || undefined)
      setDailyEvents(dailyEventsData as DailyEventCount[])
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error)
    } finally {
      setLoading(false)
    }
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
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <CCardTitle>
              <strong>Dashboard Administrativo</strong>
            </CCardTitle>
            <div className="d-flex align-items-center">
              <span className="text-gray-400 me-2">
                Visão geral do sistema
              </span>
              {startDate && endDate && (
                <CTooltip content="Período atual selecionado para filtrar as métricas e eventos">
                  <CBadge color="info" shape="rounded-pill" className="px-3">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </CBadge>
                </CTooltip>
              )}
            </div>
          </div>
          <div className="d-flex gap-2">
            <CButton 
              color="primary" 
              variant="outline" 
              size="sm"
              onClick={() => setFilterVisible(!filterVisible)}
            >
              <CIcon icon={cilFilter} className="me-2" />
              Filtrar por período
            </CButton>
            <CButton 
              color="success" 
              variant="outline" 
              size="sm"
              onClick={handleRefreshData}
              title="Atualizar dados"
            >
              <CIcon icon={cilSync} />
            </CButton>
          </div>
        </CCardHeader>
        {filterVisible && (
          <CCardBody>
            <CRow>
              <CCol md={5}>
                <CFormLabel>Data Inicial</CFormLabel>
                <CDatePicker
                  locale="pt-BR"
                  placeholder="Selecione a data inicial"
                  className="mb-3"
                  date={startDate}
                  onDateChange={(date: Date | null) => setStartDate(date)}
                />
              </CCol>
              <CCol md={5}>
                <CFormLabel>Data Final</CFormLabel>
                <CDatePicker
                  locale="pt-BR"
                  placeholder="Selecione a data final"
                  className="mb-3"
                  date={endDate}
                  onDateChange={(date: Date | null) => setEndDate(date)}
                />
              </CCol>
              <CCol md={2} className="d-flex align-items-end mb-3">
                <CButton color="primary" className="me-2" onClick={handleApplyFilters}>
                  Aplicar
                </CButton>
                <CButton color="secondary" variant="outline" onClick={handleResetFilters}>
                  Resetar
                </CButton>
              </CCol>
            </CRow>
            {startDate && endDate && (
              <CAlert color="info" className="mb-0">
                Mostrando dados de {formatDate(startDate)} até {formatDate(endDate)}
              </CAlert>
            )}
          </CCardBody>
        )}
      </CCard>
      
      {/* Alertas do Dashboard */}
      <DashboardAlert />
      
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" />
        </div>
      ) : (
        <>
          {/* Alerta de eventos urgentes */}
          {pendingEvents.filter(event => isEventClose(event.date)).length > 0 && (
            <CAlert color="danger" className="mb-4">
              <div className="d-flex align-items-center">
                <CIcon icon={cilClock} className="flex-shrink-0 me-2" width={24} height={24} />
                <div>
                  <h5 className="alert-heading mb-1">Atenção! Eventos pendentes urgentes</h5>
                  <p className="mb-0">
                    Existem <strong>{pendingEvents.filter(event => isEventClose(event.date)).length} eventos</strong> pendentes que acontecerão nos próximos 3 dias e precisam de aprovação urgente.
                  </p>
                </div>
              </div>
            </CAlert>
          )}

          {/* Widgets de métricas */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="primary"
                icon={<CIcon icon={cilPeople} height={24} />}
                title="Mashguichim"
                value={metrics?.totalMashguichim.toString() || '0'}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="info"
                icon={<CIcon icon={cilInstitution} height={24} />}
                title="Estabelecimentos"
                value={metrics?.totalEstablishments.toString() || '0'}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="success"
                icon={<CIcon icon={cilCalendar} height={24} />}
                title="Eventos (Período)"
                value={metrics?.totalEventsThisYear.toString() || '0'}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="warning"
                icon={<CIcon icon={cilBriefcase} height={24} />}
                title="Funcionários Fixos"
                value={metrics?.totalFixedJobs.toString() || '0'}
              />
            </CCol>
          </CRow>

          {/* Nova linha de widgets para métricas financeiras */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<CIcon icon={cilWallet} height={24} />}
                title="Pagamentos Pendentes"
                value={metrics?.totalPendingPayments.toString() || '0'}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="dark"
                icon={<CIcon icon={cilMoney} height={24} />}
                title="Total a Pagar Pendente"
                value={formatCurrency(metrics?.totalPendingAmount || 0)}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="success"
                icon={<CIcon icon={cilDollar} height={24} />}
                title="Total Gerado (Período)"
                value={formatCurrency(metrics?.totalAmountThisMonth || 0)}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-3"
                color="primary"
                icon={<CIcon icon={cilBank} height={24} />}
                title="Total Gerado (Todo Período)"
                value={formatCurrency(metrics?.totalAmountAllTime || 0)}
              />
            </CCol>
          </CRow>

          {/* Métrica de eventos pendentes com destaque para urgentes */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CCard className="mb-3">
                <CCardBody className="p-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="text-medium-emphasis text-uppercase fw-semibold small">
                        Eventos Pendentes
                      </div>
                      <div className="fs-4 fw-semibold">
                        {metrics?.totalPendingEvents.toString() || '0'}
                      </div>
                    </div>
                    <CIcon icon={cilCalendar} className="text-warning" height={42} />
                  </div>
                  {pendingEvents.filter(event => isEventClose(event.date)).length > 0 && (
                    <div className="small mt-3 text-danger">
                      <CIcon icon={cilClock} className="me-1" width={16} height={16} />
                      <strong>{pendingEvents.filter(event => isEventClose(event.date)).length} eventos</strong> precisam de aprovação urgente
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* Tabela de eventos pendentes */}
          <CCard className="mb-4">
            <CCardHeader>
              <CCardTitle>
                <strong>Eventos Pendentes</strong>
              </CCardTitle>
              <span className="text-gray-400">
                Eventos que aguardam aprovação
              </span>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Título</CTableHeaderCell>
                    <CTableHeaderCell>Data</CTableHeaderCell>
                    <CTableHeaderCell>Estabelecimento</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Mashguiach</CTableHeaderCell>
                    <CTableHeaderCell>Ações</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pendingEvents.length > 0 ? (
                    pendingEvents.map((event) => (
                      <CTableRow 
                        key={event.id} 
                        className={isEventClose(event.date) ? 'bg-light-warning' : ''}
                      >
                        <CTableDataCell>
                          {event.title}
                          {isEventClose(event.date) && (
                            <CBadge color="danger" className="ms-2" shape="rounded-pill">
                              Urgente
                            </CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(event.date)}
                          {isEventClose(event.date) && (
                            <div className="small text-danger mt-1">
                              <strong>Evento próximo!</strong> Precisa de aprovação urgente.
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{event.storeName}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusColor(event.status)}>
                            {event.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {event.mashguiachName || 'Não atribuído'}
                        </CTableDataCell>
                        <CTableDataCell className='d-flex gap-2'>
                          <Link href={`/app/admin/events/${event.id}`}>
                            <CButton color="primary" size="sm">Ver detalhes</CButton>
                          </Link>
                          <CButton 
                            color={isEventClose(event.date) ? "danger" : "secondary"} 
                            size="sm" 
                            onClick={() => handleApproveEvent(event.id, false)}
                          >
                            Aprovar
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center">
                        Nenhum evento pendente encontrado
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>

          {/* Tabela de próximos eventos */}
          <CCard className="mb-4">
            <CCardHeader>
              <CCardTitle>
                <strong>Próximos Eventos</strong>
              </CCardTitle>
              <span className="text-gray-400">
                Eventos programados a partir de hoje
              </span>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Título</CTableHeaderCell>
                    <CTableHeaderCell>Data</CTableHeaderCell>
                    <CTableHeaderCell>Estabelecimento</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Mashguiach</CTableHeaderCell>
                    <CTableHeaderCell>Ações</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <CTableRow key={event.id}>
                        <CTableDataCell>{event.title}</CTableDataCell>
                        <CTableDataCell>{formatDate(event.date)}</CTableDataCell>
                        <CTableDataCell>{event.storeName}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusColor(event.status)}>
                            {event.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {event.mashguiachName || 'Não atribuído'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <Link href={`/app/admin/events/${event.id}`}>
                          <CButton color="primary" size="sm">Ver detalhes</CButton>
                          </Link>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center">
                        Nenhum evento próximo encontrado
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>

          {/* Nova seção de gráfico de eventos por dia */}
          <EventsBarChart 
            dailyEvents={dailyEvents}
            startDate={startDate}
            endDate={endDate}
            formatDate={formatDate}
            onRefresh={handleRefreshChart}
          />
        </>
      )}
    </>
  )
}

export default Admin2Dashboard 