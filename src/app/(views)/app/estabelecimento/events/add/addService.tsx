import { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToast,
  CToastBody,
  CToastClose,
  CToastHeader,
  CTooltip,
} from '@coreui/react-pro'
import { createEventServices } from '@/app/_actions/events/createEventServices'
import { useSession } from 'next-auth/react'
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser'
import { useRouter } from 'next/navigation'
import { getAllMashguichim, getAvailableMashguichim } from '@/app/_actions/getAllMashguichim'
import CIcon from '@coreui/icons-react'
import { cilMap, cilSearch, cilTrash } from '@coreui/icons'
import { EventsServices, User } from '@prisma/client'
import { findStoreAddress } from '@/app/_actions/users/getUserAddress'
import { getEventServices } from '@/app/_actions/events/getEventsServices'
import { deleteEvent } from '@/app/_actions/events/deleteEvent'
import ChangeMashguiachModal from '@/components/events/ChangeMashguiachModal'
import { useUserSession } from '@/contexts/sessionContext'

type PropsType = {
  createdEventId: string
}

interface ServiceType extends EventsServices {
  Mashguiach: {
    name: string
  }
}

const AddServiceToEventModal = ({ createdEventId }: PropsType) => {
  const {session} = useUserSession()
  const [credits, setCredits] = useState(0)
  const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([])
  const [productionOrEvent, setProductionOrEvent] = useState<string>('')
  const [mashguiachSelected, setMashguiachSelected] = useState<string>('')

  // Estados para endereço
  const [addressZipcode, setAddressZipcode] = useState('')
  const [addressStreet, setAddressStreet] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [addressNeighbor, setAddressNeighbor] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressState, setAddressState] = useState('')

  const fetchCredits = async () => {
    const response = await getCreditsByUser()
    if (response) {
      setCredits(response.credits)
    }
  }

  const fetchUserAddress = async () => {
    try {
      const response = await findStoreAddress(createdEventId) // Função que busca o endereço do usuário
      if (response) {
        setAddressZipcode(response.address_zipcode || '')
        setAddressStreet(response.address_street || '')
        setAddressNumber(response.address_number || '')
        setAddressNeighbor(response.address_neighbor || '')
        setAddressCity(response.address_city || '')
        setAddressState(response.address_state || '')
      } else {
        alert('Endereço do usuário não encontrado.')
      }
    } catch (error) {
      console.error('Erro ao buscar endereço do usuário:', error)
      alert('Erro ao buscar o endereço do usuário.')
    }
  }

  // Monitora a mudança para "PRODUÇÃO"
  useEffect(() => {
    if (productionOrEvent === 'PRODUCAO') {
      fetchUserAddress() // Preenche os campos com o endereço do usuário
    } else {
      // Limpa os campos de endereço se não for "PRODUÇÃO"
      setAddressZipcode('')
      setAddressStreet('')
      setAddressNumber('')
      setAddressNeighbor('')
      setAddressCity('')
      setAddressState('')
    }
  }, [productionOrEvent])

  // Função atualizada para buscar mashguichim disponíveis
  const fetchMashguichim = async () => {
    // Se não temos horários selecionados, buscamos todos os mashguichim
    if (!arriveMashguiachTime || !endMashguiachTime) {
      console.log("Sem horários selecionados, buscando todos os mashguichim");
      const response = await getAllMashguichim();
      if (response) {
        console.log(`Encontrados ${response.length} mashguichim no total`);
        setMashguiachOptions(response);
      }
      return;
    }
    
    // Se temos horários selecionados, buscamos apenas os disponíveis
    try {
      console.log(`Buscando mashguichim disponíveis para o período:`, {
        inicio: arriveMashguiachTime.toLocaleString(),
        fim: endMashguiachTime.toLocaleString()
      });

      const availableMashguichim = await getAvailableMashguichim(
        arriveMashguiachTime,
        endMashguiachTime
      );
      
      console.log(`Encontrados ${availableMashguichim.length} mashguichim disponíveis`);
      setMashguiachOptions(availableMashguichim);
      
      // Se o mashguiach selecionado não está mais disponível, resetamos a seleção
      if (mashguiachSelected && mashguiachSelected !== '999') {
        const isStillAvailable = availableMashguichim.some(m => m.id === mashguiachSelected);
        console.log(`Mashguiach selecionado (${mashguiachSelected}) ainda está disponível? ${isStillAvailable}`);
        
        if (!isStillAvailable) {
          console.log(`Resetando seleção de mashguiach para ALEATÓRIO`);
          setMashguiachSelected('999');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar mashguichim disponíveis:', error);
      // Em caso de erro, carregamos todos os mashguichim
      const response = await getAllMashguichim();
      if (response) {
        setMashguiachOptions(response);
      }
    }
  };

  useEffect(() => {
    fetchCredits()
    fetchMashguichim()
  }, [])

  const router = useRouter()

  const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(null)
  const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [totalHours, setTotalHours] = useState<number>(0)
  const [observationText, setObservationText] = useState('')
  const [transportPrice, setTransportPrice] = useState(50)
  const [toast, setToast] = useState(false);

  // Atualizar a lista de mashguichim disponíveis quando os horários mudarem
  useEffect(() => {
    if (arriveMashguiachTime && endMashguiachTime) {
      fetchMashguichim();
    }
  }, [arriveMashguiachTime, endMashguiachTime]);

  const calculatePrice = (startDate: Date, endDate: Date) => {
    const differenceInHours = Math.max(
      0,
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
    )
    const effectiveHours = Math.ceil(differenceInHours)
    let price = 0

    for (let i = 0; i < effectiveHours; i++) {
      const hour = new Date(startDate.getTime() + i * 60 * 60 * 1000).getHours()
      price += hour >= 22 || hour < 6 ? 75 : 50
    }

    const minimumPrice = 250
    return { price: Math.max(minimumPrice, price), hours: effectiveHours }
  }

  useEffect(() => {
    if (arriveMashguiachTime && endMashguiachTime) {
      const { price, hours } = calculatePrice(arriveMashguiachTime, endMashguiachTime)
      setTotalPrice(price + transportPrice)
      setTotalHours(hours)
    }
  }, [arriveMashguiachTime, endMashguiachTime, transportPrice])

  const handleCepSearch = async () => {
    try {
      // Simula a busca de endereço pelo CEP
      const response = await fetch(`https://viacep.com.br/ws/${addressZipcode}/json/`)
      const data = await response.json()
      if (data.erro) throw new Error('CEP inválido')

      setAddressStreet(data.logradouro)
      setAddressNeighbor(data.bairro)
      setAddressCity(data.localidade)
      setAddressState(data.uf)
    } catch (error) {
      alert('Erro ao buscar endereço: ')
    }
  }

  const handleSubmit = async () => {
    if (!arriveMashguiachTime || !endMashguiachTime) {
      alert('Por favor, preencha todas as datas')
      return
    }
    try {
      const response = await createEventServices({
        StoreEventsId: createdEventId,
        arriveMashguiachTime,
        endMashguiachTime,
        isApproved: false,
        mashguiachId: mashguiachSelected !== '999' ? mashguiachSelected : null, // Envia undefined se for 999
        mashguiachPrice: totalPrice,
        mashguiachPricePerHour: 50,
        observationText,
        productionOrEvent,
        address_zipcode: addressZipcode,
        address_street: addressStreet,
        address_number: addressNumber,
        address_neighbor: addressNeighbor,
        address_city: addressCity,
        address_state: addressState,
      })

      if (response) {
        fetchEventServices()

        setToast(true)        
      } else {
        alert('Ocorreu um erro ao enviar o formulário.')
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Ocorreu um erro ao enviar o formulário.')
    }
  }

  const [eventServicesList, setEventServiceList] = useState<ServiceType[]>([])
  const [visible, setVisible] = useState(false)
  const [mashguiachModalVisible, setMashguiachModalVisible] = useState(false)
  const [selectService, setSelectService] = useState('')
  const [selectedMashguiach, setSelectedMashguiach] = useState<string | null>(null)

  const handleModalClick = () => {
    setVisible(!visible)
  }

  const handleMashguiachModalClick = (serviceId: string, mashguiachId?: string | null) => {
    setSelectService(serviceId)
    setMashguiachModalVisible(true)
    setSelectedMashguiach(mashguiachId ?? null) // Define o Mashguiach atual (ou null)
  }

  const fetchEventServices = async () => {
    const response = await getEventServices(createdEventId)
    if (response) {
      setEventServiceList(response as ServiceType[])
    }
  }

  useEffect(() => {
    if (createdEventId) {
      fetchEventServices()
    }
  }, [])

  const handleDeleteButton = async (id: string) => {
    if (confirm('Você tem certeza que deseja excluir esse evento?')) {
      await deleteEvent(id)
      fetchEventServices()
    }
  }

  const finalizarFuction = () => {
    if(eventServicesList.length === 0){
        alert('VOCÊ ESTÁ SALVANDO SEM ADICIONAR ENDEREÇO, ADICIONE AO MENOS UM DE EVENTO E/OU PRODUÇÃO')
        return
    }
    router.push(`/app/estabelecimento/events/${createdEventId}`)
}

  return (
    <>
      <CForm className="row g-3 mt-2">
        <CRow className="mt-2">
          <CCol lg={3}>
            <CFormLabel>Entrada do Mashguiach:</CFormLabel>
            <CInputGroup className="mb-3">
              <CDatePicker
                required
                timepicker
                placeholder="Selecione o horário de entrada"
                className="w-100"
                locale="pt-BR"
                onDateChange={(date: Date | null) => setArriveMashguiachTime(date || null)}
              />
            </CInputGroup>
          </CCol>

          <CCol md={3}>
            <CFormLabel>Saída do Mashguiach:</CFormLabel>
            <CInputGroup className="mb-3 w-100">
              <CDatePicker
                required
                timepicker
                placeholder="Selecione o horário de saída"
                className="w-100"
                locale="pt-BR"
                onDateChange={(date: Date | null) => setEndMashguiachTime(date || null)}
              />
            </CInputGroup>
          </CCol>

          <CCol md={3}>
            <CFormLabel>Evento ou produção:</CFormLabel>
            <CFormSelect
              value={productionOrEvent}
              onChange={(e) => setProductionOrEvent(e.target.value)}
            >
              <option>SELECIONE</option>
              <option value="PRODUCAO">PRODUÇÃO</option>
              <option value="EVENTO">EVENTO</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormLabel>
              <span className="font-bold">Mashguiach:</span>
            </CFormLabel>
            <CFormSelect
              value={mashguiachSelected}
              onChange={(e) => setMashguiachSelected(e.target.value)}
            >
              <option value="999">ALEATÓRIO</option>
              {mashguiachOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow className="">
          <CCol md={3}>
            <CFormLabel>CEP :</CFormLabel>
            <CInputGroup>
              <CFormInput
                placeholder="Digite o CEP"
                value={addressZipcode}
                onChange={(e) => setAddressZipcode(e.target.value)}
              />
              <CButton type="button" color="primary" onClick={handleCepSearch}>
                <CIcon icon={cilSearch} style={{ marginRight: 6 }} />
                
              </CButton>
            </CInputGroup>
          </CCol>

          <CCol md={3}>
            <CFormLabel>Rua:</CFormLabel>
            <CFormInput value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
          </CCol>

          <CCol md={1}>
            <CFormLabel>Número:</CFormLabel>
            <CFormInput value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
          </CCol>

          <CCol md={2}>
            <CFormLabel>Bairro:</CFormLabel>
            <CFormInput
              value={addressNeighbor}
              onChange={(e) => setAddressNeighbor(e.target.value)}
            />
          </CCol>

          <CCol md={2}>
            <CFormLabel>Cidade:</CFormLabel>
            <CFormInput value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
          </CCol>

          <CCol md={1}>
            <CFormLabel>Estado:</CFormLabel>
            <CFormInput value={addressState} onChange={(e) => setAddressState(e.target.value)} />
          </CCol>
        </CRow>

        <CRow className="mt-2">
          <CCol md={12}>
            <CFormLabel>Observação:</CFormLabel>
            <CFormTextarea
              placeholder="Escreva ou deixe em branco"
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
            />
          </CCol>
        </CRow>

        <CCol md={6}>
        <CTable>
          <CTableBody>
              <CTableRow>
                <CTableDataCell>
                  <strong>Valor da hora:</strong>
                </CTableDataCell>
                <CTableDataCell>R$ 50.00</CTableDataCell>
              </CTableRow>

              <CTableRow>
                <CTableDataCell>
                  <strong>Total de Horas:</strong>
                </CTableDataCell>
                <CTableDataCell>{totalHours.toFixed(2)}</CTableDataCell>
              </CTableRow>
          </CTableBody>
              </CTable>

            </CCol>
            <CCol md={6}>
            <CTable>
          <CTableBody>

              <CTableRow>
                <CTableDataCell>
                  <strong>Transporte:</strong>
                </CTableDataCell>
                <CTableDataCell>R$ {transportPrice.toFixed(2)}</CTableDataCell>
              </CTableRow>

              <CTableRow>
                <CTableDataCell>
                  <strong>Total a pagar:</strong>
                </CTableDataCell>
                <CTableDataCell>R$ {totalPrice.toFixed(2)}</CTableDataCell>
              </CTableRow>
          </CTableBody>
        </CTable>
            </CCol>
        <CButton color="primary" onClick={handleSubmit}>
          Adicionar Endereço & Solicitar Mashguiach
        </CButton>
      </CForm>
      <>
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
                          onClick={() =>
                            handleMashguiachModalClick(service.id, service.mashguiachId)
                          }
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
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        {mashguiachModalVisible && (
          <ChangeMashguiachModal
            onClose={() => {
              setMashguiachModalVisible(false)
              fetchEventServices() // Atualiza a lista de serviços após o fechamento do modal
            }}
            serviceId={selectService}
            currentMashguiachId={selectedMashguiach} // Passa o Mashguiach atual
          />
        )}{' '}
      </>
      <CRow className='mt-4'>
      <CButton color='secondary' disabled={session?.roleId !== 3} className='w-full' onClick={finalizarFuction}>Finalizar</CButton>

      </CRow>
    </>
  )
}

export default AddServiceToEventModal
