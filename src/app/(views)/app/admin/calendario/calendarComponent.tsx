'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState } from 'react'
import { getAllServices } from '@/app/_actions/services/getAllServices'
import { EventsServices } from '@prisma/client'
import { useRouter } from 'next/navigation'

const CalendarComponent = () => {
  const [events, setEvents] = useState<{ title: string; workType: string, start: Date; end: Date; url?: string }[]>(
    [],
  )
  const router = useRouter()

  useEffect(() => {
    async function fetchEvents() {
      const data = await getAllServices() // Supondo que o serviço retorna os eventos
      const formattedEvents = data.map((event) => ({
        title: event.StoreEvents.title, // Nome do evento
        workType: event.workType || 'none', // Nome do evento
        start: event.arriveMashguiachTime,
        end: event.endMashguiachTime,
        url: `/app/admin/events/${event.StoreEvents.id}`, // Link para os detalhes do evento
        backgroundColor: event.workType === 'PRODUCAO' ? 'green' : 'blue', // Define a cor do evento
        borderColor: event.workType === 'PRODUCAO' ? 'darkgreen' : 'darkblue', // Define a borda do evento
        textColor: 'white' // Ajusta a cor do texto para melhor visibilidade  
      }))
      setEvents(formattedEvents)
    }

    fetchEvents()
  }, [])

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
      locale={'pt-br'}
      eventClick={(info) => {
        info.jsEvent.preventDefault() // Previne comportamento padrão do navegador
        if (info.event.url) {
          router.push(info.event.url) // Redireciona para o link do evento
        }
      }}
    />
  )
}

export default CalendarComponent
