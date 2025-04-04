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
  getUpcomingEvents 
} from '@/app/_actions/dashboard/getDashboardMetrics'
import { aproveEvent } from '@/app/_actions/events/aproveEvent'
import NewsSection from '@/components/dashboard/NewsSection'
import DashboardAlert from '@/components/dashboard/DashboardAlert'
import { useRouter } from 'next/navigation'
import { format, subMonths } from 'date-fns'

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
      
      // Buscar eventos pendentes
      const pendingEventsData = await getPendingEvents()
      setPendingEvents(pendingEventsData as Event[])
      
      // Buscar próximos eventos
      const upcomingEventsData = await getUpcomingEvents()
      setUpcomingEvents(upcomingEventsData as Event[])
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
            <span className="text-gray-400">
              Visão geral do sistema
            </span>
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
                        <CTableDataCell className='d-flex gap-2'>
                          <Link href={`/app/admin/events/${event.id}`}>
                            <CButton color="primary" size="sm">Ver detalhes</CButton>
                          </Link>
                          <CButton color="secondary" size="sm" onClick={() => handleApproveEvent(event.id, false)}>Aprovar</CButton>
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
        </>
      )}
    </>
  )
}

export default Admin2Dashboard 