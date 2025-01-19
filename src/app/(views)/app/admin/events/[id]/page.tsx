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
  CCardText,
  CCardTitle,
  CCol,
  CDatePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CPlaceholder,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToast,
  CToastBody,
  CToastHeader,
} from '@coreui/react-pro'
import { EventsAdresses, StoreEvents, Stores } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { deleteAddresToEvenet } from '@/app/_actions/events/deleteAddresToEvent'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AddAddressModal from '../../../estabelecimento/events/[id]/AddAddressForm'
import { updateEvents } from '@/app/_actions/events/updateEvents'
import { getStores } from '@/app/_actions/stores/getStores'
import { getAllStores } from '@/app/_actions/stores/getAllStores'

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

const schema = z.object({
  title: z.string().min(1, { message: 'Digite um título para o evento' }),
  responsable: z.string().min(1, { message: 'Digite o responsável pelo evento' }),
  responsableTelephone: z
    .string()
    .min(1, { message: 'Digite o número de um responsável pelo evento.' }),
  nrPax: z.string(),
  address_zicode: z.string().min(1, { message: 'Digite o CEP e clique em buscar' }),
  address_street: z.string().min(1, { message: 'Digite a rua, digite o CEP e clique em buscar' }),
  address_number: z.string().min(1, { message: 'Digite o número do endereço' }),
  address_neighbor: z.string().min(1, { message: 'Digite o bairro' }),
  address_city: z.string().min(1, { message: 'Digite a cidade' }),
  address_state: z.string().min(1, { message: 'Digite o Estado' }),
  store: z.string().min(1, { message: 'Selecione uma loja' }),
  eventType: z.string().min(1, { message: 'Digite o tipo do evento, bar mitzvah?' }),
  serviceType: z.string().min(1, { message: 'O que será servido? Qual tipo de serviço?' }),
  date: z.string().refine(
    (value) => {
      const date = new Date(value)
      return !isNaN(date.getTime())
    },
    { message: 'Data inválida' },
  ),
})

type FormData = z.infer<typeof schema>

