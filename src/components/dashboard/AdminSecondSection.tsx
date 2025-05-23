'use client'
import { aproveEvent } from '@/app/_actions/events/aproveEvent'
import { getAllEvents, getEventDetails } from '@/app/_actions/events/getAllEvents'
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
  CSpinner
} from '@coreui/react-pro'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import { EditIcon, EyeIcon, KeyIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

type EventsWithServices = StoreEvents & {
  EventsServices: EventsServices[]
  store: Stores
}

const AdminSecondSection = () => {
  const [events, setEvents] = useState<EventsWithServices[]>([])
  const [visibleOffcanvas, setVisibleOffcanvas] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Usar useCallback para evitar recriação da função em cada renderização
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getAllEvents(1, 10) // Buscar apenas 10 eventos para a dashboard
      if (response && response.events) {
        // Buscar detalhes completos para cada evento
        const eventsWithDetails = await Promise.all(
          response.events.map(async (event) => {
            const details = await getEventDetails(event.id)
            return details as EventsWithServices
          })
        )
        setEvents(eventsWithDetails.filter(Boolean) as EventsWithServices[])
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch events data from your API
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])
  
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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (events.length === 0) {
    return <p>Nenhum evento cadastrado.</p>
  }

  const handleApproveEvent = async (eventId: string, isApproved: boolean) => {
    try {
      await aproveEvent(eventId, isApproved)
      // Atualizar a lista de eventos após a aprovação
      fetchEvents()
    } catch (error) {
      console.error('Erro ao aprovar/desaprovar evento:', error)
    }
  }

  return (
    <div className="mt-2">
      <CCard className="mb-3">
        <CCardHeader>
          <CCardTitle>
            <b>Todos Eventos</b>
          </CCardTitle>
          <span className="text-gray-400">
             Todos os eventos registrados no sistema
          </span>
        </CCardHeader>
      </CCard>

      <CRow className="g-4">
        {events.map((event) => (
          <CCol key={event.id} xs={12} sm={6} md={4} lg={6}>
            <CCard>
              <CCardHeader>
                <b style={{fontSize: '15px'}}>
                  {getDayOfWeek(event.date.toString())} -{' '}
                  {formatDateInPortuguese(event.date.toString())} -{' '}
                </b>
              </CCardHeader>
              <CCardBody>
                <p>
                  <b>{event.store.title}</b> - {event.title}
                </p>
                  <div style={{display: 'flex', gap: '4px'}}>
                  <CButton
                  size="sm"
                  color="secondary"
                  onClick={() => setVisibleOffcanvas(event.id.toString())}
                >
                  <EyeIcon size={14} /> Mostrar Detalhes
                </CButton>
                
                <CButton
                  size="sm"
                  className='text-white'
                  color='secondary'
                  onClick={() => router.push(`/app/admin/events/${event.id}`)}
                > <EditIcon size={14} />
                  Editar
                </CButton>

                <CButton
                  size="sm"
                  className='text-white'
                  color={event.isApproved ? 'danger' : 'dark'}
                  onClick={() => handleApproveEvent(event.id, event.isApproved)}
                > <KeyIcon size={14} /> {event.isApproved ? 'Trancar' : 'Liberar'}
                </CButton>

                  </div>
                <COffcanvas
                  placement="start"
                  visible={visibleOffcanvas === event.id.toString()}
                  onHide={() => setVisibleOffcanvas(null)}
                >
                  <COffcanvasHeader>
                    <COffcanvasTitle>Detalhes do Evento</COffcanvasTitle>
                    <CCloseButton
                      className="text-reset"
                      onClick={() => setVisibleOffcanvas(null)}
                    />
                  </COffcanvasHeader>
                  <COffcanvasBody>
                    <h3>Informações:</h3>
                    <p>
                      <b>Título:</b> {event.title}
                    </p>
                    <p>
                      <b>Estabelecimento:</b> {event.store.title}
                    </p>
                    <p>
                      <b>Dia do evento:</b> {formatDateInPortuguese(event.date.toDateString())}
                    </p>
                    <p>
                      <b>Responsável:</b> {event.responsable}
                    </p>
                    <p>
                      <b>Telefone:</b> {event.responsableTelephone}
                    </p>
                    <Link href={`/app/admin/events/${event.id}`}>
                      <CButton color="primary">Abrir detalhes</CButton>
                    </Link>
                    <h3 className="mt-4">Serviços do Mashguiach:</h3>

                    {event.EventsServices.length > 0 ? (
                      <div key={event.id} className="border p-4 rounded-lg mb-4">
                        {event.EventsServices.map((service, index) => (
                          <div key={index}>
                            <p>
                              <b>Entrada:</b>{' '}
                              {formatDateInPortuguese(service.arriveMashguiachTime.toDateString())}
                            </p>
                            <p>
                              <b>Saída:</b>{' '}
                              {formatDateInPortuguese(service.endMashguiachTime.toDateString())}
                            </p>
                            <p>
                              <b>Mashguiach:</b>{' '}
                              {service.mashguiachId ?? <CBadge color="danger">PENDENTE</CBadge>}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Nenhum serviço cadastrado.</p>
                    )}
                  </COffcanvasBody>
                </COffcanvas>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}

export default AdminSecondSection
