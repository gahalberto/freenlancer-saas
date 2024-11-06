"use client"
import { useState, useEffect, useRef } from 'react'
import { DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ptBr from '@fullcalendar/core/locales/pt-br'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CDatePicker, CFormLabel, CModal, CModalBody, CModalHeader } from '@coreui/react-pro'
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

  useEffect(() => {
    async function fetchEventsFromDB() {
      try {
        const data = await getServicesByUser()

        const events: EventInput[] = data.map((event: any) => ({
          id: event.id,
          title: event.StoreEvents?.title || 'Sem Título',
          address: event.StoreEvents?.address || 'Sem endereço',
          start: event.arriveMashguiachTime ? new Date(event.arriveMashguiachTime).toISOString() : undefined,
          end: event.endMashguiachTime ? new Date(event.endMashguiachTime).toISOString() : undefined,
          allDay: false,
        }))

        setCurrentEvents(events)
      } catch (error) {
        console.error('Erro ao buscar eventos do banco de dados:', error)
      }
    }

    fetchEventsFromDB()
  }, [])

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event)
    setVisible(true)
  }

  const handleConfirmEntrance = async (id: string) => {
    if (!arriveMashguiachTime) {
      alert("Por favor, selecione o horário de entrada.")
      return
    }

    try {
      await confirmEntrance(id, arriveMashguiachTime)
      alert("Horário de entrada confirmado!")
      setVisible(false)
    } catch (error) {
      console.error('Erro ao confirmar horário de entrada:', error)
      alert('Erro ao confirmar o horário de entrada.')
    }
  }

  const handleExitTime = async (id: string) => {
    if (!endMashguiachTime) {
      alert("Por favor, selecione o horário de saída.")
      return
    }

    try {
      await confirmExit(id, endMashguiachTime)
      alert("Horário de saída confirmado!")
      setVisible(false)
    } catch (error) {
      console.error('Erro ao confirmar horário de saída:', error)
      alert('Erro ao confirmar o horário de saída.')
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
          {selectedEvent ? (
            <>
              <p><b>Título:</b> {selectedEvent.title}</p>
              <p><b>Endereço:</b> {selectedEvent.extendedProps?.address || 'Sem endereço'}</p>
              <p><b>Início:</b> {selectedEvent.start ? new Date(selectedEvent.start).toLocaleString('pt-BR') : 'Sem data'}</p>
              <p><b>Fim:</b> {selectedEvent.end ? new Date(selectedEvent.end).toLocaleString('pt-BR') : 'Sem data'}</p>

              <CCol md={12} className="text-center mt-3">
                <CFormLabel>Confirmar Horário de <b>Entrada</b>:</CFormLabel>
                <CDatePicker
                  timepicker
                  locale="pt-BR"
                  onDateChange={(date: Date | null) => setArriveMashguiachTime(date)}
                />
                <CButton color="info" size="sm" className="mt-2" onClick={() => handleConfirmEntrance(selectedEvent.id)}>
                  <CIcon icon={cilClock} /> Confirmar horário de entrada
                </CButton>
              </CCol>

              <CCol md={12} className="text-center mt-3">
                <CFormLabel>Confirmar Horário de <b>Saída</b>:</CFormLabel>
                <CDatePicker
                  timepicker
                  locale="pt-BR"
                  onDateChange={(date: Date | null) => setEndMashguiachTime(date)}
                />
                <CButton color="info" size="sm" className="mt-2" onClick={() => handleExitTime(selectedEvent.id)}>
                  <CIcon icon={cilClock} /> Confirmar horário de <b>Saída</b>
                </CButton>
              </CCol>

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