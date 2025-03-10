'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getEventsByMashguiachMonthAndYear } from '@/app/_actions/events/getEventsByMashguiachMonthAndYear'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CSpinner,
  CBadge,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { formatCurrency } from '@/app/_lib/formatters'

dayjs.locale('pt-br')

// Definir interface para o serviço
interface Service {
  id: string
  arriveMashguiachTime: Date
  endMashguiachTime: Date
  mashguiachPrice: number
  dayHourValue?: number | null
  nightHourValue?: number | null
  transport_price?: number | null
  accepted: boolean
  isApproved: boolean
  workType?: string | null
  observationText?: string | null
}

// Definir interface para o evento
interface Event {
  id: string
  title: string
  date: Date
  store?: {
    id: string
    title: string
  } | null
  services: Service[]
}

export default function MashguiachEventsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalServices: 0,
    totalHours: 0,
    totalValue: 0,
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // Mês atual (1-12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  // Gerar anos de 2020 até o ano atual + 1
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => ({
    value: 2020 + i,
    label: `${2020 + i}`,
  }))

  const fetchEvents = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const result = await getEventsByMashguiachMonthAndYear({
        mashguiachId: session.user.id,
        month: selectedMonth,
        year: selectedYear,
      })

      if (result.success && result.events) {
        setEvents(result.events as Event[])
        setStats({
          totalEvents: result.totalEvents || 0,
          totalServices: result.totalServices || 0,
          totalHours: result.totalHours || 0,
          totalValue: result.totalValue || 0,
        })
      } else {
        console.error('Erro ao buscar eventos:', result.message)
        setEvents([])
        setStats({
          totalEvents: 0,
          totalServices: 0,
          totalHours: 0,
          totalValue: 0,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchEvents()
    }
  }, [session, selectedMonth, selectedYear])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value))
  }

  const getStatusBadge = (service: Service) => {
    if (service.accepted) {
      return <CBadge color="success">Aceito</CBadge>
    } else if (service.isApproved) {
      return <CBadge color="warning">Aprovado</CBadge>
    } else {
      return <CBadge color="danger">Pendente</CBadge>
    }
  }

  const getWorkTypeBadge = (workType: string | null | undefined) => {
    if (!workType) return null
    
    switch (workType) {
      case 'EVENTO':
        return <CBadge color="info">Evento</CBadge>
      case 'PRODUCAO':
        return <CBadge color="primary">Produção</CBadge>
      case 'SUBSTITUICAO':
        return <CBadge color="warning">Substituição</CBadge>
      default:
        return null
    }
  }

  const calculateDuration = (start: Date | string, end: Date | string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const durationMs = endTime.getTime() - startTime.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)
    return durationHours.toFixed(2)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h4>Meus Eventos</h4>
        <div className="d-flex gap-3 mt-3">
          <CFormSelect
            value={selectedMonth}
            onChange={handleMonthChange}
            label="Mês"
            options={[
              { label: 'Selecione o mês', value: '' },
              ...months,
            ]}
          />
          <CFormSelect
            value={selectedYear}
            onChange={handleYearChange}
            label="Ano"
            options={[
              { label: 'Selecione o ano', value: '' },
              ...years,
            ]}
          />
        </div>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center my-5">
            <CSpinner />
            <p className="mt-2">Carregando eventos...</p>
          </div>
        ) : (
          <>
            <CRow className="mb-4">
              <CCol md={3}>
                <CCard className="text-center p-3 bg-info text-white">
                  <h5>Total de Eventos</h5>
                  <h2>{stats.totalEvents}</h2>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="text-center p-3 bg-warning text-white">
                  <h5>Total de Serviços</h5>
                  <h2>{stats.totalServices}</h2>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="text-center p-3 bg-primary text-white">
                  <h5>Total de Horas</h5>
                  <h2>{stats.totalHours}</h2>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="text-center p-3 bg-success text-white">
                  <h5>Valor Total</h5>
                  <h2>{formatCurrency(stats.totalValue)}</h2>
                </CCard>
              </CCol>
            </CRow>

            {events.length === 0 ? (
              <div className="text-center my-5">
                <p>Nenhum evento encontrado para o período selecionado.</p>
              </div>
            ) : (
              <CAccordion alwaysOpen>
                {events.map((event, index) => (
                  <CAccordionItem key={event.id} itemKey={index.toString()}>
                    <CAccordionHeader>
                      <div className="d-flex justify-content-between w-100 me-3">
                        <span>
                          <strong>{event.title}</strong> - {dayjs(event.date).format('DD/MM/YYYY')}
                        </span>
                        <span>
                          {event.store?.title || 'Local não informado'} - {event.services.length} serviço(s)
                        </span>
                      </div>
                    </CAccordionHeader>
                    <CAccordionBody>
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Data</CTableHeaderCell>
                            <CTableHeaderCell>Horário</CTableHeaderCell>
                            <CTableHeaderCell>Duração (h)</CTableHeaderCell>
                            <CTableHeaderCell>Tipo</CTableHeaderCell>
                            <CTableHeaderCell>Valor</CTableHeaderCell>
                            <CTableHeaderCell>Transporte</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {event.services.map((service) => (
                            <CTableRow key={service.id}>
                              <CTableDataCell>
                                {dayjs(service.arriveMashguiachTime).format('DD/MM/YYYY')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {dayjs(service.arriveMashguiachTime).format('HH:mm')} - 
                                {dayjs(service.endMashguiachTime).format('HH:mm')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {calculateDuration(service.arriveMashguiachTime, service.endMashguiachTime)}
                              </CTableDataCell>
                              <CTableDataCell>
                                {getWorkTypeBadge(service.workType)}
                              </CTableDataCell>
                              <CTableDataCell>
                                {formatCurrency(service.mashguiachPrice)}
                              </CTableDataCell>
                              <CTableDataCell>
                                {service.transport_price ? formatCurrency(service.transport_price) : 'N/A'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {getStatusBadge(service)}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                      
                      {event.services.map(service => (
                        service.observationText && (
                          <div key={`obs-${service.id}`} className="mt-3">
                            <h6>Observações do serviço {dayjs(service.arriveMashguiachTime).format('DD/MM/YYYY HH:mm')}:</h6>
                            <p>{service.observationText}</p>
                          </div>
                        )
                      ))}
                    </CAccordionBody>
                  </CAccordionItem>
                ))}
              </CAccordion>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
} 