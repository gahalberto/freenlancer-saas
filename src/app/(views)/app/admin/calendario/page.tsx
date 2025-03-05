"use client"
// pages/index.tsx

import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CSpinner,
  CTooltip,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react-pro'
import { useSession } from 'next-auth/react'
import { getAllServicesCalendar, getServicesByDateRange } from '@/app/_actions/services/getAllServicesCalendar'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import Link from 'next/link'

// Definindo a interface para os eventos do calendário
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    mashguiachName: string
    storeName: string
    storeId: string
    eventId: string
    serviceId: string
    workType: string
    address: string
  }
}

// Definindo a interface para os serviços
interface Service {
  id: string
  StoreEventsId: string
  reallyMashguiachArrive: Date | null
  reallyMashguiachEndTime: Date | null
  mashguiachId: string | null
  workType: string | null
  address_street: string | null
  address_number: string | null
  address_city: string | null
  address_state: string | null
  StoreEvents: {
    title: string
    store: {
      id: string
      title: string
    }
  }
  Mashguiach: {
    id: string
    name: string
    email: string
  } | null
}

const CalendarioPage = () => {
  const { data: session, status } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Função para buscar os serviços
  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await getAllServicesCalendar()
      setServices(data as Service[])
      
      // Converter serviços para eventos do calendário
      const calendarEvents = data
        .filter((service: any) => service.reallyMashguiachArrive !== null)
        .map((service: any) => {
          // Definir cor com base no tipo de trabalho
          const color = service.workType === 'PRODUCAO' ? '#4caf50' : '#2196f3'
          
          // Criar endereço formatado
          const address = service.address_street 
            ? `${service.address_street}, ${service.address_number} - ${service.address_city}/${service.address_state}`
            : 'Endereço não informado'
          
          return {
            id: service.id,
            title: `${service.Mashguiach?.name || 'Sem Mashguiach'} - ${service.StoreEvents.store.title}`,
            start: service.reallyMashguiachArrive.toISOString(),
            end: service.reallyMashguiachEndTime?.toISOString() || new Date(service.reallyMashguiachArrive.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            backgroundColor: color,
            borderColor: color,
            textColor: '#ffffff',
            extendedProps: {
              mashguiachName: service.Mashguiach?.name || 'Sem Mashguiach',
              storeName: service.StoreEvents.store.title,
              storeId: service.StoreEvents.store.id,
              eventId: service.StoreEventsId,
              serviceId: service.id,
              workType: service.workType || 'Não especificado',
              address: address
            }
          }
        })
      
      setEvents(calendarEvents as CalendarEvent[])
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar serviços por intervalo de datas
  const handleDatesSet = async (dateInfo: any) => {
    try {
      const startDate = new Date(dateInfo.startStr)
      const endDate = new Date(dateInfo.endStr)
      
      const data = await getServicesByDateRange(startDate, endDate)
      setServices(data as Service[])
      
      // Converter serviços para eventos do calendário
      const calendarEvents = data
        .filter((service: any) => service.reallyMashguiachArrive !== null)
        .map((service: any) => {
          // Definir cor com base no tipo de trabalho
          const color = service.workType === 'PRODUCAO' ? '#4caf50' : '#2196f3'
          
          // Criar endereço formatado
          const address = service.address_street 
            ? `${service.address_street}, ${service.address_number} - ${service.address_city}/${service.address_state}`
            : 'Endereço não informado'
          
          return {
            id: service.id,
            title: `${service.Mashguiach?.name || 'Sem Mashguiach'} - ${service.StoreEvents.store.title}`,
            start: service.reallyMashguiachArrive.toISOString(),
            end: service.reallyMashguiachEndTime?.toISOString() || new Date(service.reallyMashguiachArrive.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            backgroundColor: color,
            borderColor: color,
            textColor: '#ffffff',
            extendedProps: {
              mashguiachName: service.Mashguiach?.name || 'Sem Mashguiach',
              storeName: service.StoreEvents.store.title,
              storeId: service.StoreEvents.store.id,
              eventId: service.StoreEventsId,
              serviceId: service.id,
              workType: service.workType || 'Não especificado',
              address: address
            }
          }
        })
      
      setEvents(calendarEvents as CalendarEvent[])
    } catch (error) {
      console.error('Erro ao buscar serviços por intervalo de datas:', error)
    }
  }

  // Função para lidar com o clique em um evento
  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event as unknown as CalendarEvent)
    setShowModal(true)
  }

  // Carregar serviços ao montar o componente
  useEffect(() => {
    if (status === 'authenticated') {
      fetchServices()
    }
  }, [status])

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
          <CCardTitle>
            <strong>Calendário de Serviços</strong>
          </CCardTitle>
          <span className="text-gray-400">
            Visualize todos os serviços realizados pelos Mashguiach
          </span>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="d-flex justify-content-center">
              <CSpinner color="primary" />
            </div>
          ) : (
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={events}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                height="auto"
                locale={ptBrLocale}
                timeZone="local"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
              />
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal para exibir detalhes do evento */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Detalhes do Serviço</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <div>
              <h5>{selectedEvent.title}</h5>
              <p><strong>Mashguiach:</strong> {selectedEvent.extendedProps.mashguiachName}</p>
              <p><strong>Estabelecimento:</strong> {selectedEvent.extendedProps.storeName}</p>
              <p><strong>Tipo:</strong> {selectedEvent.extendedProps.workType}</p>
              <p><strong>Endereço:</strong> {selectedEvent.extendedProps.address}</p>
              <p>
                <strong>Horário:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}{' '}
                até{' '}
                {new Date(selectedEvent.end).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedEvent && (
            <Link href={`/app/admin/events/${selectedEvent.extendedProps.eventId}`}>
              <CButton color="primary">Ver Detalhes do Evento</CButton>
            </Link>
          )}
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CalendarioPage
