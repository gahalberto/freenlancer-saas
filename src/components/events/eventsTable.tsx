import { getEventServices } from '@/app/_actions/events/getEventsServices'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CLink,
  CTab,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTooltip,
} from '@coreui/react-pro'
import { EventsServices, User } from '@prisma/client'
import { useEffect, useState } from 'react'
import AddServiceToEventModal from './addServiceToEventModal'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { deleteEvent } from '@/app/_actions/events/deleteEvent'
import Link from 'next/link'

type PropsType = {
  eventStoreId: string
}

interface ServiceType extends EventsServices {
  Mashguiach: {
    name: string
  }
}

export const EventsTableByEvent = ({ eventStoreId }: PropsType) => {
  const [eventServicesList, setEventServiceList] = useState<ServiceType[]>([])
  const [visible, setVisible] = useState(false)

  const handleModalClick = () => {
    setVisible(!visible)
  }

  const fetchEventServices = async () => {
    const response = await getEventServices(eventStoreId)
    if (response) {
      setEventServiceList(response as ServiceType[])
    }
  }

  useEffect(() => {
    if (eventStoreId) {
      fetchEventServices()
    }
  }, [eventStoreId])

  const handleDeleteButton = async (id: string) => {
    if (confirm('Você tem certeza que deseja excluir esse evento?')) {
      await deleteEvent(id)
      fetchEventServices()
    }
  }

  return (
    <>
      <CCard textColor="primary" className={`mb-4 border-primary`} style={{ marginTop: '30px' }}>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Serviços de Mashguiach - Solicite um Mashguiach para cada dia</strong>
          <CButton color="primary" size="sm" onClick={handleModalClick}>
            Solicitar Serviço
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive="sm">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Mashguiach</CTableHeaderCell>
                <CTableHeaderCell scope="col">Início</CTableHeaderCell>
                <CTableHeaderCell scope="col">Fim</CTableHeaderCell>
                <CTableHeaderCell scope="col">Preço</CTableHeaderCell>
                <CTableHeaderCell scope="col">Local</CTableHeaderCell>
                <CTableHeaderCell scope="col">Observação</CTableHeaderCell>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {eventServicesList.map((service, index) => (
                <>
                  <CTableRow key={index}>
                    {/* Supondo que você tem o nome do mashguiach, use-o aqui */}
                    <CTableDataCell>
                      <Link href={`/app/profile/${service.mashguiachId}`}>
                        {service.mashguiachId ? `${service.Mashguiach.name}` : `S/M`}
                      </Link>
                    </CTableDataCell>

                    <CTableDataCell>
                      <small>
                        {new Date(service.arriveMashguiachTime).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>
                        {new Date(service.endMashguiachTime).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>R$ {service.mashguiachPrice}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CTooltip
                        content={`${service.address_street}, ${service.address_number} - ${service.address_neighbor} - ${service.address_city} - ${service.address_state}`}
                      >
                        <CLink> {service.workType ?? ''} </CLink>
                      </CTooltip>
                    </CTableDataCell>

                    <CTableDataCell>
                      <small>{service.observationText}</small>
                    </CTableDataCell>

                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="danger"
                        onClick={() => handleDeleteButton(service.id)}
                      >
                        <CIcon icon={cilTrash} color="danger" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow key={index}></CTableRow>
                </>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
      <AddServiceToEventModal
        fetchAll={() => fetchEventServices()}
        StoreEventsId={eventStoreId}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  )
}
