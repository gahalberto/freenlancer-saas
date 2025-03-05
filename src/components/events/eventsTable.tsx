import { CCardTitle, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CLink,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CTooltip,
} from '@coreui/react-pro'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import AddServiceToEventModal from './addServiceToEventModal'
import ChangeMashguiachModal from './ChangeMashguiachModal'
import { getEventServices } from '@/app/_actions/events/getEventsServices'
import { deleteEvent } from '@/app/_actions/events/deleteEvent'
import Link from 'next/link'
import { EventsServices } from '@prisma/client'
import { getSession } from 'next-auth/react'
import FinishJobModal from './finishJobModal'
import { useUserSession } from '@/contexts/sessionContext'
import EditDatesModal from './EditDatesModal'

type PropsType = {
  eventStoreId: string
}

interface ServiceType extends EventsServices {
  Mashguiach: {
    name: string
  }
}

export const EventsTableByEvent = ({ eventStoreId }: PropsType) => {
  const {session} = useUserSession()

  const [eventServicesList, setEventServiceList] = useState<ServiceType[]>([])
  const [visible, setVisible] = useState(false)
  const [mashguiachModalVisible, setMashguiachModalVisible] = useState(false)
  const [finishEventModal, setFinishEventModal] = useState(false)
  const [selectService, setSelectService] = useState('')
  const [selectedMashguiach, setSelectedMashguiach] = useState<string | null>(null)
  const [userLogged, setUserLogged] = useState<any>(null)
  const [finishSelectService, setFinishSelectService] = useState<EventsServices | null>(null)
  const [editDatesModalVisible, setEditDatesModalVisible] = useState(false)
  const [selectedServiceForDates, setSelectedServiceForDates] = useState<string>('')

  const handleModalClick = () => {
    setVisible(!visible)
  }

  const handleMashguiachModalClick = (serviceId: string, mashguiachId?: string | null) => {
    setSelectService(serviceId)
    setMashguiachModalVisible(true)
    setSelectedMashguiach(mashguiachId ?? null) // Define o Mashguiach atual (ou null)
  }

  const handleEditDatesClick = (serviceId: string) => {
    setSelectedServiceForDates(serviceId)
    setEditDatesModalVisible(true)
  }

  const fetchEventServices = async () => {
    const response = await getEventServices(eventStoreId)
    if (response) {
      setEventServiceList(response as ServiceType[])
    }
  }

  const handleFinishEventModal = (serviceId: string) => {
    setFinishEventModal(true)
  }

  // Verifica se o usuário pode editar as datas de um serviço
  const canEditDates = (service: ServiceType) => {
    // Se não tem mashguiach, qualquer usuário pode editar
    if (!service.mashguiachId) {
      return true
    }
    
    // Se tem mashguiach, apenas administradores (roleId = 3) podem editar
    return session?.roleId === 3
  }

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession()
      setUserLogged(session?.user)
    }

    if (eventStoreId) {
      fetchEventServices()
    }

    fetchSession()
  }, [eventStoreId])

  const handleDeleteButton = async (id: string) => {
    if (confirm('Você tem certeza que deseja excluir esse evento?')) {
      await deleteEvent(id)
      fetchEventServices()
    }
  }
  console.log("SERVICES", eventServicesList)

  return (
    <>
    <CCard>
    <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>

          <strong>Serviços de Mashguiach</strong>

          </div>
          <CButton color="dark" size="lg" onClick={handleModalClick}>
            Solicitar Serviço
          </CButton>
</CCardHeader>
    </CCard>
      <CCard textColor="primary-emphasis" className={`mb-4 border-secondary`} style={{ marginTop: '30px' }}>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Lista de Mashguiach Solicitados</strong>
          <CButton color="info" size="sm" onClick={handleModalClick}>
            {eventServicesList.length} serviços solicitados
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
                <CTableRow key={index}>
                  <CTableDataCell>
                    {service.mashguiachId ? (
                      <span
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={() => handleMashguiachModalClick(service.id, service.mashguiachId)}
                      >
                        {service.Mashguiach.name}
                      </span>
                    ) : (
                      <span
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={() => handleMashguiachModalClick(service.id)}
                      >
                        S/M
                      </span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <small 
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleEditDatesClick(service.id)}
                    >
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
                    <small 
                      className={service.reallyMashguiachArrive ? 'text-muted' : 'text-danger'}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleEditDatesClick(service.id)}
                    > 
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
                  <CTableDataCell className='d-flex gap-2 '>
                    <CButton
                    className='text-white'
                      size="sm"
                      color="danger"
                      onClick={() => handleDeleteButton(service.id)}
                    >
                      <CIcon icon={cilTrash} color="danger" />
                    </CButton>
                    {userLogged?.roleId === 3 && (
                      <CButton color="dark" onClick={() => handleFinishEventModal(service.id)}>
                        Finalizar
                      </CButton>
                    )}
                    {finishEventModal && (
                      <FinishJobModal
                        onClose={() => {
                          setFinishEventModal(false)
                          fetchEventServices() // Atualiza a lista de serviços após o fechamento do modal
                        }}
                        service={service}
                        serviceId={service.id}
                      />
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
      <AddServiceToEventModal
        fetchAll={() => fetchEventServices()}
        StoreEventsId={eventStoreId}
        visible={visible}
        onClose={() => {
          setVisible(false)
          fetchEventServices()
        }}
      />
      {mashguiachModalVisible && (
        <ChangeMashguiachModal
          onClose={() => {
            setMashguiachModalVisible(false)
            fetchEventServices() // Atualiza a lista de serviços após o fechamento do modal
          }}
          serviceId={selectService}
          currentMashguiachId={selectedMashguiach} // Passa o Mashguiach atual
        />
      )}
      {editDatesModalVisible && (
        <EditDatesModal
          onClose={() => {
            setEditDatesModalVisible(false)
            fetchEventServices() // Atualiza a lista de serviços após o fechamento do modal
          }}
          serviceId={selectedServiceForDates}
          canEdit={canEditDates(eventServicesList.find(service => service.id === selectedServiceForDates) as ServiceType)}
        />
      )}
    </>
  )
}

export default EventsTableByEvent
