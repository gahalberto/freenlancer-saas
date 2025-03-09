'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  CCard, 
  CCardHeader, 
  CCardTitle, 
  CCardBody, 
  CSpinner, 
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge
} from '@coreui/react-pro'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useSession } from 'next-auth/react'

// Configuração do localizer para o calendário
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

// Tipos para os dados dos eventos
type Mashguiach = {
  id: string
  name: string
  email: string
  phone: string
}

type EventService = {
  id: string
  StoreEventsId: string
  arriveMashguiachTime: string
  endMashguiachTime: string
  isApproved: boolean
  mashguiachId: string
  mashguiachPrice: number
  observationText: string
  accepted: boolean
  responseDate: string | null
  StoreId: string
  paymentStatus: string
  reallyMashguiachArrive: string | null
  reallyMashguiachEndTime: string | null
  latitude: number | null
  longitude: number | null
  mashguiachPricePerHour: number
  transport_price: number
  address_zipcode: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_city: string
  address_state: string
  workType: string
  Mashguiach: Mashguiach
}

type Store = {
  id: string
  title: string
  userId: string
  isMashguiach: boolean
  mashguiachId: string
  storeTypeId: string
  isAutomated: boolean
  address_zipcode: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_city: string
  address_state: string
  comercialPhone: string
  phone: string
  imageUrl: string
  menuUrl: string
}

type EventOwner = {
  id: string
  name: string
  email: string
  phone: string
}

type Event = {
  id: string
  title: string
  ownerId: string
  responsable: string
  date: string
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  nrPax: number
  clientName: string
  eventType: string
  serviceType: string
  isApproved: boolean
  storeId: string
  responsableTelephone: string
  address_city: string
  address_neighbor: string
  address_number: string
  address_state: string
  address_street: string
  address_zicode: string
  menuUrl: string
  EventsServices: EventService[]
  store: Store
  eventOwner: EventOwner
  EventsAdresses: any[]
}

// Tipo para os eventos do calendário
type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: any
}

