'use client'
import { getStores } from '@/app/_actions/stores/getStores'
import { getAllStores } from '@/app/_actions/stores/getAllStores'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CProgress,
  CProgressBar,
  CRow,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { EventsServices, StoreEvents, Stores } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import AddServiceToEventModal from './addService'
import { set } from 'date-fns'

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
  date: z.date(),
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

const AddEventFormPage = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id || ''
  const roleId = session?.user?.roleId || 0
  const [modalVisible, setModalVisible] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeList, setStoreList] = useState<Stores[]>([])
  const [modal, setModal] = useState<MODAL>(MODAL['EVENT'])
  const [events, setEvents] = useState<EventsWithServices[]>([])
  const [createdEventId, setCreatedEventId] = useState<string>(
    ``,
  )
  const [progress, setProgress] = useState<number>(40)

  const fetchStores = async () => {
    if (!session) {
      return
    }
    try {
      let response;
      
      // Se for admin (roleId = 3), buscar todos os estabelecimentos
      if (roleId === 3) {
        console.log('Usuário é admin, buscando todos os estabelecimentos')
        response = await getAllStores()
      } else {
        // Se for estabelecimento (roleId = 2), buscar apenas os estabelecimentos do usuário
        console.log('Usuário é estabelecimento, buscando estabelecimentos do usuário')
        response = await getStores(session.user.id)
      }
      
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
      return
    }

    if (status === 'unauthenticated') {
      alert('Usuário não autenticado. Por favor, faça login.')
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.id) {
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
          setProgress(80)
          setModal(MODAL['ADDRESS'])
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
      <CCard className="mb-3">
          <CCardHeader>
            <CCardTitle className='flex'>
            {modal === MODAL.EVENT ? (<strong>Criar Evento</strong>) : (<strong>Solicitar Mashguiach</strong>) }

            </CCardTitle>
            <span className="text-gray-400">
              {modal === MODAL.EVENT ? (
                'Preencha os dados do evento'
              ) : (
                'Adicione os serviços ao evento com endereços.'
              )}
            </span>

          </CCardHeader>
        </CCard>

        <CProgress color="success" value={progress} className="mb-2">
          <CProgressBar className="text-white">{progress}%</CProgressBar>
        </CProgress>
        <CCard>
          <CCardBody>
            <p className="text-body-secondary small">
              Confira todos os dados do evento. Após o cadastro, o evento será enviado para
              aprovação.
            </p>
            {modal === MODAL.EVENT && (
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
                      onDateChange={(date: Date | null) => {
                        if (date) {
                          setValue('date', date)
                        }
                      }}

                      //                onDateChange={(date: Date | null) => setArriveMashguiachTime(date || null)}

                      // onDateChange={(date) => {
                      //   if (date instanceof Date && !isNaN(date.getTime())) {
                      //     setValue('date', date.toISOString().split('T')[0]) // Atualiza o campo do formulário diretamente
                      //   } else {
                      //     setValue('date', '') // Limpa o campo
                      //   }
                      // }}
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
                  <CButton type="submit" color="secondary" className="mt-3" disabled={disabled}>
                    {disabled ? 'Aguarde...' : 'Próximo passo 2/2'}
                  </CButton>
                  <label>Atenção: Após clicar acima, não poderá voltar! Verifique os dados!</label>
                </CRow>
              </form>
            )}
                  {modal === MODAL.ADDRESS && <AddServiceToEventModal createdEventId={String(createdEventId)} />}

          </CCardBody>
        </CCard>
      </>

  )
}

export default AddEventFormPage
