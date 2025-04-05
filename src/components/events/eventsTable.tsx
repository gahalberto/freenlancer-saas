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
import { EventsServices, StoreEvents, User } from '@prisma/client'
import { getSession } from 'next-auth/react'
import FinishJobModal from './finishJobModal'
import { useUserSession } from '@/contexts/sessionContext'
import EditDatesModal from './EditDatesModal'
import { calculateMashguiachPrice } from "@/app/_actions/getAllMashguichim"

type PropsType = {
  eventStoreId: string
}

// Interface para a versão completa de EventsServices com todas as relações necessárias
interface EventsServiceWithRelations extends EventsServices {
  StoreEvents?: StoreEvents
  Mashguiach?: User | null
}

// Interface para o serviço retornado pela API
interface ServiceType extends EventsServices {
  StoreEvents?: StoreEvents
  Mashguiach: {
    name: string
    id?: string
    roleId?: number
    [key: string]: any // Permitir propriedades adicionais
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
                    <small>R$ {(() => {
                      try {
                        console.log('Valores do serviço:', {
                          arriveMashguiachTime: service.arriveMashguiachTime,
                          endMashguiachTime: service.endMashguiachTime,
                          dayHourValue: service.dayHourValue,
                          nightHourValue: service.nightHourValue,
                          transport_price: service.transport_price
                        });

                        const mashguiachPrice = calculateMashguiachPrice(
                          new Date(service.arriveMashguiachTime),
                          new Date(service.endMashguiachTime),
                          Number(service.dayHourValue) || 0,
                          Number(service.nightHourValue) || 0
                        );
                        
                        console.log('Preço do mashguiach calculado:', mashguiachPrice);
                        
                        const transportPrice = Number(service.transport_price) || 0;
                        console.log('Preço do transporte:', transportPrice);
                        
                        const totalPrice = mashguiachPrice + transportPrice;
                        console.log('Preço total:', totalPrice);
                        
                        return totalPrice.toFixed(2);
                      } catch (error) {
                        console.error('Erro ao calcular preço:', error);
                        return '0.00';
                      }
                    })()}</small>
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
                    {service.paymentStatus === 'Success' && (
                      <CButton className='text-white' color='success'>Pago</CButton>
                    )}
                    {userLogged?.roleId === 3 && service.paymentStatus === 'Pending' && (
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
                        service={service as any}
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
