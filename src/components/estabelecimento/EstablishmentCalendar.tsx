'use client'
import { useState, useEffect, useRef } from 'react'
import { DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBr from '@fullcalendar/core/locales/pt-br'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CAlert,
  CBadge,
  CTooltip,
  CInputGroup,
  CInputGroupText,
  CCardTitle
} from '@coreui/react-pro'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'
import { useSession } from 'next-auth/react'
import { EventInput } from '@fullcalendar/core'
import CIcon from '@coreui/icons-react'
import { 
  cilCalendar, 
  cilClock, 
  cilInfo, 
  cilPeople, 
  cilRestaurant, 
  cilUser, 
  cilLocationPin,
  cilCheckAlt,
  cilPlus,
  cilPencil,
  cilTrash,
  cilOptions,
} from '@coreui/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Interface para o status do evento
interface EventStatus {
  color: string;
  text: string;
  icon: JSX.Element;
}

// Interface para os detalhes do serviço mashguiach
interface MashguiachService {
  id: string;
  arriveMashguiachTime: Date | null;
  endMashguiachTime: Date | null;
  mashguiachId: string | null;
  mashguiachName?: string | null;
}

// Interface para os eventos do calendário
interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    isApproved: boolean;
    eventType: string | null;
    nrPax: number | null;
    responsable: string | null;
    responsableTelephone: string | null;
    mashguiachService: MashguiachService | null;
    isUpcoming: boolean;
    status: string;
    serviceType: string | null;
    clientName: string | null;
  }
}

