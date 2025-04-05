'use client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'
import AddServiceToEventModal from '@/components/events/addServiceToEventModal'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
  CCloseButton,
  CDropdownDivider,
  CCardHeader,
  CRow,
  CCol,
  CCardTitle,
  CCardFooter,
  CCardText,
  CCardSubtitle,
  CProgress,
  CProgressBar,
  CTooltip,
} from '@coreui/react-pro'
import { EventsServices, StoreEvents, Stores, User } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { 
  cilCalendar, 
  cilClock, 
  cilLocationPin, 
  cilPeople, 
  cilRestaurant, 
  cilUser, 
  cilPhone,
  cilPencil,
  cilTrash,
  cilOptions
} from '@coreui/icons'

// Tipo para Mashguiach (user) para ser adicionado às EventsServices
type MashguiachUser = {
  name: string;
  id: string;
}

// Atualizar o tipo EventsServices para incluir a propriedade Mashguiach
type EventsServiceWithMashguiach = EventsServices & {
  Mashguiach?: MashguiachUser;
}

// Atualizar o tipo EventsWithServices para usar o tipo atualizado do EventsServices
type EventsWithServices = StoreEvents & {
  EventsServices: EventsServiceWithMashguiach[]
}

type Props = {
  userId: string
  events: EventsWithServices[]
}