const Calendar2Page = () => {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState('month')
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<{event: Event, service: EventService} | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Função para buscar os eventos
  const fetchEvents = useCallback(async () => {
    if (!session) {
      setLoading(false)
      setError('Você precisa estar autenticado para visualizar os eventos')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Usar a nova rota de API
      const response = await fetch('/api/admin/calendar-events', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.')
        }
        throw new Error(`Falha ao buscar eventos: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data || data.length === 0) {
        setEvents([])
        setCalendarEvents([])
        setError('Nenhum evento encontrado')
        return
      }
      
      setEvents(data)
      
      // Transformar os dados para o formato do calendário
      const formattedEvents: CalendarEvent[] = []
      
      data.forEach((event: Event) => {
        if (event.EventsServices && event.EventsServices.length > 0) {
          event.EventsServices.forEach((service: EventService) => {
            // Verificar se as datas são válidas
            if (service.arriveMashguiachTime && service.endMashguiachTime) {
              formattedEvents.push({
                id: service.id,
                title: `${event.title} - ${service.workType || 'Evento'}`,
                start: new Date(service.arriveMashguiachTime),
                end: new Date(service.endMashguiachTime),
                resource: {
                  event,
                  service
                }
              })
            }
          })
        }
      })
      
      setCalendarEvents(formattedEvents)
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      setError(error instanceof Error ? error.message : 'Erro ao buscar eventos')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    // Marcar que estamos no cliente
    setIsClient(true)
    
    if (session) {
      fetchEvents()
    }
  }, [fetchEvents, session])

  // Função para personalizar o evento no calendário
  const eventStyleGetter = (event: CalendarEvent) => {
    const service = event.resource?.service
    
    // Cores diferentes para diferentes tipos de trabalho
    let backgroundColor = '#3174ad' // Azul padrão
    
    if (service?.workType) {
      switch(service.workType.toUpperCase()) {
        case 'PRODUCAO':
          backgroundColor = '#3174ad' // Azul
          break
        case 'EVENTO':
          backgroundColor = '#f0ad4e' // Laranja
          break
        case 'SUBTITUICAO':
          backgroundColor = '#5cb85c' // Verde
          break
        default:
          backgroundColor = '#6f42c1' // Roxo para outros tipos
      }
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 5px',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }
  }

  // Função para lidar com a navegação do calendário
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  // Função para lidar com a mudança de visualização
  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  // Função para lidar com a seleção de um evento
  const handleSelectEvent = (event: CalendarEvent) => {
    const service = event.resource?.service
    const storeEvent = event.resource?.event
    
    if (service && storeEvent) {
      setSelectedEvent({
        event: storeEvent,
        service: service
      })
      setShowModal(true)
    }
  }

  // Renderizar um placeholder até que o componente seja montado no cliente
  if (!isClient) {
    return <div>Carregando...</div>
  }

  return (
    <div className="calendar-container">
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <CCardTitle>
                <h4>Calendário Administração</h4>
              </CCardTitle>
              <p className="text-medium-emphasis">
                Visualize todos os serviços de mashguiach em um calendário
              </p>
            </div>
            <div>
              <CButton 
                color="primary" 
                className="me-2"
                onClick={() => fetchEvents()}
              >
                Atualizar Eventos
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="d-flex justify-content-center p-5">
              <CSpinner color="primary" />
            </div>
          ) : error ? (
            <div className="alert alert-warning">
              <p>{error}</p>
              <CButton color="primary" onClick={() => fetchEvents()}>
                Tentar novamente
              </CButton>
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="alert alert-info">
              <p>Nenhum evento encontrado para exibir no calendário.</p>
              <CButton color="primary" onClick={() => fetchEvents()}>
                Atualizar
              </CButton>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-center mb-3">
                <div className="d-flex align-items-center me-3">
                  <div style={{ width: 15, height: 15, backgroundColor: '#3174ad', borderRadius: '3px', marginRight: '5px' }}></div>
                  <span>Produção</span>
                </div>
                <div className="d-flex align-items-center me-3">
                  <div style={{ width: 15, height: 15, backgroundColor: '#f0ad4e', borderRadius: '3px', marginRight: '5px' }}></div>
                  <span>Evento</span>
                </div>
                <div className="d-flex align-items-center me-3">
                  <div style={{ width: 15, height: 15, backgroundColor: '#5cb85c', borderRadius: '3px', marginRight: '5px' }}></div>
                  <span>Substituição</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: 15, height: 15, backgroundColor: '#6f42c1', borderRadius: '3px', marginRight: '5px' }}></div>
                  <span>Outros</span>
                </div>
              </div>
              <div style={{ height: 700 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  messages={{
                    next: "Próximo",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    agenda: "Agenda",
                    date: "Data",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "Não há eventos neste período."
                  }}
                  date={currentDate}
                  onNavigate={handleNavigate}
                  view={currentView as any}
                  onView={handleViewChange as any}
                  onSelectEvent={handleSelectEvent}
                  popup
                  selectable
                  tooltipAccessor={(event) => {
                    const service = event.resource?.service
                    const mashguiach = service?.Mashguiach
                    return `${event.title}\nMashguiach: ${mashguiach?.name || 'Não atribuído'}\nHorário: ${moment(event.start).format('DD/MM/YYYY HH:mm')} - ${moment(event.end).format('DD/MM/YYYY HH:mm')}`
                  }}
                />
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal de detalhes do evento */}
      <CModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Detalhes do Evento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <div>
              <h5>{selectedEvent.event.title}</h5>
              <div className="mb-3">
                <CBadge color={
                  selectedEvent.service.workType === 'PRODUCAO' ? 'primary' : 
                  selectedEvent.service.workType === 'EVENTO' ? 'warning' :
                  selectedEvent.service.workType === 'HASHGACHA' ? 'success' : 'info'
                }>
                  {selectedEvent.service.workType || 'Evento'}
                </CBadge>
              </div>
              
              <div className="mb-2">
                <strong>Data e Horário:</strong><br/>
                {moment(selectedEvent.service.arriveMashguiachTime).format('DD/MM/YYYY HH:mm')} - {moment(selectedEvent.service.endMashguiachTime).format('DD/MM/YYYY HH:mm')}
              </div>
              
              <div className="mb-2">
                <strong>Mashguiach:</strong><br/>
                {selectedEvent.service.Mashguiach?.name || 'Não atribuído'}
                {selectedEvent.service.Mashguiach?.phone && (
                  <div><small>Telefone: {selectedEvent.service.Mashguiach.phone}</small></div>
                )}
              </div>
              
              <div className="mb-2">
                <strong>Estabelecimento:</strong><br/>
                {selectedEvent.event.store?.title || 'Não especificado'}
              </div>
              
              <div className="mb-2">
                <strong>Responsável:</strong><br/>
                {selectedEvent.event.responsable || 'Não especificado'}
                {selectedEvent.event.responsableTelephone && (
                  <div><small>Telefone: {selectedEvent.event.responsableTelephone}</small></div>
                )}
              </div>
              
              <div className="mb-2">
                <strong>Endereço:</strong><br/>
                {selectedEvent.service.address_street && (
                  <>
                    {selectedEvent.service.address_street}, {selectedEvent.service.address_number}<br/>
                    {selectedEvent.service.address_neighbor}, {selectedEvent.service.address_city} - {selectedEvent.service.address_state}<br/>
                    CEP: {selectedEvent.service.address_zipcode}
                  </>
                ) || 'Endereço não especificado'}
              </div>
              
              <div className="mb-2">
                <strong>Valor:</strong><br/>
                R$ {selectedEvent.service.mashguiachPrice.toFixed(2)}
                {selectedEvent.service.mashguiachPricePerHour > 0 && (
                  <div><small>Valor por hora: R$ {selectedEvent.service.mashguiachPricePerHour.toFixed(2)}</small></div>
                )}
                {selectedEvent.service.transport_price > 0 && (
                  <div><small>Transporte: R$ {selectedEvent.service.transport_price.toFixed(2)}</small></div>
                )}
              </div>
              
              {selectedEvent.service.observationText && (
                <div className="mb-2">
                  <strong>Observações:</strong><br/>
                  {selectedEvent.service.observationText}
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </CButton>
          {selectedEvent && (
            <CButton 
              color="primary" 
              onClick={() => {
                window.location.href = `/app/admin/events/${selectedEvent.event.id}`
              }}
            >
              Ver Detalhes Completos
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Calendar2Page 