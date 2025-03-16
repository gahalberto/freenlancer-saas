'use client'

import { useSession } from 'next-auth/react'
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
import { useRouter } from 'next/navigation'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'
import AddModalAddress from './AddressModal'

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
  const [modal, setModal] = useState<MODAL>(MODAL['ADDRESS'])
  const [events, setEvents] = useState<EventsWithServices[]>([])
  const [createdEventId, setCreatedEventId] = useState<string>(`d9911e17-1e1b-4df4-bb8c-f450c3c056c6`)
  const [showLogoAlert, setShowLogoAlert] = useState(false)
  const [showMenuAlert, setShowMenuAlert] = useState(false)
  const [storeWithoutLogo, setStoreWithoutLogo] = useState<Stores | null>(null)
  const [storeWithoutMenu, setStoreWithoutMenu] = useState<Stores | null>(null)

  const fetchEvents = async () => {
    const response = await getEventByEstabelecimento(userId) // Atualize com sua rota real
    if (response) {
      setEvents(response)
    }
  }

  if (!userId && status === 'authenticated') {
    console.error('User ID não encontrado na sessão.')
  }

  const fetchStores = async () => {
    if (!session) {
      return
    }
    try {
      const response = await getStores(session.user.id)
      if (response) {
        setStoreList(response)
        
        // Verificar se algum estabelecimento não tem logo
        const storeWithoutLogoFound = response.find(store => 
          !store.imageUrl || store.imageUrl === ''
        )
        
        if (storeWithoutLogoFound) {
          setShowLogoAlert(true)
          setStoreWithoutLogo(storeWithoutLogoFound)
        }
        
        // Verificar se algum estabelecimento não tem cardápio
        const storeWithoutMenuFound = response.find(store => 
          !store.menuUrl || store.menuUrl === ''
        )
        
        if (storeWithoutMenuFound) {
          setShowMenuAlert(true)
          setStoreWithoutMenu(storeWithoutMenuFound)
        }
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
      return
    }

    if (status === 'unauthenticated') {
      alert('Usuário não autenticado. Por favor, faça login.')
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchEvents()
      fetchStores()
    }
  }, [status, session])

  const onSubmit = async (data: FormData) => {
    setDisabled(true)
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
        if (result) {
          setCreatedEventId(result.id)
          setModal(MODAL['ADDRESS']);
          // router.push(`/app/estabelecimento/events/${result.event.id}`)
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
      {showLogoAlert && (
        <CRow className="mt-4 mb-4">
          <CCol>
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <div className="me-3">
                <strong>Atenção!</strong> Seu estabelecimento não possui logo cadastrada. 
                Isso é importante para a visualização do seu estabelecimento pelos clientes.
              </div>
              <CButton 
                color="primary" 
                size="sm" 
                onClick={() => router.push(`/app/stores/edit/${storeWithoutLogo?.id}`)}
              >
                Editar Estabelecimento
              </CButton>
            </div>
          </CCol>
        </CRow>
      )}
      
      {showMenuAlert && (
        <CRow className="mt-4 mb-4">
          <CCol>
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <div className="me-3">
                <strong>Atenção!</strong> Seu estabelecimento não possui cardápio cadastrado. 
                Isso é importante para que os clientes conheçam seus produtos e serviços.
              </div>
              <CButton 
                color="primary" 
                size="sm" 
                onClick={() => router.push(`/app/stores/edit/${storeWithoutMenu?.id}`)}
              >
                Editar Estabelecimento
              </CButton>
              <CButton 
                color="secondary" 
                size="sm" 
                className="ms-2"
                onClick={() => router.push(`/app/stores`)}
              >
                Ver Estabelecimentos
              </CButton>
            </div>
          </CCol>
        </CRow>
      )}
      
      <CRow className="mt-4">
        <CRow className="mt-4 mb-4 align-items-center">
          <CCol xs="auto" className="d-flex align-items-center">
            <h3 className="me-3">Seus próximos eventos:</h3>
            <CButton color="primary" size="sm" onClick={() => router.push('/app/estabelecimento/events/add')}>
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
            {modal === MODAL.ADDRESS && '2/2 - Adicionar endereço ao evento'}
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
                  <CButton type="submit" color="primary" className="mt-3" disabled={disabled}>
                    {disabled ? 'Aguarde...' : 'Adicionar Evento'}
                  </CButton>
                </CRow>
              </form>
            </>
          )}

{modal === MODAL.ADDRESS && createdEventId ? (
  <AddModalAddress />
) : <p>Carregando...</p>}

        </CModalBody>
      </CModal>
      



    </>
  )
}

export default MashguiachDashboardPage
