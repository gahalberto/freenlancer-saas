'use client'

import { aproveEvent } from '@/app/_actions/events/aproveEvent'
import { getEventInfo } from '@/app/_actions/events/getEventInfo'
import ButtonCompo from '@/components/CButtonCom'
import { EventsTableByEvent } from '@/components/events/eventsTable'
import Map from '@/components/googleMaps'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardImage,
  CCardText,
  CCardTitle,
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CPlaceholder,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { EventsAdresses, StoreEvents } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import AddAdressModal from './AddAddressForm'

interface ParamsType {
  params: {
    id: string
  }
}

interface EventWithOwner extends StoreEvents {
  eventOwner: {
    name: string
  }
  store: {
    title: string
  }
  EventsAdresses: EventsAdresses[]
  responsableTelephone: string
}

const EditEventPage = ({ params }: ParamsType) => {
  const { data: session, status } = useSession()
  const [disabled, setDisabled] = useState(true)
  const [event, setEvent] = useState<EventWithOwner | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchEvent = async () => {
    const response = await getEventInfo(params.id)
    if (response) {
      setEvent(response as any)
      setSelectedDate(new Date(response.date))
    }
  }

  const handleAproveEvent = async (eventId: string, isApproved: boolean) => {
    const updatedEvent = await aproveEvent(eventId, !isApproved)
    if (updatedEvent) {
      setEvent((prevEvent) =>
        prevEvent ? { ...prevEvent, isApproved: !prevEvent.isApproved } : prevEvent,
      )
    }
  }

  const refreshAddresses = () => {
    fetchEvent()
  }

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  console.log(event)
  return (
    <CRow>
      <CCol xs={12}>
        {!event?.isApproved && (
          <CCardTitle>
            <CBadge color="danger">ATENÇÃO: Esse evento está em análise pelos rabinos!</CBadge>
          </CCardTitle>
        )}
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              Evento criado por: <strong>{event?.eventOwner?.name} </strong>
            </div>
            {session?.user.roleId === 3 && (
              <CButton
                onClick={() => handleAproveEvent(event?.id as string, event?.isApproved as boolean)}
                color="primary"
              >
                {event?.isApproved ? 'Trancar evento' : 'Liberar evento'}
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {/* Detalhes do Evento */}
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel>Estabelecimento:</CFormLabel>
                <CFormInput type="text" disabled={disabled} value={event?.store.title || ''} />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Nome do Evento:</CFormLabel>
                <CFormInput type="text" disabled={disabled} value={event?.title || ''} />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Responsável pelo Evento:</CFormLabel>
                <CFormInput type="text" disabled={disabled} value={event?.responsable || ''} />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Telefone do Responsável:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  value={event?.responsableTelephone || ''}
                />
              </CCol>
            </CRow>
            <CRow className="g-3">
              <CCol xs={12} sm={6}>
                <CFormLabel>Tipo do Evento:</CFormLabel>
                <CFormInput type="text" disabled={disabled} value={event?.eventType || ''} />
              </CCol>
              <CCol xs={12} sm={6}>
                <CFormLabel>Serviço do Evento:</CFormLabel>
                <CFormInput type="text" disabled={disabled} value={event?.serviceType || ''} />
              </CCol>
            </CRow>{' '}
          </CCardBody>
        </CCard>

        {/* Tabela de Endereços */}
        <CCard>
          <CCardHeader>
            Endereços <AddAdressModal storeEventId={params.id} onAddressAdded={refreshAddresses} />
          </CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover responsive="sm">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Tipo</CTableHeaderCell>
                    <CTableHeaderCell>Rua</CTableHeaderCell>
                    <CTableHeaderCell>Bairro</CTableHeaderCell>
                    <CTableHeaderCell>Cidade</CTableHeaderCell>
                    <CTableHeaderCell>CEP</CTableHeaderCell>
                    <CTableHeaderCell>Ações</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {event?.EventsAdresses?.map((address, index) => (
                    <CTableRow key={index}>
                      <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{address.workType}</CTableDataCell>
                      <CTableDataCell>{address.address_street}</CTableDataCell>
                      <CTableDataCell>{address.address_neighbor}</CTableDataCell>
                      <CTableDataCell>{address.address_city}</CTableDataCell>
                      <CTableDataCell>{address.address_zipcode}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" size="sm">
                          Remover
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>

        {/* Mapa do Google */}
        {/* <CCard>
          <CCardHeader>Mapa</CCardHeader>
          <CCardBody>
            <Map zipcode={event?.address_zicode} showButtons={false} />
            <div>
              Rua {event?.address_street}, {event?.address_number} - {event?.address_city}
            </div>
          </CCardBody>
        </CCard> */}

        {/* Renderiza o EventsTableByEvent apenas se o event.id estiver definido */}
        {event?.isApproved ? (
          <EventsTableByEvent eventStoreId={event.id} />
        ) : (
          <>
            <CCard style={{ width: '100%', marginTop: '20px' }}>
              <CCardHeader>
                <CCardTitle>Solicitação de Mashguiach</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <CPlaceholder as={CCardTitle} animation="glow" xs={12}>
                  <CBadge color="danger">EVENTO EM ANÁLISE!</CBadge>
                  <p> Você receberá um e-mail quando o evento for aprovado pelos rabinos.</p>
                  <CPlaceholder xs={6} />
                </CPlaceholder>
                <CPlaceholder as={CCardText} animation="glow">
                  <CPlaceholder xs={7} />
                  <CPlaceholder xs={4} />
                  <CPlaceholder xs={4} />
                  <CPlaceholder xs={6} />
                  <CPlaceholder xs={8} />
                </CPlaceholder>
                <CPlaceholder
                  as={CButton}
                  color="primary"
                  disabled
                  href="#"
                  tabIndex={-1}
                  xs={6}
                ></CPlaceholder>
              </CCardBody>
            </CCard>
          </>
        )}
      </CCol>
    </CRow>
  )
}

export default EditEventPage
