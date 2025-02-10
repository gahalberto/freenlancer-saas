'use client'

import { useSession } from 'next-auth/react'
import {
  cilAvTimer,
  cilBadge,
  cilCalendar,
  cilClock,
  cilList,
  cilNotes,
  cilPlus,
  cilStar,
  cilWarning,
} from '@coreui/icons'
import DangerAlert from '@/components/alerts/DangerAlert'
import MashguiachButtonGroup from '@/components/dashboard/MashguiachButtonGroupt'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CDatePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalHeader,
  CRow,
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { getServicesByDate } from '@/app/_actions/services/getServicesdByDate'
import { useEffect, useRef, useState } from 'react'
import { EventsServices, StoreEvents } from '@prisma/client'
import { confirmExit } from '@/app/_actions/events/confirmExitTime'
import { confirmEntrance } from '@/app/_actions/events/confirmHours'
import EventInfoModal from '@/components/dashboard/EventsInfoModal'
import { updateUserPix, userHasPix } from '@/app/_actions/users/hasPix'
import NextEventsDashboard from './NextEvents'
import { getNextEventsMashguiach } from '@/app/_actions/events/getNextEventsByMashguiach'
import { db } from '@/app/_lib/prisma'
import { MashguiachEntrace } from '@/app/_actions/time-entries/timeIn'
import { MashguiachExit } from '@/app/_actions/time-entries/timeOut'

// Extendendo o tipo EventsServices para incluir StoreEvents
interface EventsServicesWithStoreEvents extends EventsServices {
  StoreEvents: StoreEvents
}

type ServicesWithEvents = EventsServices & {
  StoreEvents: StoreEvents
}

