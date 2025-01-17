'use client'

import { useSession } from 'next-auth/react'
import { cilBadge, cilCalendar, cilList, cilMoney, cilPlus, cilStar } from '@coreui/icons'
import MashguiachButtonGroup from '@/components/dashboard/MashguiachButtonGroupt'
import {
  CButton,
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import EventsStoreDashboard from './EventsSection'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getStores } from '@/app/_actions/stores/getStores'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import StoresList from '../../stores/page'
import { useRouter } from 'next/navigation'
import AddModalAddress from './AddressModal'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'

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

enum MODAL {
  EVENT,
  ADDRESS,
  SERVICE,
}

type EventsWithServices = StoreEvents & {
  EventsServices: EventsServices[]
}

const MashguiachDashboardPage = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id || ''
  const [modalVisible, setModalVisible] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeList, setStoreList] = useState<Stores[]>([])
  const [modal, setModal] = useState<MODAL>(MODAL['EVENT'])
  const [events, setEvents] = useState<EventsWithServices[]>([])

  const fetchEvents = async () => {
    const response = await getEventByEstabelecimento(userId) // Atualize com sua rota real
    if (response) {
      setEvents(response)
    }
  }

  const fetchStores = async () => {
    if (!session) {
      return
    }
    try {
      const response = await getStores(session.user.id)
      if (response) {
        setStoreList(response)
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      // O estado de carregamento está ativo; não fazer nada até obter a autenticação
      return
    }

    if (status === 'unauthenticated') {
      // Se o usuário não está autenticado, redirecionar para a página de login
      alert('Usuário não autenticado. Por favor, faça login.')
      router.push('/login')
      return
    }

    // Se o usuário estiver autenticado, carregue os dados
    if (status === 'authenticated' && session?.user?.id) {
      fetchEvents()
      fetchStores()
    }
  }, [status, session?.user?.id]) // Inclua status para evitar comportamento inesperado

  const onSubmit = async (data: FormData) => {
    setDisabled(true)
    console.log(userId)
    const eventData = {
      title: data.title,
      responsable: data.responsable,
      responsableTelephone: data.responsableTelephone,
      nrPax: parseInt(data.nrPax),
      eventType: data.eventType,
      serviceType: data.serviceType,
      date: new Date(data.date),
      eventOwner: {
        connect: { id: userId }, // Referencia o dono do evento
      },
      store: {
        connect: { id: data.store }, // Conecta o evento à loja usando o ID da loja
      },
      clientName: data.responsable,
      isApproved: false,
      userId: userId,
    }

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('responsable', data.responsable)
    formData.append('responsableTelephone', data.responsableTelephone)
    formData.append('clientName', data.responsable) // Garantir o campo obrigatório
    formData.append('nrPax', data.nrPax.toString()) // Converter para string
    formData.append('store', data.store) // Certifique-se de enviar apenas o ID
    formData.append('eventType', data.eventType)
    formData.append('serviceType', data.serviceType)
    formData.append('date', new Date(data.date).toISOString()) // Enviar a data no formato ISO-8601

    if (pdfFile) {
      formData.append('menuFile', pdfFile)
    }

    try {
      const response = await fetch('/api/uploadEventMenu', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result?.event?.id) {
          setEvents(result.event) // Armazena o evento com ID
        } else {
          alert('Erro: ID do evento não encontrado.')
        }
      }
    } catch (error) {
      console.error('Erro ao criar o evento:', error)
      alert('Erro ao criar o evento. Tente novamente mais tarde.')
    } finally {
      setDisabled(false)
    }
  }

  return (
    <>
      <CRow className="mt-4">
        <CRow className="mt-4 mb-4 align-items-center">
          <CCol xs="auto" className="d-flex align-items-center">
            <h3 className="me-3">Seus próximos eventos:</h3>
            <CButton color="primary" size="sm" onClick={() => setModalVisible(!modalVisible)}>
              Adicionar
            </CButton>
          </CCol>
        </CRow>
        <EventsStoreDashboard userId={userId} events={events} />
      </CRow>

      <CModal
        size="xl"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="OptionalSizesExample1"
      >
        <CModalHeader>
          <CModalTitle id="OptionalSizesExample1">
            {modal === MODAL.EVENT && '1/2 - Adicionar um novo evento'}
            {modal === MODAL.ADDRESS && '2/2 - Adicionar endereços ao evento'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {modal === MODAL.EVENT && (
            <>
              <p className="text-body-secondary small">
                Confira todos os dados do evento. Após o cadastro, o evento será enviado para
                aprovação.
              </p>
              <form
                className="row g-3"
                onSubmit={handleSubmit(onSubmit)} // Remova o e.preventDefault() manual
              >
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Nome do Evento:</CFormLabel>
                    <CFormInput type="text" {...register('title')} invalid={!!errors.title} />
                    {errors.title && <p>{errors.title.message}</p>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Responsável pelo Evento:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('responsable')}
                      invalid={!!errors.responsable}
                    />
                    {errors.responsable && <p>{errors.responsable.message}</p>}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Telefone do responsável:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('responsableTelephone')}
                      invalid={!!errors.responsableTelephone}
                    />
                    {errors.responsableTelephone && <p>{errors.responsableTelephone.message}</p>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Estabelecimento:</CFormLabel>
                    <CFormSelect
                      disabled={disabled}
                      {...register('store')}
                      invalid={!!errors.store}
                    >
                      <option>Selecione o estabelecimento</option>
                      {storeList.map((item, index) => (
                        <option value={item.id} key={index}>
                          {item.title}
                        </option>
                      ))}
                    </CFormSelect>
                    {errors.store && <p>{errors.store.message}</p>}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Tipo do Evento:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('eventType')}
                      invalid={!!errors.eventType}
                    />
                    {errors.eventType && <p>{errors.eventType.message}</p>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Serviço do Evento:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('serviceType')}
                      invalid={!!errors.serviceType}
                    />
                    {errors.serviceType && <p>{errors.serviceType.message}</p>}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Tipo do Evento:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('eventType')}
                      invalid={!!errors.eventType}
                    />
                    {errors.eventType && <p>{errors.eventType.message}</p>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Serviço do Evento:</CFormLabel>
                    <CFormInput
                      type="text"
                      disabled={disabled}
                      {...register('serviceType')}
                      invalid={!!errors.serviceType}
                    />
                    {errors.serviceType && <p>{errors.serviceType.message}</p>}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Dia do Evento:</CFormLabel>
                    <CDatePicker
                      disabled={disabled}
                      onDateChange={(date) => {
                        if (date instanceof Date && !isNaN(date.getTime())) {
                          setValue('date', date.toISOString().split('T')[0]) // Atualiza o campo do formulário diretamente
                        } else {
                          setValue('date', '') // Limpa o campo
                        }
                      }}
                    />
                    {errors.date && <p>{errors.date.message}</p>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>Qtd de Pax:</CFormLabel>
                    <CFormInput
                      type="number"
                      disabled={disabled}
                      {...register('nrPax')}
                      invalid={!!errors.nrPax}
                    />
                    {errors.nrPax && <p>{errors.nrPax.message}</p>}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>
                      Cardápio do Evento:{' '}
                      <span style={{ fontSize: '12px', color: 'gray' }}>somente arquivos PDF</span>
                    </CFormLabel>
                    <CFormInput
                      id="menuFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setPdfFile(file)
                        } else {
                          setPdfFile(null)
                        }
                      }}
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </CCol>
                </CRow>
                <CRow>
                  <CButton type="submit" color="primary" className="mt-3">
                    CRIAR EVENTO
                  </CButton>
                </CRow>
              </form>
            </>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default MashguiachDashboardPage
