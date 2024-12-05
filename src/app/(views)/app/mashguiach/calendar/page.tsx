"use client"
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Configura o localizador com o moment.js
const localizer = momentLocalizer(moment)

// Exemplo de uma lista de eventos
const myEventsList = [
  {
    title: 'Reunião com cliente',
    start: new Date(2023, 10, 13, 10, 0), // 13 de outubro de 2023, 10:00
    end: new Date(2023, 10, 13, 11, 30), // 13 de outubro de 2023, 11:30
  },
  {
    title: 'Almoço',
    start: new Date(2023, 10, 14, 12, 0), // 14 de outubro de 2023, 12:00
    end: new Date(2023, 10, 14, 13, 0),  // 14 de outubro de 2023, 13:00
  }
];

const MyCalendar = (props: any) => (
  <div className="myCustomHeight">
    <Calendar
      localizer={localizer}
      events={myEventsList}  // Lista de eventos
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }} // Define a altura do calendário
    />
  </div>
)

export default MyCalendar;
