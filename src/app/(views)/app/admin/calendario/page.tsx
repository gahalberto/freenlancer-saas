"use client"
// pages/index.tsx

import { CCard, CCardHeader, CCardTitle } from '@coreui/react-pro'
import CalendarComponent from './calendarComponent'
import CIcon from '@coreui/icons-react'
import { cilCalendar } from '@coreui/icons'

export default function Home() {
  return (
    <div>
                <CCard className="mb-3">
            <CCardHeader>
              <CCardTitle className='flex'>
              <CIcon icon={cilCalendar} className="text-gray-400" /> <b>Calendário de Eventos</b>
              </CCardTitle>
              <span className="text-gray-400">
              Verde: Produção | Azul: Evento
              </span>

            </CCardHeader>
          </CCard>
      <CalendarComponent />
    </div>
  )
}
