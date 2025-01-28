'use client'

import { aproveEvent } from '@/app/_actions/events/aproveEvent'
import { getEventInfo } from '@/app/_actions/events/getEventInfo'
import { EventsTableByEvent } from '@/components/events/eventsTable'
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
    getValues,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      responsable: '',
      responsableTelephone: '',
      nrPax: '',
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

  const onSubmit = async (data: FormData) => {
    try {
      // Corrige o deslocamento de fuso horário
      const localDate = new Date(data.date + 'T00:00:00'); // Adiciona "T00:00:00" para tratar como local
      const formattedData = {
        ...data,
        date: localDate, // Envia como objeto Date no fuso horário correto
        nrPax: parseInt(data.nrPax),
        store: {
          connect: { id: data.store },
        },
      };
      console.log('Dados formatados:', formattedData);
      await updateEvents({ data: formattedData, eventId: params.id });
      fetchEvent();
      alert("Atualizado com sucesso")
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    }
  };
  
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
            <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
              <p className="text-body-secondary small">
                Confira todos os dados do evento. Após o cadastro, o evento será enviado para
                aprovação.
              </p>
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
                        setValue('date', date.toISOString().split('T')[0]) // Formato para o backend
                      } else {
                        setValue('date', '') // Reseta se inválido
                      }
                    }}
                    placeholder={
                      getValues('date')
                        ? event?.date.toLocaleDateString()
                        : 'Selecione a data'
                    }
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
            </form>
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
        {event?.id && <EventsTableByEvent eventStoreId={event.id} />}
      </CCol>
    </CRow>
  )
}

export default EditEventPage
