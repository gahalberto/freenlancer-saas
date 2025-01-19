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
} from '@coreui/react-pro'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type EventsWithServices = StoreEvents & {
  EventsServices: EventsServices[]
}

type Props = {
  userId: string
  events: EventsWithServices[]
}

const EventsStoreDashboard = ({ userId, events }: Props) => {
  console.log(events)
  const [visibleOffcanvas, setVisibleOffcanvas] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const handleModalClick = () => {
    setVisible(!visible)
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
  return (
    <div className="">
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
                  <b>{event.title}</b> - {event.date.toLocaleDateString()}
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
                      <b>Estabelecimento:</b> {event.title}
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
                    <div className="d-flex gap-2 mt-3">
                      <Link href={`/app/estabelecimento/events/${event.id}`}>
                        <CButton color="primary">Abrir detalhes</CButton>
                      </Link>
                      <CButton color="warning" onClick={handleModalClick}>
                        Solicitar Serviço
                      </CButton>
                    </div>

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

export default EventsStoreDashboard
