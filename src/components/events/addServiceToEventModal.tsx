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
import { getAllMashguichim, getAvailableMashguichim } from '@/app/_actions/getAllMashguichim'
import CIcon from '@coreui/icons-react'
import { cilMap, cilSearch } from '@coreui/icons'
import { User } from '@prisma/client'
import { findStoreAddress } from '@/app/_actions/users/getUserAddress'
import { useUserSession } from '@/contexts/sessionContext'

type PropsType = {
  visible: boolean
  onClose: () => void
  StoreEventsId: string
  fetchAll: () => void
}

const AddServiceToEventModal = ({ fetchAll, visible, onClose, StoreEventsId }: PropsType) => {
  const {session} = useUserSession()
  const [credits, setCredits] = useState(0)
  const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([])
  const [productionOrEvent, setProductionOrEvent] = useState<string>('')
  const [mashguiachSelected, setMashguiachSelected] = useState<string>('')

  // Estados para endereço
  const [addressZipcode, setAddressZipcode] = useState('')
  const [addressStreet, setAddressStreet] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [addressNeighbor, setAddressNeighbor] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressState, setAddressState] = useState('')

  // Estados para valores de hora
  const [dayHourValue, setDayHourValue] = useState<number>(50)
  const [nightHourValue, setNightHourValue] = useState<number>(75)

  const fetchCredits = async () => {
    const response = await getCreditsByUser()
    if (response) {
      setCredits(response.credits)
    }
  }

  const fetchUserAddress = async () => {
    try {
      const response = await findStoreAddress(StoreEventsId); // Função que busca o endereço do usuário
      if (response) {
        setAddressZipcode(response.address_zipcode || "");
        setAddressStreet(response.address_street || "");
        setAddressNumber(response.address_number || "");
        setAddressNeighbor(response.address_neighbor || "");
        setAddressCity(response.address_city || "");
        setAddressState(response.address_state || "");
      } else {
        alert("Endereço do usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço do usuário:", error);
      alert("Erro ao buscar o endereço do usuário.");
    }
  };

  const fetchStoreAddress = async () => {
    try {
      const response = await findStoreAddress(StoreEventsId); // Função que busca o endereço do estabelecimento
      if (response) {
        setAddressZipcode(response.address_zipcode || "");
        setAddressStreet(response.address_street || "");
        setAddressNumber(response.address_number || "");
        setAddressNeighbor(response.address_neighbor || "");
        setAddressCity(response.address_city || "");
        setAddressState(response.address_state || "");
      } else {
        alert("Endereço do estabelecimento não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço do estabelecimento:", error);
      alert("Erro ao buscar o endereço do estabelecimento.");
    }
  };

    // Monitora a mudança para "PRODUÇÃO"
    useEffect(() => {
      if (productionOrEvent === "PRODUCAO") {
        fetchUserAddress(); // Preenche os campos com o endereço do usuário
      } else {
        // Limpa os campos de endereço se não for "PRODUÇÃO"
        setAddressZipcode("");
        setAddressStreet("");
        setAddressNumber("");
        setAddressNeighbor("");
        setAddressCity("");
        setAddressState("");
      }
    }, [productionOrEvent]);
  
  // Função atualizada para buscar mashguichim disponíveis
  const fetchMashguichim = async () => {
    // Se não temos horários selecionados, buscamos todos os mashguichim
    if (!arriveMashguiachTime || !endMashguiachTime) {
      console.log("Sem horários selecionados, buscando todos os mashguichim");
      const response = await getAllMashguichim();
      if (response) {
        console.log(`Encontrados ${response.length} mashguichim no total`);
        setMashguiachOptions(response);
      }
      return;
    }
    
    // Se temos horários selecionados, buscamos apenas os disponíveis
    try {
      console.log(`Buscando mashguichim disponíveis para o período:`, {
        inicio: arriveMashguiachTime.toLocaleString(),
        fim: endMashguiachTime.toLocaleString()
      });

      const availableMashguichim = await getAvailableMashguichim(
        arriveMashguiachTime,
        endMashguiachTime
      );
      
      console.log(`Encontrados ${availableMashguichim.length} mashguichim disponíveis`);
      setMashguiachOptions(availableMashguichim);
      
      // Se o mashguiach selecionado não está mais disponível, resetamos a seleção
      if (mashguiachSelected && mashguiachSelected !== '999') {
        const isStillAvailable = availableMashguichim.some(m => m.id === mashguiachSelected);
        console.log(`Mashguiach selecionado (${mashguiachSelected}) ainda está disponível? ${isStillAvailable}`);
        
        if (!isStillAvailable) {
          console.log(`Resetando seleção de mashguiach para ALEATÓRIO`);
          setMashguiachSelected('999');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar mashguichim disponíveis:', error);
      // Em caso de erro, carregamos todos os mashguichim
      const response = await getAllMashguichim();
      if (response) {
        setMashguiachOptions(response);
      }
    }
  };

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

  // Atualizar a lista de mashguichim disponíveis quando os horários mudarem
  useEffect(() => {
    if (arriveMashguiachTime && endMashguiachTime) {
      fetchMashguichim();
    }
  }, [arriveMashguiachTime, endMashguiachTime]);

  const calculatePrice = (startDate: Date, endDate: Date) => {
    const differenceInHours = Math.max(
      0,
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
    )
    const effectiveHours = Math.ceil(differenceInHours)
    let price = 0

    for (let i = 0; i < effectiveHours; i++) {
      const hour = new Date(startDate.getTime() + i * 60 * 60 * 1000).getHours()
      // Usar os valores definidos pelo usuário
      price += hour >= 22 || hour < 6 ? nightHourValue : dayHourValue
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
  }, [arriveMashguiachTime, endMashguiachTime, transportPrice, dayHourValue, nightHourValue])

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
        mashguiachId: mashguiachSelected !== '999' ? mashguiachSelected : null, // Envia undefined se for 999
        mashguiachPrice: totalPrice,
        mashguiachPricePerHour: dayHourValue,
        dayHourValue: dayHourValue,
        nightHourValue: nightHourValue,
        observationText,
        productionOrEvent,
        address_zipcode: addressZipcode,
        address_street: addressStreet,
        address_number: addressNumber,
        address_neighbor: addressNeighbor,
        address_city: addressCity,
        address_state: addressState,
        transport_price: transportPrice,
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
                <option value="SUBSTITUICAO">SUBSTITUIÇÃO</option>
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Mashguiach:</CFormLabel>
              <CFormSelect
                value={mashguiachSelected}
                onChange={(e) => setMashguiachSelected(e.target.value)}
              >
                <option value="999">ALEATÓRIO</option>
                {mashguiachOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={5}>
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
                <CButton type="button" color="secondary" onClick={fetchStoreAddress}>
                  Buscar Endereço do Estabelecimento
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

          <CRow className="mt-3">
            <CCol md={3}>
              <CFormLabel>Valor da hora diurna (6h-22h):</CFormLabel>
              <CInputGroup>
                <CInputGroupText>R$</CInputGroupText>
                <CFormInput
                  type="number"
                  value={dayHourValue}
                  onChange={(e) => setDayHourValue(Number(e.target.value))}
                />
              </CInputGroup>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Valor da hora noturna (22h-6h):</CFormLabel>
              <CInputGroup>
                <CInputGroupText>R$</CInputGroupText>
                <CFormInput
                  type="number"
                  value={nightHourValue}
                  onChange={(e) => setNightHourValue(Number(e.target.value))}
                />
              </CInputGroup>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Valor do transporte:</CFormLabel>
              <CInputGroup>
                <CInputGroupText>R$</CInputGroupText>
                <CFormInput
                  type="number"
                  value={transportPrice}
                  onChange={(e) => setTransportPrice(Number(e.target.value))}
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CCol style={{ marginTop: '20px' }}>
            <CTable>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell>
                    <strong>Valor da hora diurna (6h-22h):</strong>
                  </CTableDataCell>
                  <CTableDataCell>R$ {dayHourValue.toFixed(2)}</CTableDataCell>
                </CTableRow>

                <CTableRow>
                  <CTableDataCell>
                    <strong>Valor da hora noturna (22h-6h):</strong>
                  </CTableDataCell>
                  <CTableDataCell>R$ {nightHourValue.toFixed(2)}</CTableDataCell>
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
            Solicitar
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
