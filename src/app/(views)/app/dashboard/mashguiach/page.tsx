'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
import { EventsServices, StoreEvents } from '@prisma/client'
import { confirmExit } from '@/app/_actions/events/confirmExitTime'
import { confirmEntrance } from '@/app/_actions/events/confirmHours'
import EventInfoModal from '@/components/dashboard/EventsInfoModal'
import { updateUserPix, userHasPix } from '@/app/_actions/users/hasPix'
import NextEventsDashboard from './NextEvents'
import { getNextEventsMashguiach } from '@/app/_actions/events/getNextEventsByMashguiach'
import { db } from '@/app/_lib/prisma'
import { timeIn } from '@/app/_actions/time-entries/timeIn'
import { timeOut } from '@/app/_actions/time-entries/timeOut'
import { checkTodayEntrace } from '@/app/_actions/time-entries/checkTodayEntrace'
import { checkTodayExit } from '@/app/_actions/time-entries/checkTodayExit'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventsServicesWithStoreEvents extends EventsServices {
  StoreEvents: StoreEvents
}

type ServicesWithEvents = EventsServices & {
  StoreEvents: StoreEvents
}

export default function MashguiachDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Definindo o ID do usuário com base na sessão
  const userId = session?.user?.id

  // Estados do componente
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
  const [hasEnteredToday, setHasEnteredToday] = useState(false)
  const [hasExitedToday, setHasExitedToday] = useState(false)
  const [loading, setLoading] = useState(false)

  // Toast de confirmação de registro
  const exampleToast = (
    <CToast autohide={false} visible={true} color="primary" className="text-white align-items-center">
      <div className="d-flex">
        <CToastBody>✅ Entrada/Saída registrado com sucesso!</CToastBody>
        <CToastClose className="me-2 m-auto" white />
      </div>
    </CToast>
  )

  // Função para buscar status de entrada do dia
  const fetchEntranceStatus = async () => {
    if (userId) {
      const entry = await checkTodayEntrace(userId)
      setHasEnteredToday(!!entry)
    }
  }

  // Função para buscar status de saída do dia
  const fetchExitStatus = async () => {
    if (userId) {
      const exit = await checkTodayExit(userId)
      setHasExitedToday(!!exit)
    }
  }

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

  // Efeito para buscar dados assim que a sessão estiver disponível
  useEffect(() => {
    if (session?.user?.id) {
      fetchEntranceStatus()
      fetchExitStatus()
      fetchHasPix()
      fetchEvents()
      fetchFuturesEvents()
    }
  }, [session?.user?.id])

  // Função para obter a localização do usuário
  const getUserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      } else {
        reject(new Error('Geolocalização não é suportada pelo seu navegador.'))
      }
    })
  }

  // Função para registrar a entrada
  const handleTimeEntry = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Obter a localização atual
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setLatidude(latitude)
      setLongitude(longitude)

      // Buscar o store_id do usuário
      const fixedJob = await db.fixedJobs.findFirst({
        where: {
          user_id: userId,
          deletedAt: null
        },
        select: { store_id: true }
      })

      if (!fixedJob) {
        throw new Error('Você não está registrado em nenhuma loja!')
      }

      // Registra a entrada e atualiza o estado
      await timeIn(userId, fixedJob.store_id, latitude, longitude)
      addToast(exampleToast as any)
      setHasEnteredToday(true)
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error)
      alert(error.message || 'Erro ao registrar entrada')
    } finally {
      setLoading(false)
    }
  }

  // Função para registrar a saída
  const handleTimeExit = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Obter a localização atual
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setLatidude(latitude)
      setLongitude(longitude)

      // Buscar o store_id do usuário
      const fixedJob = await db.fixedJobs.findFirst({
        where: {
          user_id: userId,
          deletedAt: null
        },
        select: { store_id: true }
      })

      if (!fixedJob) {
        throw new Error('Você não está registrado em nenhuma loja!')
      }

      // Registra a saída e atualiza o estado
      await timeOut(userId, fixedJob.store_id, latitude, longitude)
      addToast(exampleToast as any)
      setHasExitedToday(true)
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error)
      alert(error.message || 'Erro ao registrar saída')
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com o envio da chave Pix
  const onPixSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateUserPix(userId as string, pixKey)
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Usuário não autenticado</p>
  }

  const hasAnsweredQuestions = session?.user?.asweredQuestions || false

  return (
    <>
      <div className="d-flex flex-column mb-10" style={{ marginBottom: '10px' }}>
        {!hasEnteredToday && (
          <CButton color="primary" size="lg" className="mb-2" onClick={handleTimeEntry} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Entrada'}
          </CButton>
        )}

        {!hasExitedToday && (
          <CButton color="warning" size="lg" onClick={handleTimeExit} disabled={loading || !hasEnteredToday}>
            {loading ? 'Registrando...' : 'Registrar Saída'}
          </CButton>
        )}
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