export default function MashguiachDashboard() {
  // Obtém a sessão do usuário
  const { data: session, status } = useSession()

  // Estados da aplicação
  const [serviceData, setServiceData] = useState<EventsServicesWithStoreEvents[] | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventsServicesWithStoreEvents | null>(null)
  const [error, setError] = useState('')
  const [visibleInfoModal, setVisibleInfoModal] = useState(false)
  const [toast, addToast] = useState(0)
  const toaster = useRef(null)
  const [hasPix, setHasPixKey] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [visiblePix, setVisiblePix] = useState(false)
  const [futuresEvents, setFuturesEvents] = useState<ServicesWithEvents[]>([])
  const [latitude, setLatidude] = useState(0)
  const [longitude, setLongitude] = useState(0)

  // Toast de exemplo para confirmação
  const exampleToast = (
    <CToast
      autohide={false}
      visible={true}
      color="primary"
      className="text-white align-items-center"
    >
      <div className="d-flex">
        <CToastBody>✅ Entrada/Saída registrado com sucesso!</CToastBody>
        <CToastClose className="me-2 m-auto" white />
      </div>
    </CToast>
  )

  const userId = session?.user?.id

  // Função para buscar se o usuário possui chave Pix cadastrada
  const fetchHasPix = async () => {
    if (!userId) {
      console.error('User ID is undefined')
      return
    }
    const response = await userHasPix(userId)
    if (response) {
      setHasPixKey(response.pixKey || '')
      setVisiblePix(true)
    }
  }

  // Função para buscar os eventos do dia atual
  const fetchEvents = async () => {
    const today = new Date()
    const response = await getServicesByDate(today)
    if (response.length > 0) {
      setServiceData(response)
    }
  }

  // Função para buscar os próximos eventos
  const fetchFuturesEvents = async () => {
    if (userId) {
      const res = await getNextEventsMashguiach(userId)
      setFuturesEvents(res)
    }
  }

  // Busca os dados assim que a sessão estiver disponível
  useEffect(() => {
    if (session?.user?.id) {
      fetchHasPix()
      fetchEvents()
      fetchFuturesEvents()
    }
  }, [session?.user?.id])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Usuário não autenticado</p>
  }

  const userName = session?.user?.name || 'Usuário'
  const hasAnsweredQuestions = session?.user?.asweredQuestions || false

  const handleInfoModal = (event: EventsServicesWithStoreEvents) => {
    setVisibleInfoModal(true)
    setSelectedEvent(event)
  }

  const onPixSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateUserPix(session?.user?.id as string, pixKey)
  }

  const getUserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      } else {
        reject(new Error('Geolocalização não é suportada pelo seu navegador.'))
      }
    })
  }

  // Função para registrar a entrada após obter a localização
  const handleConfirmEntrace = async () => {
    if (!userId) {
      alert('Não foi possível salvar seu usuário! Por favor entre em contato com a administração')
      return
    }

    const now = new Date()
    if (
      !confirm(
        `Você está registrando entrada ao serviço no dia ${now.toLocaleDateString()} às ${now.toTimeString()}`,
      )
    ) {
      return
    }

    try {
      // Tenta obter a localização do usuário
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setLatidude(latitude)
      setLongitude(longitude)

      // Registra a entrada com a localização obtida
      await MashguiachEntrace(userId, latitude, longitude)
      addToast(exampleToast as any)
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error.message)
      alert(error.message)
    }
  }

  const handleRegisterExit = async () => {
    if (!userId) {
      alert('Não foi possível salvar seu usuário! Por favor entre em contato com a administração')
      return
    }

    const now = new Date()
    if (
      !confirm(
        `Você está registrando saída ao serviço no dia ${now.toLocaleDateString()} às ${now.toTimeString()}`,
      )
    ) {
      return
    }

    try {
      // Tenta obter a localização do usuário
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setLatidude(latitude)
      setLongitude(longitude)

      // Registra a entrada com a localização obtida
      await MashguiachExit(userId, latitude, longitude)
      addToast(exampleToast as any)
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error.message)
      alert(error.message)
    }
  }


  return (
    <>
      <div className="d-flex flex-column mb-10" style={{ marginBottom: '10px' }}>
        <CButton color="primary" size="lg" className="mb-2" onClick={handleConfirmEntrace}>
          Registrar Entrada
        </CButton>
        <CButton color="warning" size="lg" onClick={handleRegisterExit}>
          Registrar Saída
        </CButton>
      </div>
      {!hasAnsweredQuestions && <DangerAlert />}
      {hasPix.length === 0 && visiblePix && (
        <CCard style={{ marginBottom: '20px' }}>
          <CCardHeader>
            <CCardTitle>
              <CIcon icon={cilWarning} style={{ marginRight: 10 }} />
              <b>Adicione sua chave Pix</b>
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={onPixSubmit}>
              <p>Vimos que você não cadastrou a sua chave PIX, envie-nos abaixo.</p>
              <CFormLabel>Chave Pix:</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Digite sua chave Pix"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
              <CButton type="submit" color="primary" className="mt-2">
                Salvar
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      )}
      <CRow style={{ justifyItems: 'center', alignItems: 'center' }}>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup
            url="/app/services"
            title="Freelancers Disponíveis"
            textColor="white"
            icon={cilBadge}
            color="primary"
          />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup
            url="/app/mashguiach/freelancers"
            title="Calendário de Eventos"
            textColor="white"
            icon={cilCalendar}
            color="primary"
          />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup
            url="/app/relatorios"
            title="Relatórios"
            textColor="white"
            icon={cilList}
            color="primary"
          />
        </CCol>
      </CRow>
      <CRow className="mt-4">
        <CRow className="mt-4 mb-4 align-items-center">
          <CCol xs="auto" className="d-flex align-items-center">
            <h3 className="me-3">Seus próximos eventos confirmados:</h3>
          </CCol>
        </CRow>
        {userId && <NextEventsDashboard userId={userId} services={futuresEvents} />}
      </CRow>
      <CToaster className="p-3" placement="top-end" push={toast as any} ref={toaster as any} />
    </>
  )
}
