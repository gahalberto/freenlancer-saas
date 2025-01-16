'use client'
import { getStores } from '@/app/_actions/stores/getStores'
import {
  CButton,
  CCol,
  CDatePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { Stores } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

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

type Props = {
  userId: string
}

const AddEventModal = ({ userId }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeList, setStoreList] = useState<Stores[]>([])
  const [disabled, setDisabled] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    console.log('Efeito de busca de lojas chamado')
    const fetchStores = async () => {
      try {
        const response = await getStores(userId)
        console.log('Resposta das lojas:', response)
        if (response) {
          setStoreList(response)
        }
      } catch (error) {
        console.error('Erro ao buscar lojas:', error)
      }
    }

    fetchStores()
  }, [])

  const onSubmit = async (data: FormData) => {
    console.log('CHEGANDO AQUI')
    console.log('Dados do formulário:', data)
    try {
      const response = await fetch('/api/uploadEventMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date).toISOString(),
        }),
      })

      if (response.ok) {
        console.log('Evento criado com sucesso')
        alert('Evento criado com sucesso!')
        setModalVisible(false) // Fecha o modal após o envio bem-sucedido
      } else {
        const errorResponse = await response.json()
        console.error('Erro ao criar evento:', errorResponse)
        alert('Erro ao criar o evento.')
      }
    } catch (error) {
      console.error('Erro ao criar o evento:', error)
    }
  }

  return (
    <>
      <CRow className="mt-4 mb-4 align-items-center">
        <CCol xs="auto" className="d-flex align-items-center">
          <h3 className="me-3">Seus próximos eventos:</h3>
          <CButton color="primary" size="sm" onClick={() => setModalVisible(!modalVisible)}>
            Adicionar
          </CButton>
        </CCol>
      </CRow>
      <CModal
        size="xl"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="OptionalSizesExample1"
      >
        <CModalHeader>
          <CModalTitle id="OptionalSizesExample1">Adicionar um novo evento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <form
            className="row g-3"
            onSubmit={handleSubmit((data) => {
              console.log('Submissão do formulário chamada')
              onSubmit(data)
            })}
          >
            {' '}
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
            {/* Outros campos aqui... */}
            <CRow>
              <CButton
                color="primary"
                size="sm"
                onClick={() => {
                  console.log('Modal aberto')
                  setModalVisible(!modalVisible)
                }}
              ></CButton>
            </CRow>
          </form>
        </CModalBody>
      </CModal>
    </>
  )
}

export default AddEventModal
