'use client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'
import AddServiceToEventModal from '@/components/events/addServiceToEventModal'
import Map from '@/components/googleMaps'
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
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type ServicesWithEvents = EventsServices & {
  StoreEvents: StoreEvents
}

type Props = {
  userId: string
  services: ServicesWithEvents[]
}

const NextEventsDashboard = ({ userId, services }: Props) => {
  console.log(services)
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
        {services.map((service) => (
          <CCol key={service.id} xs={12} sm={6} md={4} lg={6}>
            <CCard>
              <CCardHeader>
                <b>
                {service.StoreEvents.isApproved ? (<CBadge color='warning'>EVENTO APROVADO</CBadge>) : (<CBadge color='danger'>EVENTO PENDENTE</CBadge>)} | { " "}
                  {service.StoreEvents.title} -{' '}
                  {formatDateInPortuguese(service.arriveMashguiachTime.toString())} {' '}
                </b>
                <CButton
                  size="sm"
                  variant='outline'
                  onClick={() => setVisibleOffcanvas(service.id.toString())}
                >
                  Mostrar Detalhes
                </CButton>
              </CCardHeader>
            </CCard>
            <COffcanvas
              placement="start"
              visible={visibleOffcanvas === service.id.toString()}
              onHide={() => setVisibleOffcanvas(null)}
            >
              <COffcanvasHeader>
                <COffcanvasTitle>{service.StoreEvents.title}</COffcanvasTitle>
                <CCloseButton className="text-reset" onClick={() => setVisibleOffcanvas(null)} />
              </COffcanvasHeader>
              <COffcanvasBody>
                <b>Estabelecimento:</b> {service.StoreEvents.title}
                <div>
                  <b>Dia:</b> {formatDateInPortuguese(service.arriveMashguiachTime.toDateString())}
                </div>

                <div>
                  <b>Entrada:</b> {service.arriveMashguiachTime.toLocaleTimeString()}
                </div>

                <div>
                  <b>Saída:</b> {service.endMashguiachTime.toLocaleTimeString()}
                </div>

                <div>
                  <b>Responsável:</b> {service.StoreEvents.responsable}
                </div>
                <p>
                  <b>Telefone:</b> {service.StoreEvents.responsableTelephone}
                  <Link href={`https://wa.me/${service.StoreEvents.responsableTelephone}`}>
                    <CButton
                      size="sm"
                      className="text-white"
                      style={{ marginLeft: 2 }}
                      color="success"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} style={{ marginRight: 10 }} />
                      WhatsApp do Responsável
                    </CButton>
                  </Link>
                </p>
                <div>
                <div>
                    Rua {service?.address_street}, {service?.address_number} -{' '}
                    {service?.address_city}
                  </div>
                <Map zipcode={service.StoreEvents?.address_zicode} showButtons={true}  />
                </div>
              </COffcanvasBody>
            </COffcanvas>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}

export default NextEventsDashboard
