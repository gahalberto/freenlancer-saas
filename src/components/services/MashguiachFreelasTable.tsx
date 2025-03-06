'use client'
import { useState, useEffect, useRef } from 'react'
import { DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ptBr from '@fullcalendar/core/locales/pt-br'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CFormLabel,
  CModal,
  CModalBody,
  CModalHeader,
  CSpinner,
  CAlert
} from '@coreui/react-pro'
import { getServicesByUser } from '@/app/_actions/services/getServicesByUser'
import { useSession } from 'next-auth/react'
import { EventInput } from '@fullcalendar/core'
import CIcon from '@coreui/icons-react'
import { cilClock } from '@coreui/icons'
import { confirmEntrance } from '@/app/_actions/events/confirmHours'
import { confirmExit } from '@/app/_actions/events/confirmExitTime'

const handleDateSelect = (selectInfo: DateSelectArg) => {
  let title = prompt('Por favor, insira um título para seu evento:')
  let calendarApi = selectInfo.view.calendar

  calendarApi.unselect()

  if (title) {
    calendarApi.addEvent({
      id: createEventId(),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    })
  }
}

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState<EventInput[]>([])
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [visible, setVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null)
  const { data: session } = useSession()
  const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(null)
  const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkInStatus, setCheckInStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    checkInTime: null as Date | null,
    checkOutTime: null as Date | null
  })
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEventsFromDB() {
      try {
        const data = await getServicesByUser()

        const events: EventInput[] = data.map((event: any) => ({
          id: event.id,
          title: event.StoreEvents?.title || 'Sem Título',
          address: event.StoreEvents?.address || 'Sem endereço',
          start: event.arriveMashguiachTime
            ? new Date(event.arriveMashguiachTime).toISOString()
            : undefined,
          end: event.endMashguiachTime
            ? new Date(event.endMashguiachTime).toISOString()
            : undefined,
          allDay: false,
        }))

        setCurrentEvents(events)
      } catch (error) {
        console.error('Erro ao buscar eventos do banco de dados:', error)
      }
    }

    fetchEventsFromDB()
  }, [])

  const handleEventClick = async (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event as any)
    setVisible(true)
    
    // Resetar status
    setStatusError(null)
    setCheckInStatus({
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null
    })
    
    // Verificar status de check-in/check-out
    await checkServiceStatus(clickInfo.event.id)
  }

  const checkServiceStatus = async (serviceId: string) => {
    if (!session?.user?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/freela-status?user_id=${session.user.id}&service_id=${serviceId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status do serviço')
      }
      
      const data = await response.json()
      setCheckInStatus({
        hasCheckedIn: data.hasCheckedIn,
        hasCheckedOut: data.hasCheckedOut,
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : null,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : null
      })
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatusError('Não foi possível verificar o status do serviço. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmEntrance = async (id: string) => {
    if (!arriveMashguiachTime) {
      alert('Por favor, selecione o horário de entrada.')
      return
    }

    setIsLoading(true)
    try {
      await confirmEntrance(id, arriveMashguiachTime)
      alert('Horário de entrada confirmado!')
      await checkServiceStatus(id) // Atualizar status após confirmação
    } catch (error) {
      console.error('Erro ao confirmar horário de entrada:', error)
      alert('Erro ao confirmar o horário de entrada.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExitTime = async (id: string) => {
    if (!endMashguiachTime) {
      alert('Por favor, selecione o horário de saída.')
      return
    }

    setIsLoading(true)
    try {
      await confirmExit(id, endMashguiachTime)
      alert('Horário de saída confirmado!')
      await checkServiceStatus(id) // Atualizar status após confirmação
    } catch (error) {
      console.error('Erro ao confirmar horário de saída:', error)
      alert('Erro ao confirmar o horário de saída.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Seus trabalhos freelancers confirmados:</CCardHeader>
        <CCardBody>
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next hoje',
              center: 'title',
              right: 'dayGridMonth,listMonth',
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              list: 'Lista',
            }}
            initialView="dayGridMonth"
            locale={ptBr}
            dayMaxEvents={true}
            weekends={weekendsVisible}
            events={currentEvents}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </CCardBody>
      </CCard>

      {/* Modal para exibir detalhes do evento clicado */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader closeButton>Detalhes do Evento</CModalHeader>
        <CModalBody>
          {isLoading ? (
            <div className="text-center p-3">
              <CSpinner color="primary" />
              <p className="mt-2">Carregando...</p>
            </div>
          ) : statusError ? (
            <CAlert color="danger">{statusError}</CAlert>
          ) : selectedEvent ? (
            <>
              <p>
                <b>Título:</b> {selectedEvent.title}
              </p>
              <p>
                <b>Endereço:</b> {selectedEvent.extendedProps?.address || 'Sem endereço'}
              </p>
              <p>
                <b>Início:</b>{' '}
                {selectedEvent.start
                  ? new Date(selectedEvent.start).toLocaleString('pt-BR')
                  : 'Sem data'}
              </p>
              <p>
                <b>Fim:</b>{' '}
                {selectedEvent.end
                  ? new Date(selectedEvent.end).toLocaleString('pt-BR')
                  : 'Sem data'}
              </p>

              {/* Status de Check-in/Check-out */}
              {checkInStatus.hasCheckedIn && (
                <CAlert color="success" className="mt-3">
                  <p className="mb-0"><b>Check-in realizado:</b> {checkInStatus.checkInTime?.toLocaleString('pt-BR')}</p>
                </CAlert>
              )}
              
              {checkInStatus.hasCheckedOut && (
                <CAlert color="success" className="mt-3">
                  <p className="mb-0"><b>Check-out realizado:</b> {checkInStatus.checkOutTime?.toLocaleString('pt-BR')}</p>
                </CAlert>
              )}

              {/* Seção de Check-in */}
              {!checkInStatus.hasCheckedIn && (
                <CCol md={12} className="text-center mt-3">
                  <CFormLabel>
                    Confirmar Horário de <b>Entrada</b>:
                  </CFormLabel>
                  <CDatePicker
                    timepicker
                    locale="pt-BR"
                    onDateChange={(date: Date | null) => setArriveMashguiachTime(date)}
                  />
                  <CButton
                    color="info"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleConfirmEntrance(selectedEvent.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? <CSpinner size="sm" /> : <CIcon icon={cilClock} />} Confirmar horário de entrada
                  </CButton>
                </CCol>
              )}

              {/* Seção de Check-out - só mostrar se já fez check-in e ainda não fez check-out */}
              {checkInStatus.hasCheckedIn && !checkInStatus.hasCheckedOut && (
                <CCol md={12} className="text-center mt-3">
                  <CFormLabel>
                    Confirmar Horário de <b>Saída</b>:
                  </CFormLabel>
                  <CDatePicker
                    timepicker
                    locale="pt-BR"
                    onDateChange={(date: Date | null) => setEndMashguiachTime(date)}
                  />
                  <CButton
                    color="info"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleExitTime(selectedEvent.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? <CSpinner size="sm" /> : <CIcon icon={cilClock} />} Confirmar horário de <b>Saída</b>
                  </CButton>
                </CCol>
              )}
            </>
          ) : (
            <p>Nenhum evento selecionado.</p>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default Calendar

let eventGuid = 0

export function createEventId() {
  return String(eventGuid++)
}
