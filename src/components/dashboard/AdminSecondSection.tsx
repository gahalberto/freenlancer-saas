'use client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
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
} from '@coreui/react-pro'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import { useEffect, useState } from 'react'

type EventsWithServices = StoreEvents & {
  EventsServices: EventsServices[]
  store: Stores
  Mashguiach: {
    name: string
  }
}

const AdminSecondSection = () => {
  const [events, setEvents] = useState<EventsWithServices[]>([])
  const [visibleOffcanvas, setVisibleOffcanvas] = useState<string | null>(null)

  // Fetch events data from your API
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getAllEvents() // Atualize com sua rota real
      if (response) {
        setEvents(response)
      }
    }

    fetchEvents()
  }, [])

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

  if (events.length === 0) {
    return <p>Carregando...</p> // Indica que os dados estão carregando
  }

  if (!events) {
    return <p>Nenhum evento cadastrado.</p>
  }

  return (
    <div className="container">
      <CRow className="g-4">
        {events.map((event) => (
          <CCol key={event.id} xs={12} sm={6} md={4} lg={6}>
            <CCard>
              <CCardHeader>
                <b>
                  {getDayOfWeek(event.date.toString())} -{' '}
                  {formatDateInPortuguese(event.date.toString())} -{' '}
                  {event.isApproved ? (
                    <CBadge size="sm" color="primary">
                      APROVADO
                    </CBadge>
                  ) : (
                    <CBadge size="sm" color="danger">
                      PENDENTE
                    </CBadge>
                  )}{' '}
                </b>
              </CCardHeader>
              <CCardBody>
                <p>
                  <b>{event.store.title}</b> - {event.title}
                </p>
                <CButton
                  size="sm"
                  color="primary"
                  onClick={() => setVisibleOffcanvas(event.id.toString())}
                >
                  Mostrar Detalhes
                </CButton>
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
                    <h3>Serviços do Mashguiach:</h3>

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
                              {service.Mashguiach?.name ?? <CBadge color="danger">PENDENTE</CBadge>}
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
