import { useEffect, useState } from 'react'
import {
  CBadge,
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CMultiSelect,
  CPopover,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react-pro'
import { createEventServices } from '@/app/_actions/events/createEventServices'
import { useSession } from 'next-auth/react'
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { User } from '@prisma/client'

type PropsType = {
  visible: boolean
  onClose: () => void
  StoreEventsId: string
  fetchAll: () => void
}

const AddServiceToEventModal = ({ fetchAll, visible, onClose, StoreEventsId }: PropsType) => {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [mashguiachOptions, setMashguiachOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedMashguiach, setSelectedMashguiach] = useState<{
    value: string
    label: string
  } | null>(null) // Estado para a seleção do Mashguiach
  const [productionOrEvent, setProductionOrEvent] = useState<string>('') // Estado para o enum

  const fetchCredits = async () => {
    const response = await getCreditsByUser()
    if (response) {
      setCredits(response.credits)
    }
  }

  const fetchMashguichim = async () => {
    const response = await getAllMashguichim()
    if (response) {
      const formattedOptions = response.map((mashguiach) => ({
        value: mashguiach.id,
        label: mashguiach.name,
      }))
      setMashguiachOptions(formattedOptions)
    }
  }
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

  useEffect(() => {
    if (arriveMashguiachTime && endMashguiachTime) {
      const { price, hours } = calculatePrice(arriveMashguiachTime, endMashguiachTime)
      setTotalPrice(price + transportPrice)
      setTotalHours(hours)
    }
  }, [arriveMashguiachTime, endMashguiachTime, transportPrice])

  const handleSubmit = async () => {
    if (!arriveMashguiachTime || !endMashguiachTime) {
      alert('Por favor, preencha todas as datas')
      return
    }

    try {
      const response = await createEventServices({
        StoreEventsId,
        arriveMashguiachTime,
        endMashguiachTime,
        isApproved: false,
        mashguiachPrice: totalPrice,
        mashguiachPricePerHour: 50,
        observationText,
        productionOrEvent,
      })

      if (response) {
        alert('Formulário enviado com sucesso!')
        fetchAll()
        onClose()
        fetchCredits()
      } else {
        alert('Ocorreu um erro ao enviar o formulário.')
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Ocorreu um erro ao enviar o formulário.')
    }
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CForm className="row g-3">
        <CModalHeader>
          <CModalTitle>Solicitar Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CCol lg={12}>
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

          <CCol md={12}>
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
          <CCol md={12}>
            <CInputGroup className="mb-3">
              <CFormSelect
                text="* Escolhe se é uma produção ou evento, para que o Mashguiach chegue no lugar certo. Você cadastrou o endereço previamente, senão feche esse formulário e cadastre o endereço."
                aria-label="PRODUÇÃO OU EVENTO"
                value={productionOrEvent}
                onChange={(e) => setProductionOrEvent(e.target.value)} // Atualiza o estado com o valor selecionado
              >
                <option>PRODUÇÃO OU EVENTO</option>
                <option value="PRODUCAO">PRODUÇÃO</option>
                <option value="EVENTO">EVENTO</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>
          {/* <CCol md={12}>
            <CInputGroupText>MASHGUIACH PRÉ-SELECIONADO?</CInputGroupText>

            <CInputGroup className="mb-3 w-100">
              <CMultiSelect
                options={mashguiachOptions}
                text="Se não deseja selecionar um Mashguiach específico deixe em branco e todos mashguichim vão ver a sua oferta."
                multiple={false}
                placeholder="Deseja selecionar um Mashguiach?"
                className="w-100"
                onChange={(selected) => console.log('Selecionado:', selected)}
              />
            </CInputGroup>
          </CCol> */}

          <CCol md={12}>
            <CFormLabel>Observação:</CFormLabel>
            <CFormTextarea
              placeholder="Escreva aqui alguma observação que deseja fazer aos rabinos e ao mashguiach"
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
            />
          </CCol>

          <CCol style={{ marginTop: '20px' }}>
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
          >
            <CButton size="sm" color="secondary">
              Clique para saber sobre cálculos
            </CButton>
          </CPopover>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSubmit}>
            Pagar & Solicitar Mashguiach
          </CButton>
          <CButton color="secondary" onClick={onClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AddServiceToEventModal