const EstablishmentCalendar = () => {
  const router = useRouter()
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar')
  const { data: session } = useSession()
  const calendarRef = useRef<FullCalendar | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [session])

  useEffect(() => {
    applyFilters()
  }, [statusFilter, currentEvents])

  const fetchEvents = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      // Buscar eventos do estabelecimento logado
      const eventsData = await getEventByEstabelecimento(session.user.id)
      
      // Mapear eventos para o formato esperado pelo FullCalendar
      const formattedEvents = eventsData.map(event => {
        // Verificar status do evento
        const status = getEventStatus(event.isApproved);
        
        // Informações básicas do serviço, se existir
        let serviceInfo = null;
        if (event.EventsServices && event.EventsServices.length > 0) {
          const service = event.EventsServices[0];
          serviceInfo = {
            id: service.id,
            arriveMashguiachTime: service.arriveMashguiachTime,
            endMashguiachTime: service.endMashguiachTime,
            mashguiachId: service.mashguiachId,
            mashguiachName: null
          };
        }
        
        const eventDate = new Date(event.date);
        
        // Verificar se o evento está próximo (3 dias ou menos)
        const isUpcoming = isEventClose(eventDate);
        
        // Retornar evento formatado para o FullCalendar
        return {
          id: event.id,
          title: event.title,
          start: eventDate.toISOString(),
          end: serviceInfo?.endMashguiachTime 
            ? new Date(serviceInfo.endMashguiachTime).toISOString() 
            : addHours(eventDate, 4).toISOString(), // adicionar 4 horas por padrão se não tiver fim
          allDay: false,
          backgroundColor: status.color,
          borderColor: status.color,
          textColor: '#ffffff',
          extendedProps: {
            isApproved: event.isApproved,
            eventType: event.eventType,
            nrPax: event.nrPax,
            responsable: event.responsable,
            responsableTelephone: event.responsableTelephone,
            mashguiachService: serviceInfo,
            isUpcoming,
            status: status.text,
            serviceType: event.serviceType,
            clientName: event.clientName
          }
        };
      });
      
      setCurrentEvents(formattedEvents as CalendarEvent[]);
      setFilteredEvents(formattedEvents as CalendarEvent[]);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar eventos conforme seleção
  const applyFilters = () => {
    let filtered = [...currentEvents];
    
    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const isApproved = event.extendedProps?.isApproved;
        if (statusFilter === 'approved') return isApproved;
        if (statusFilter === 'pending') return !isApproved;
        return true;
      });
    }
    
    setFilteredEvents(filtered);
  };

  // Função para lidar com a mudança de intervalo de datas do calendário
  const handleDatesSet = (dateInfo: any) => {
    const startDate = new Date(dateInfo.startStr);
    const endDate = new Date(dateInfo.endStr);
    
    setDateRangeStart(startDate);
    setDateRangeEnd(endDate);
    
    // Se decidir implementar busca por intervalo de datas no futuro
    // aqui seria o local para chamar uma função similar ao getServicesByDateRange
  };

  // Verifica se o evento está próximo (3 dias ou menos)
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

  // Adiciona horas a uma data
  const addHours = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  // Retorna informações sobre o status do evento
  const getEventStatus = (isApproved: boolean): EventStatus => {
    if (isApproved) {
      return {
        color: '#2eb85c', // verde
        text: 'APROVADO',
        icon: <CIcon icon={cilCheckAlt} className="me-1" />
      };
    } else {
      return {
        color: '#f9b115', // amarelo
        text: 'PENDENTE',
        icon: <CIcon icon={cilClock} className="me-1" />
      };
    }
  };

  // Formatar data em português
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Data não definida';
    
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lidar com o clique em um evento
  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      ...clickInfo.event.toPlainObject(),
      extendedProps: clickInfo.event.extendedProps
    });
    setVisible(true);
  };

  // Navegação para adicionar um novo evento
  const handleAddEvent = () => {
    router.push('/app/estabelecimento/events/add');
  };

  // Navegar para página de edição do evento
  const handleEditEvent = (eventId: string) => {
    router.push(`/app/estabelecimento/events/${eventId}`);
    setVisible(false);
  };

  // Alterar a visualização do calendário
  const changeView = (newView: string) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  // Solicitar serviço de Mashguiach para um evento
  const handleRequestMashguiach = (eventId: string) => {
    router.push(`/app/estabelecimento/events/${eventId}/request-mashguiach`);
    setVisible(false);
  };

  return (
    <>
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="bg-light">
          <CRow className="align-items-center">
            <CCol>
              <CCardTitle>
                <strong>Calendário de Eventos</strong>
              </CCardTitle>
              <span className="text-muted">
                Visualize e gerencie todos os seus eventos agendados
              </span>
            </CCol>
            <CCol xs="auto">
              <CRow className="g-2">
                <CCol>
                  <CFormSelect 
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filtrar por status"
                  >
                    <option value="all">Todos os eventos</option>
                    <option value="approved">Aprovados</option>
                    <option value="pending">Pendentes</option>
                  </CFormSelect>
                </CCol>
                <CCol>
                  <div className="btn-group" role="group">
                    <CButton 
                      color="primary" 
                      variant={viewType === 'calendar' ? 'outline' : 'ghost'} 
                      size="sm"
                      onClick={() => {
                        setViewType('calendar');
                        changeView('dayGridMonth');
                      }}
                    >
                      <CIcon icon={cilCalendar} className="me-1" />
                      Calendário
                    </CButton>
                    <CButton 
                      color="primary" 
                      variant={viewType === 'list' ? 'outline' : 'ghost'} 
                      size="sm"
                      onClick={() => {
                        setViewType('list');
                        changeView('listMonth');
                      }}
                    >
                      <CIcon icon={cilOptions} className="me-1" />
                      Lista
                    </CButton>
                  </div>
                </CCol>
                <CCol>
                  <CButton 
                    color="success" 
                    size="sm"
                    onClick={handleAddEvent}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Novo Evento
                  </CButton>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {isLoading ? (
            <div className="text-center p-5">
              <CSpinner color="primary" />
              <p className="mt-3">Carregando calendário...</p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
              }}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                list: 'Lista',
              }}
              initialView="dayGridMonth"
              locale={ptBr}
              dayMaxEvents={true}
              events={filteredEvents}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="auto"
              timeZone="local"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
              }}
              eventDidMount={(info) => {
                // Adicionar classes e indicadores visuais para eventos próximos
                if (info.event.extendedProps?.isUpcoming) {
                  const eventEl = info.el;
                  eventEl.classList.add('event-upcoming');
                  
                  if (info.event.extendedProps?.status === 'PENDENTE') {
                    const dotEl = document.createElement('span');
                    dotEl.className = 'event-alert-dot';
                    eventEl.appendChild(dotEl);
                  }
                }
              }}
              eventContent={(eventInfo) => {
                const eventStatus = eventInfo.event.extendedProps?.status;
                return (
                  <div>
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                    <div className="fc-event-title-container">
                      {eventStatus === 'PENDENTE' && <span className="me-1">⚠️</span>}
                      <div className="fc-event-title">{eventInfo.event.title}</div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Modal de Detalhes do Evento */}
      <CModal 
        visible={visible} 
        onClose={() => setVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            {selectedEvent?.extendedProps?.status && (
              <CBadge 
                color={selectedEvent.extendedProps.isApproved ? 'success' : 'warning'} 
                className="me-2"
              >
                {selectedEvent.extendedProps.status}
              </CBadge>
            )}
            {selectedEvent?.title}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <CRow>
              <CCol md={6}>
                <h6 className="mb-3 border-bottom pb-2">Informações do Evento</h6>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilCalendar} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Data do evento</div>
                    <div className="fw-bold">{formatDate(selectedEvent.start)}</div>
                  </div>
                </div>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilRestaurant} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Tipo de evento</div>
                    <div className="fw-bold">{selectedEvent.extendedProps?.eventType || 'Não especificado'}</div>
                  </div>
                </div>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilOptions} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Tipo de serviço</div>
                    <div className="fw-bold">{selectedEvent.extendedProps?.serviceType || 'Não especificado'}</div>
                  </div>
                </div>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilPeople} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Número de convidados</div>
                    <div className="fw-bold">{selectedEvent.extendedProps?.nrPax || 'Não especificado'}</div>
                  </div>
                </div>
              </CCol>
              
              <CCol md={6}>
                <h6 className="mb-3 border-bottom pb-2">Contato</h6>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilUser} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Responsável</div>
                    <div className="fw-bold">{selectedEvent.extendedProps?.responsable || 'Não especificado'}</div>
                  </div>
                </div>
                
                <div className="mb-3 d-flex">
                  <CIcon icon={cilLocationPin} className="me-2 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-muted small">Telefone</div>
                    <div className="fw-bold">{selectedEvent.extendedProps?.responsableTelephone || 'Não especificado'}</div>
                  </div>
                </div>
                
                <h6 className="mt-4 mb-3 border-bottom pb-2">Serviço de Mashguiach</h6>
                
                {selectedEvent.extendedProps?.mashguiachService ? (
                  <>
                    <div className="mb-3 d-flex">
                      <CIcon icon={cilUser} className="me-2 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-muted small">Mashguiach</div>
                        <div className="fw-bold">
                          {selectedEvent.extendedProps.mashguiachService.mashguiachName 
                            ? selectedEvent.extendedProps.mashguiachService.mashguiachName
                            : 'Não atribuído ainda'}
                        </div>
                      </div>
                    </div>
                    
                    {selectedEvent.extendedProps.mashguiachService.arriveMashguiachTime && (
                      <div className="mb-3 d-flex">
                        <CIcon icon={cilClock} className="me-2 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="text-muted small">Horário de entrada</div>
                          <div className="fw-bold">
                            {formatDate(selectedEvent.extendedProps.mashguiachService.arriveMashguiachTime)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedEvent.extendedProps.mashguiachService.endMashguiachTime && (
                      <div className="mb-3 d-flex">
                        <CIcon icon={cilClock} className="me-2 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="text-muted small">Horário de saída</div>
                          <div className="fw-bold">
                            {formatDate(selectedEvent.extendedProps.mashguiachService.endMashguiachTime)}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <CAlert color="warning">
                    Nenhum serviço de Mashguiach solicitado para este evento.
                  </CAlert>
                )}
              </CCol>
              
              {!selectedEvent.extendedProps?.isApproved && (
                <CCol xs={12} className="mt-3">
                  <CAlert color="warning">
                    <div className="d-flex">
                      <CIcon icon={cilInfo} className="flex-shrink-0 me-2" width={24} height={24} />
                      <div>
                        <h6 className="alert-heading mb-1">Este evento está aguardando aprovação</h6>
                        <p className="mb-0">
                          Eventos precisam ser aprovados pela administração antes que os mashguichim possam ser designados.
                        </p>
                      </div>
                    </div>
                  </CAlert>
                </CCol>
              )}
              
              {selectedEvent.extendedProps?.isUpcoming && (
                <CCol xs={12} className="mt-2">
                  <CAlert color="info">
                    <div className="d-flex">
                      <CIcon icon={cilCalendar} className="flex-shrink-0 me-2" width={24} height={24} />
                      <div>
                        <h6 className="alert-heading mb-1">Evento próximo!</h6>
                        <p className="mb-0">
                          Este evento acontecerá nos próximos 3 dias.
                        </p>
                      </div>
                    </div>
                  </CAlert>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="primary"
            onClick={() => handleEditEvent(selectedEvent?.id)}
          >
            <CIcon icon={cilPencil} className="me-1" /> 
            Editar Evento
          </CButton>
          {!selectedEvent?.extendedProps?.mashguiachService && (
            <CButton 
              color="success"
              onClick={() => handleRequestMashguiach(selectedEvent?.id)}
            >
              <CIcon icon={cilPlus} className="me-1" /> 
              Solicitar Mashguiach
            </CButton>
          )}
          <CButton 
            color="secondary"
            onClick={() => setVisible(false)}
          >
            Fechar
          </CButton>
        </CModalFooter>
      </CModal>

      <style jsx global>{`
        .event-upcoming {
          font-weight: bold;
        }
        .event-alert-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #e55353;
        }
        .fc-list-event.event-upcoming .fc-list-event-title {
          font-weight: bold;
        }
      `}</style>
    </>
  )
}

export default EstablishmentCalendar 