const EventsStoreDashboard = ({ userId, events: initialEvents }: Props) => {
  const [visibleOffcanvas, setVisibleOffcanvas] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventsWithServices | null>(null)
  const [events, setEvents] = useState<EventsWithServices[]>(initialEvents)

  // Função para atualizar a lista de eventos
  const fetchEvents = async () => {
    try {
      const updatedEvents = await getEventByEstabelecimento(userId)
      if (updatedEvents) {
        setEvents(updatedEvents)
      }
    } catch (error) {
      console.error('Erro ao atualizar eventos:', error)
    }
  }

  // Atualizar eventos ao montar o componente
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  const handleModalClick = (event: EventsWithServices) => {
    setSelectedEvent(event)
    setVisible(true)
  }

  const getDayOfWeek = (dateString: string) => {
    const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  const formatDateInPortuguese = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Calcula quantos dias faltam para o evento
  const getDaysUntilEvent = (eventDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDay = new Date(eventDate)
    eventDay.setHours(0, 0, 0, 0)
    
    const diffTime = eventDay.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // Retorna texto e cor baseado em quantos dias faltam para o evento
  const getEventTimeframe = (eventDate: Date) => {
    const daysUntil = getDaysUntilEvent(eventDate)
    
    if (daysUntil < 0) {
      return { text: 'Evento passado', color: 'secondary' }
    } else if (daysUntil === 0) {
      return { text: 'Hoje!', color: 'danger' }
    } else if (daysUntil === 1) {
      return { text: 'Amanhã', color: 'danger' }
    } else if (daysUntil <= 3) {
      return { text: `Em ${daysUntil} dias`, color: 'warning' }
    } else if (daysUntil <= 7) {
      return { text: `Esta semana`, color: 'info' }
    } else {
      return { text: `Em ${daysUntil} dias`, color: 'success' }
    }
  }

  // Formata evento para exibição abreviada de data
  const formatEventDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`
  }

  // Retorna o status do evento com ícone e cor
  const getEventStatusInfo = (isApproved: boolean) => {
    if (isApproved) {
      return {
        label: 'APROVADO',
        color: 'success',
        description: 'Este evento já foi aprovado e está confirmado'
      }
    } else {
      return {
        label: 'PENDENTE',
        color: 'warning',
        description: 'Este evento aguarda aprovação pela administração'
      }
    }
  }

  return (
    <div className="event-dashboard">
      {events.length === 0 && (
        <CCard className="text-center mb-4 border-secondary">
          <CCardBody className="py-5">
            <CCardTitle className="mb-3">Nenhum evento encontrado</CCardTitle>
            <CCardText className="text-medium-emphasis mb-4">
              Você ainda não tem eventos cadastrados. Clique no botão abaixo para criar seu primeiro evento.
            </CCardText>
            <Link href="/app/estabelecimento/events/add">
              <CButton color="primary">
                Criar Novo Evento
              </CButton>
            </Link>
          </CCardBody>
        </CCard>
      )}
      
      <CRow className="g-4">
        {events.map((event) => {
          const statusInfo = getEventStatusInfo(event.isApproved)
          const timeframe = getEventTimeframe(event.date)
          const daysUntil = getDaysUntilEvent(event.date)
          
          return (
            <CCol key={event.id} xs={12} sm={6} lg={4}>
              <CCard className="h-100 event-card">
                <CCardHeader className="d-flex justify-content-between align-items-center" 
                          style={{ borderLeft: `5px solid var(--cui-${timeframe.color})` }}>
                  <div>
                    <CBadge color={statusInfo.color} className="me-2">{statusInfo.label}</CBadge>
                    <CTooltip content={timeframe.text}>
                      <CBadge color={timeframe.color} shape="rounded-pill">{timeframe.text}</CBadge>
                    </CTooltip>
                  </div>
                </CCardHeader>
                
                <CCardBody>
                  <CCardTitle className="mb-3 fs-5">{event.title}</CCardTitle>
                  
                  <div className="d-flex align-items-center mb-3">
                    <CIcon icon={cilCalendar} className="text-primary me-2" size="lg" />
                    <div>
                      <div className="fw-bold">{getDayOfWeek(event.date.toString())}</div>
                      <div>{formatEventDate(event.date)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <CIcon icon={cilRestaurant} className="text-success flex-shrink-0" />
                      <span>{event.eventType || 'Tipo não especificado'}</span>
                    </div>
                    
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <CIcon icon={cilPeople} className="text-info flex-shrink-0" />
                      <span>{event.nrPax ? `${event.nrPax} convidados` : 'Número não especificado'}</span>
                    </div>
                    
                    <div className="d-flex gap-2 align-items-center">
                      <CIcon icon={cilUser} className="text-dark flex-shrink-0" />
                      <span className="text-truncate">{event.responsable}</span>
                    </div>
                  </div>
                  
                  {/* Serviços do evento */}
                  <div className="mt-3">
                    <CCardSubtitle className="mb-2">Serviço do Mashguiach</CCardSubtitle>
                    {event.EventsServices && event.EventsServices.length > 0 ? (
                      <div className="service-info">
                        {event.EventsServices.map((service, idx) => (
                          <div key={idx} className="border-start ps-3 border-info">
                            {service.mashguiachId ? (
                              <>
                                <div className="small text-muted mb-1">Mashguiach designado</div>
                                <div className="fw-bold">{service.Mashguiach?.name || 'Nome não disponível'}</div>
                              </>
                            ) : (
                              <div className="text-warning">Aguardando designação</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <CBadge color="danger" shape="rounded-pill" className="px-3">
                        Nenhum serviço solicitado
                      </CBadge>
                    )}
                  </div>
                </CCardBody>
                
                <CCardFooter className="d-flex justify-content-between align-items-center">
                  <Link href={`/app/estabelecimento/events/${event.id}`}>
                    <CButton color="primary" size="sm">
                      Detalhes
                    </CButton>
                  </Link>
                  <div className="d-flex gap-2">
                    {event.EventsServices.length === 0 && (
                      <CButton 
                        color="success" 
                        size="sm" 
                        onClick={() => handleModalClick(event)}
                        title="Solicitar serviço de Mashguiach"
                      >
                        Solicitar Serviço
                      </CButton>
                    )}
                    
                    <CButton 
                      color="secondary" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setVisibleOffcanvas(event.id.toString())}
                      title="Mais opções"
                    >
                      <CIcon icon={cilOptions} />
                    </CButton>
                  </div>
                </CCardFooter>
              </CCard>
              
              {/* Offcanvas com detalhes do evento */}
              <COffcanvas
                placement="end"
                visible={visibleOffcanvas === event.id.toString()}
                onHide={() => setVisibleOffcanvas(null)}
              >
                <COffcanvasHeader>
                  <COffcanvasTitle>
                    <CTooltip content={statusInfo.description}>
                      <CBadge color={statusInfo.color} className="me-2">{statusInfo.label}</CBadge>
                    </CTooltip>
                    {event.title}
                  </COffcanvasTitle>
                  <CCloseButton
                    className="text-reset"
                    onClick={() => setVisibleOffcanvas(null)}
                  />
                </COffcanvasHeader>
                <COffcanvasBody>
                  <div className="event-timeframe mb-4 text-center py-2" 
                       style={{background: `var(--cui-${timeframe.color}-bg-subtle)`, 
                               color: `var(--cui-${timeframe.color})`,
                               borderRadius: '4px'}}>
                    <h5 className="mb-0">{timeframe.text}</h5>
                    <div className="small">
                      {daysUntil === 0 ? 'O evento é hoje!' : 
                       daysUntil < 0 ? 'O evento já passou' : 
                       `Faltam ${daysUntil} dias para o evento`}
                    </div>
                  </div>
                  
                  <h5 className="border-bottom pb-2 mb-3">Detalhes do Evento</h5>
                  
                  <div className="mb-4">
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilCalendar} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Data do evento</div>
                        <div className="fw-bold">{formatDateInPortuguese(event.date.toString())}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilClock} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Horário</div>
                        <div className="fw-bold">{formatTime(event.date.toString())}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilRestaurant} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Tipo de evento</div>
                        <div className="fw-bold">{event.eventType || 'Não especificado'}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilPeople} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Número de convidados</div>
                        <div className="fw-bold">{event.nrPax || 'Não especificado'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="border-bottom pb-2 mb-3">Dados do Responsável</h5>
                  
                  <div className="mb-4">
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilUser} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Nome do responsável</div>
                        <div className="fw-bold">{event.responsable}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-center">
                      <CIcon icon={cilPhone} className="me-3 text-primary" />
                      <div>
                        <div className="text-muted small">Telefone</div>
                        <div className="fw-bold">{event.responsableTelephone}</div>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="border-bottom pb-2 mb-3">Serviços do Mashguiach</h5>
                  
                  {event.EventsServices.length > 0 ? (
                    <div className="mb-4">
                      {event.EventsServices.map((service, index) => (
                        <div key={index} className="p-3 mb-3 border rounded">
                          <div className="mb-3">
                            <div className="text-muted small">Status</div>
                            <CBadge color={service.mashguiachId ? 'success' : 'warning'} className="px-3 py-2">
                              {service.mashguiachId ? 'Mashguiach designado' : 'Aguardando designação'}
                            </CBadge>
                          </div>
                          
                          {service.mashguiachId && (
                            <div className="mb-3">
                              <div className="text-muted small">Mashguiach</div>
                              <div className="fw-bold">{service.Mashguiach?.name || 'Nome não disponível'}</div>
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <div className="text-muted small">Entrada</div>
                            <div className="fw-bold">
                              {service.arriveMashguiachTime ? 
                                formatEventDate(service.arriveMashguiachTime) : 
                                'Não definido'}
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-muted small">Saída</div>
                            <div className="fw-bold">
                              {service.endMashguiachTime ? 
                                formatEventDate(service.endMashguiachTime) : 
                                'Não definido'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="alert alert-warning">
                        Nenhum serviço solicitado para este evento.
                      </div>
                      <CButton 
                        color="primary" 
                        className="mt-2"
                        onClick={() => handleModalClick(event)}
                      >
                        Solicitar Serviço
                      </CButton>
                    </div>
                  )}
                  
                  <div className="d-flex gap-2 mt-4">
                    <Link href={`/app/estabelecimento/events/${event.id}`} style={{width: '100%'}}>
                      <CButton color="primary" className="w-100">Ver todos os detalhes</CButton>
                    </Link>
                  </div>
                </COffcanvasBody>
              </COffcanvas>
            </CCol>
          )
        })}
      </CRow>
      
      {/* Modal para adicionar serviço a um evento */}
      {visible && selectedEvent && (
        <AddServiceToEventModal 
          visible={visible} 
          onClose={() => {
            setVisible(false);
            fetchEvents(); // Atualiza a lista de eventos após fechar o modal
          }} 
          StoreEventsId={selectedEvent.id}
          fetchAll={fetchEvents} // Reutiliza a função fetchEvents para atualização
        />
      )}
    </div>
  )
}

export default EventsStoreDashboard
