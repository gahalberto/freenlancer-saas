'use client'
import { AddAddressToEvent } from '@/app/_actions/events/addAddressToEvent'
import { deleteAddresToEvenet } from '@/app/_actions/events/deleteAddresToEvent'
import { getAddressByEventId } from '@/app/_actions/events/getAddressByEventId'
import { cilMap, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CDatePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CPopover,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { EventsAdresses } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  address_zipcode: z.string().min(1, { message: 'Digite o CEP e clique em buscar' }),
  address_street: z.string().min(1, { message: 'Digite a rua' }),
  address_number: z.string().min(1, { message: 'Digite o número do endereço' }),
  address_neighbor: z.string().min(1, { message: 'Digite o bairro' }),
  address_city: z.string().min(1, { message: 'Digite a cidade' }),
  address_state: z.string().min(1, { message: 'Digite o Estado' }),
  workType: z.enum(['PRODUCAO', 'EVENTO'], {
    errorMap: () => ({ message: 'Selecione se o serviço é produção ou evento' }),
  }),
})

type FormData = z.infer<typeof schema>

type Props = {
  eventId: string
}

const AddModalAddress = () => {
  const [eventAddresses, setEventAddresses] = useState<EventsAdresses[]>([])
  const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(null)
  const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [totalHours, setTotalHours] = useState<number>(0)
  const [observationText, setObservationText] = useState('')
  const [transportPrice, setTransportPrice] = useState(50)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const calculatePrice = (startDate: Date, endDate: Date) => {
    const differenceInHours = Math.max(
      0,
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
    )
    const effectiveHours = Math.ceil(differenceInHours) // Arredondar para cima
    let price = 0

    for (let i = 0; i < effectiveHours; i++) {
      const hour = new Date(startDate.getTime() + i * 60 * 60 * 1000).getHours()
      // Valor por hora ajustado para considerar a partir de 22:00
      price += hour >= 22 || hour < 6 ? 75 : 50
    }

    const minimumPrice = 250 // Valor mínimo de 5 horas
    return { price: Math.max(minimumPrice, price), hours: effectiveHours }
  }

  const handleCepSearch = async () => {
    const cep = getValues('address_zipcode').replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (data.erro) throw new Error('CEP não encontrado.')
        setValue('address_street', data.logradouro || '')
        setValue('address_neighbor', data.bairro || '')
        setValue('address_city', data.localidade || '')
        setValue('address_state', data.uf || '')
      } catch {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.')
      }
    } else {
      alert('CEP inválido, digite um CEP válido!')
    }
  }

  // const fetchAllAddresses = async () => {
  //   try {
  //     const response = await getAddressByEventId(eventId)
  //     setEventAddresses(Array.isArray(response) ? response : [])
  //   } catch (error) {
  //     console.error('Erro ao buscar endereços:', error)
  //     setEventAddresses([])
  //   }
  // }

  // const handleDeleteAddress = (id: string) => {
  //   deleteAddresToEvenet(id)
  //   fetchAllAddresses()
  // }

  // useEffect(() => {
  //   if (arriveMashguiachTime && endMashguiachTime) {
  //     const { price, hours } = calculatePrice(arriveMashguiachTime, endMashguiachTime)
  //     setTotalPrice(price + transportPrice)
  //     setTotalHours(hours)
  //   }
  //   fetchAllAddresses()
  // }, [arriveMashguiachTime, endMashguiachTime, transportPrice])

  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     const formattedData = {
  //       ...data,
  //       storeEventId: eventId,
  //     }

  //     await AddAddressToEvent(formattedData)
  //     fetchAllAddresses()
  //     alert('Endereço adicionado com sucesso!')
  //   } catch (error) {
  //     console.error(error)
  //     alert('Ocorreu um erro ao adicionar o endereço.')
  //   }
  // })

  return (
    <CForm onSubmit={() => {}}>
      <CRow className="gy-3">
        <span>
          Agora é o moomento de colocar os endereço(s) do evento. Se for produção seleciona o tipo
          PRODUCAO ou um dia único que seria o própio evento selecione EVENTO ou ambos se for o
          caso.
        </span>
        <CCol md={3}>
          <CFormLabel>CEP:</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilMap} />
            </CInputGroupText>
            <CFormInput
              placeholder="Digite o CEP"
              {...register('address_zipcode')}
              className={errors.address_zipcode ? 'is-invalid' : ''}
            />
            <CButton type="button" color="primary" onClick={handleCepSearch}>
              <CIcon icon={cilSearch} style={{ marginRight: 6 }} /> Buscar
            </CButton>
          </CInputGroup>
          {errors.address_zipcode && (
            <div className="text-danger">{errors.address_zipcode.message}</div>
          )}
        </CCol>

        <CCol md={4}>
          <CFormLabel>Rua:</CFormLabel>
          <CFormInput
            {...register('address_street')}
            placeholder="Rua"
            className={errors.address_street ? 'is-invalid' : ''}
          />
          {errors.address_street && (
            <div className="text-danger">{errors.address_street.message}</div>
          )}
        </CCol>

        <CCol md={2}>
          <CFormLabel>Número:</CFormLabel>
          <CFormInput
            {...register('address_number')}
            placeholder="Número"
            className={errors.address_number ? 'is-invalid' : ''}
          />
          {errors.address_number && (
            <div className="text-danger">{errors.address_number.message}</div>
          )}
        </CCol>

        <CCol md={3}>
          <CFormLabel>Bairro:</CFormLabel>
          <CFormInput
            {...register('address_neighbor')}
            placeholder="Bairro"
            className={errors.address_neighbor ? 'is-invalid' : ''}
          />
          {errors.address_neighbor && (
            <div className="text-danger">{errors.address_neighbor.message}</div>
          )}
        </CCol>

        <CCol md={3}>
          <CFormLabel>Cidade:</CFormLabel>
          <CFormInput
            {...register('address_city')}
            placeholder="Cidade"
            className={errors.address_city ? 'is-invalid' : ''}
          />
          {errors.address_city && <div className="text-danger">{errors.address_city.message}</div>}
        </CCol>

        <CCol md={3}>
          <CFormLabel>Estado:</CFormLabel>
          <CFormInput
            {...register('address_state')}
            placeholder="Estado"
            className={errors.address_state ? 'is-invalid' : ''}
          />
          {errors.address_state && (
            <div className="text-danger">{errors.address_state.message}</div>
          )}
        </CCol>

        <CCol md={6}>
          <CFormLabel>Tipo de Trabalho:</CFormLabel>
          <CFormSelect {...register('workType')} className={errors.workType ? 'is-invalid' : ''}>
            <option value="">Selecione...</option>
            <option value="PRODUCAO">Produção</option>
            <option value="EVENTO">Evento</option>
          </CFormSelect>
          {errors.workType && <div className="text-danger">{errors.workType.message}</div>}
        </CCol>
        <CCol lg={6}>
          <CInputGroup className="mb-3">
            <CDatePicker
              required
              timepicker
              text="* Selecione a data e o horário entrada"
              placeholder="Selecione o horário de entrada"
              className="w-100"
              locale="pt-BR"
              onDateChange={(date: Date | null) => setArriveMashguiachTime(date || null)}
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CInputGroup className="mb-3 w-100">
            <CDatePicker
              required
              timepicker
              text="* Selecione o horário previsto de saída"
              placeholder="Selecione o horário de saída"
              className="w-100"
              locale="pt-BR"
              onDateChange={(date: Date | null) => setEndMashguiachTime(date || null)}
            />{' '}
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Observação:</CFormLabel>
          <CFormTextarea
            placeholder="Escreva aqui alguma observação que deseja fazer aos rabinos e ao mashguiach"
            value={observationText}
            onChange={(e) => setObservationText(e.target.value)}
          />
        </CCol>

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
        <CPopover
          content="
            1. O valor mínimo a ser pago por um Mashguiach é de R$250,00.
            2. Após as 5 primeiras horas, o valor é de R$50,00 por hora.
            3. De 00:00 até as 06:00 o valor é de R$75,00 a hora
            "
          placement="top"
        ></CPopover>

        <CButton type="submit" color="primary" className="mt-3">
          Lançar Freela
        </CButton>
      </CRow>
      <CRow className="mt-4">
        <CTable hover responsive="sm">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Rua</CTableHeaderCell>
              <CTableHeaderCell>Bairro</CTableHeaderCell>
              <CTableHeaderCell>Cidade</CTableHeaderCell>
              <CTableHeaderCell>CEP</CTableHeaderCell>
              <CTableHeaderCell>Ações</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {eventAddresses?.map((address, index) => (
              <CTableRow key={index}>
                <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                <CTableDataCell>{address.workType}</CTableDataCell>
                <CTableDataCell>{address.address_street}</CTableDataCell>
                <CTableDataCell>{address.address_neighbor}</CTableDataCell>
                <CTableDataCell>{address.address_city}</CTableDataCell>
                <CTableDataCell>{address.address_zipcode}</CTableDataCell>
                {/* <CTableDataCell>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                    Remover
                  </CButton>
                </CTableDataCell> */}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CRow>
      <CRow>
        <CButton color="info">(3/3) - SOLICITAR MASHGUICHIM</CButton>
      </CRow>
    </CForm>
  )
}

export default AddModalAddress;
