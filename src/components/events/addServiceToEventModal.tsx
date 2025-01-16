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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react-pro'
import { createEventServices } from '@/app/_actions/events/createEventServices'
import { useSession } from 'next-auth/react'
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser'
import { useRouter } from 'next/navigation'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import CIcon from '@coreui/icons-react'
import { cilMap, cilSearch } from '@coreui/icons'

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
  } | null>(null)
  const [productionOrEvent, setProductionOrEvent] = useState<string>('')

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
        StoreEventsId,
        arriveMashguiachTime,
        endMashguiachTime,
        isApproved: false,
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
    <CModal visible={visible} onClose={onClose} size="xl">
      <CForm className="row g-3">
        <CModalHeader>
          <CModalTitle>Solicitar Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol lg={6}>
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

            <CCol md={6}>
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
          </CRow>

          <CRow>
            <CCol md={4}>
              <CFormLabel>Evento ou produção?:</CFormLabel>
              <CFormSelect
                value={productionOrEvent}
                onChange={(e) => setProductionOrEvent(e.target.value)}
              >
                <option>PRODUÇÃO OU EVENTO</option>
                <option value="PRODUCAO">PRODUÇÃO</option>
                <option value="EVENTO">EVENTO</option>
              </CFormSelect>
            </CCol>
            <CCol md={8}>
              <CFormLabel>Observação:</CFormLabel>
              <CFormTextarea
                placeholder="Escreva aqui alguma observação"
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
              />
            </CCol>
          </CRow>

          <CRow className="gy-3 mt-1">
            <CCol md={3}>
              <CFormLabel>CEP :</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilMap} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Digite o CEP"
                  value={addressZipcode}
                  onChange={(e) => setAddressZipcode(e.target.value)}
                />
                <CButton type="button" color="primary" onClick={handleCepSearch}>
                  <CIcon icon={cilSearch} style={{ marginRight: 6 }} />
                  Buscar
                </CButton>
              </CInputGroup>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Rua:</CFormLabel>
              <CFormInput
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
              />
            </CCol>

            <CCol md={1}>
              <CFormLabel>Número:</CFormLabel>
              <CFormInput
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
              />
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