const EditEventPage = ({ params }: ParamsType) => {
  const { data: session, status } = useSession()
  const [disabled, setDisabled] = useState(true)
  const [event, setEvent] = useState<EventWithOwner | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [storeList, setStoreList] = useState<Stores[]>([])
  const [toasts, setToasts] = useState([]) // Estado para controlar toasts

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      responsable: '',
      responsableTelephone: '',
      nrPax: '',
      address_zicode: '',
      address_street: '',
      address_number: '',
      address_neighbor: '',
      address_city: '',
      address_state: '',
      store: '',
      eventType: '',
      serviceType: '',
      date: '',
    },
  })

  const fetchEvent = async () => {
    const response = await getEventInfo(params.id)
    if (response) {
      setEvent(response as EventWithOwner)
      setSelectedDate(new Date(response.date))

      // Habilita os campos apenas se o usuário tiver o role necessário
      if (session?.user.roleId === 3) {
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    }
  }

  const fetchStores = async () => {
    try {
      const response = await getAllStores()
      if (response) {
        setStoreList(response)
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
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
    const fetchEvent = async () => {
      const response = await getEventInfo(params.id)
      if (response) {
        setEvent(response as EventWithOwner)
        reset({
          title: response.title || '',
          responsable: response.responsable || '',
          responsableTelephone: response.responsableTelephone || '',
          nrPax: response.nrPax ? String(response.nrPax) : '',
          address_zicode: response.address_zicode || '',
          address_street: response.address_street || '',
          address_number: response.address_number || '',
          address_neighbor: response.address_neighbor || '',
          address_city: response.address_city || '',
          address_state: response.address_state || '',
          store: response.store?.id || '',
          eventType: response.eventType || '',
          serviceType: response.serviceType || '',
          date: response.date ? new Date(response.date).toISOString().split('T')[0] : '',
        })
      }
    }
    fetchStores()
    fetchEvent()
  }, [params.id, reset])

  const handleDeleteAddress = (id: string) => {
    deleteAddresToEvenet(id)
    fetchEvent()
  }

  const onSubmit = async (data: FormData) => {
    // Converte a data de string para Date
    const formattedData = {
      ...data,
      date: new Date(data.date), // Converte a data
      nrPax: parseInt(data.nrPax), // Garante que o campo `nrPax` seja numérico
      store: {
        connect: { id: data.store }, // Conecta a relação `store` pelo ID
      },
    }

    updateEvents({ data: formattedData, eventId: params.id })
    fetchEvent()
  }

  return (
    <CRow>
      <CCol xs={12}>
        {!event?.isApproved && (
          <CCardTitle className="text-center mb-4">
            <CBadge color="danger">ATENÇÃO: Analise o evento e libere!</CBadge>
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
            <p className="text-body-secondary small">
              Confira todos os dados do evento. Após o cadastro, o evento será enviado para
              aprovação.
            </p>
            <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)}>
              <CRow className="g-3">
                {/* Nome do Evento e Responsável */}
                <CCol md={6}>
                  <CFormLabel>Nome do Evento:</CFormLabel>
                  <CFormInput type="text" {...register('title')} invalid={!!errors.title} />
                  {errors.title && <p className="text-danger small">{errors.title.message}</p>}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Responsável pelo Evento:</CFormLabel>
                  <CFormInput
                    type="text"
                    {...register('responsable')}
                    invalid={!!errors.responsable}
                  />
                  {errors.responsable && (
                    <p className="text-danger small">{errors.responsable.message}</p>
                  )}
                </CCol>

                {/* Telefone e Estabelecimento */}
                <CCol md={6}>
                  <CFormLabel>Telefone do Responsável:</CFormLabel>
                  <CFormInput
                    type="text"
                    {...register('responsableTelephone')}
                    invalid={!!errors.responsableTelephone}
                  />
                  {errors.responsableTelephone && (
                    <p className="text-danger small">{errors.responsableTelephone.message}</p>
                  )}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Estabelecimento:</CFormLabel>
                  <CFormSelect {...register('store')} invalid={!!errors.store}>
                    <option>Selecione o estabelecimento</option>
                    {storeList.map((item, index) => (
                      <option value={item.id} key={index}>
                        {item.title}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.store && <p className="text-danger small">{errors.store.message}</p>}
                </CCol>

                {/* Tipo do Evento e Serviço */}
                <CCol md={6}>
                  <CFormLabel>Tipo do Evento:</CFormLabel>
                  <CFormInput type="text" {...register('eventType')} invalid={!!errors.eventType} />
                  {errors.eventType && (
                    <p className="text-danger small">{errors.eventType.message}</p>
                  )}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Serviço do Evento:</CFormLabel>
                  <CFormInput
                    type="text"
                    {...register('serviceType')}
                    invalid={!!errors.serviceType}
                  />
                  {errors.serviceType && (
                    <p className="text-danger small">{errors.serviceType.message}</p>
                  )}
                </CCol>

                {/* Data do Evento e Número de Pax */}
                <CCol md={6}>
                  <CFormLabel>Dia do Evento:</CFormLabel>
                  <CDatePicker
                    onDateChange={(date) => {
                      if (date instanceof Date && !isNaN(date.getTime())) {
                        setValue('date', date.toISOString().split('T')[0])
                      }
                    }}
                  />
                  {errors.date && <p className="text-danger small">{errors.date.message}</p>}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Qtd de Pax:</CFormLabel>
                  <CFormInput type="number" {...register('nrPax')} invalid={!!errors.nrPax} />
                  {errors.nrPax && <p className="text-danger small">{errors.nrPax.message}</p>}
                </CCol>
              </CRow>
              <CButton type="submit" color="primary" className="mt-3">
                Atualizar
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
        <CCard className="mb-4">
          <CCardHeader>MENU PDF</CCardHeader>
          <CCardBody>
            {event?.menuUrl && (
              <iframe
                src={event?.menuUrl}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="Menu PDF"
              ></iframe>
            )}
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
