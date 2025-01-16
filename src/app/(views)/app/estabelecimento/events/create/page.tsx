'use client'

import { useEffect, useState } from 'react'
import { CreateEvent } from '@/app/_actions/events/createEvent'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getStores } from '@/app/_actions/stores/getStores'
import { Stores } from '@prisma/client'
import CIcon from '@coreui/icons-react'
import { cilMap, cilSearch } from '@coreui/icons'

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

const CreateEventForm = () => {
  const router = useRouter()

  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [disabled, setDisabled] = useState(false)
  const [storeList, setStoreList] = useState<Stores[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (session?.user?.id) {
          const response = await getStores(session.user.id)
          if (response) {
            setStoreList(response)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar lojas:', error)
      }
    }

    fetchStores()
  }, [session?.user?.id])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setDisabled(true)

    if (!session || !session.user) {
      console.log('Usuário não autenticado')
      setDisabled(false)
      return
    }

    const eventData = {
      title: data.title,
      responsable: data.responsable,
      responsableTelephone: data.responsableTelephone,
      nrPax: parseInt(data.nrPax),
      address_zicode: data.address_zicode,
      address_street: data.address_street,
      address_number: data.address_number,
      address_city: data.address_city,
      address_neighbor: data.address_neighbor,
      address_state: data.address_state,
      eventType: data.eventType,
      serviceType: data.serviceType,
      date: new Date(selectedDate),
      eventOwner: {
        connect: { id: session.user.id }, // Referencia o dono do evento
      },
      store: {
        connect: { id: data.store }, // Conecta o evento à loja usando o ID da loja
      },
      clientName: data.responsable,
      isApproved: false,
    }

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('responsable', data.responsable)
    formData.append('responsableTelephone', data.responsableTelephone)
    formData.append('clientName', data.responsable) // Garantir o campo obrigatório
    formData.append('nrPax', data.nrPax.toString()) // Converter para string
    formData.append('address_zicode', data.address_zicode)
    formData.append('address_street', data.address_street)
    formData.append('address_number', data.address_number)
    formData.append('address_neighbor', data.address_neighbor)
    formData.append('address_city', data.address_city)
    formData.append('address_state', data.address_state)
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
        alert('Tudo certo!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro desconhecido.')
      }
    } catch (error) {
      console.error('Erro ao criar o evento:', error)
      alert('Erro ao criar o evento. Tente novamente mais tarde.')
    } finally {
      setDisabled(false)
    }
  }

  const handlecep = async () => {
    const newCep = getValues('address_zicode').replace(/\D/g, '')

    if (newCep.length >= 8) {
      const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`)
      const cepData = await response.json()
      if (cepData.erro) {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.')
        return
      }
      setValue('address_street', cepData.logradouro || '')
      setValue('address_neighbor', cepData.bairro || '')
      setValue('address_city', cepData.localidade || '')
      setValue('address_state', cepData.uf || '')
    } else {
      alert('CEP inválido, digite um CEP válido!')
    }
  }

  return (
    <CRow>
      <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Dados do evento</strong>
            </CCardHeader>
            <CCardBody>
              <p className="text-body-secondary small">
                Confira todos os dados do evento. Após o cadastro, o evento será enviado para
                aprovação.
              </p>
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
                  <CFormSelect disabled={disabled} {...register('store')} invalid={!!errors.store}>
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
                        setValue('date', date.toISOString().split('T')[0])
                        setSelectedDate(date.toISOString().split('T')[0])
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

              <CButton type="submit" color="primary" disabled={disabled} className="mt-3">
                Criar Evento
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <CCard className="mb-4">
          <CCardHeader>
            <strong>Endereço do evento</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>CEP do local do evento:</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Digite o seu cep!"
                    autoComplete="address"
                    {...register('address_zicode')}
                  />
                  <CButton type="button" onClick={handlecep} color="primary">
                    <CIcon icon={cilSearch} style={{ marginRight: 6 }} />
                    Buscar
                  </CButton>
                </CInputGroup>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Rua:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register('address_street')}
                  invalid={!!errors.address_street}
                />
                {errors.address_street && <p>{errors.address_street.message}</p>}
              </CCol>

              <CCol md={2}>
                <CFormLabel>Número:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register('address_number')}
                  invalid={!!errors.address_number}
                />
                {errors.address_number && <p>{errors.address_number.message}</p>}
              </CCol>

              <CCol md={4}>
                <CFormLabel>Bairro:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register('address_neighbor')}
                  invalid={!!errors.address_neighbor}
                />
                {errors.address_neighbor && <p>{errors.address_neighbor.message}</p>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Cidade:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register('address_city')}
                  invalid={!!errors.address_city}
                />
                {errors.address_city && <p>{errors.address_city.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Estado:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register('address_state')}
                  invalid={!!errors.address_state}
                />
                {errors.address_state && <p>{errors.address_state.message}</p>}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </form>
    </CRow>
  )
}

export default CreateEventForm
