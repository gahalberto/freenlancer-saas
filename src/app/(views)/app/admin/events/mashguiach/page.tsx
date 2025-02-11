'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CMultiSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { EventsServices, StoreEvents, Stores, User } from '@prisma/client'
import { deleteEventById } from '@/app/_actions/events/deleteUserEvent'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllServicesByUser } from '@/app/_actions/services/getAllServicesByUser'

type ServicesWithEvents = EventsServices & {
    StoreEvents: StoreEvents
}

const EventByMashguiachPage = () => {
  const { data: session, status } = useSession()
  const [mashguichimList, setMashguiachimList] = useState<User[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [events, setEvents] = useState<ServicesWithEvents[]>([])

  useEffect(() => {
      const fetchMashguichim = async () => {
      if (status === 'authenticated') {
        const data = await getAllMashguichim()
        setMashguiachimList(data as any)
      }
    }

    fetchMashguichim()

    
  }, [session, status])

  const options = mashguichimList.map(user => ({
    label: user.name,
    value: user.id
  }))



  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventById(eventId)

      setMashguiachimList((prev) => prev.filter((store) => store.id !== eventId))
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }
  
  const filterEventsByStore = async (selected: any) => {
    if (!selected || selected.length === 0) return;
    setSelectedStoreId(selected.length > 0 ? String(selected[0]?.value) : null);
    const storeId = String(selected[0]?.value);
    fetchEventsByStore(storeId)
  };

  const fetchEventsByStore = async (id: string) => {
    const res = await getAllServicesByUser(id);
    setEvents(res)
    if(res) console.log(res)
  }
  

  return (
<>
<CMultiSelect
  multiple={false}
  options={options}
  placeholder="Filtre os eventos por Mashguiach"
  className="mb-4"
  onChange={filterEventsByStore} 
/>
<CCard>
      <CCardBody>
        <CTable>
          <CTableBody>
            {events.map((store, index) => (
              <CTableRow key={store.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>
                  <b> {store.StoreEvents.title} </b> - {store.arriveMashguiachTime.toLocaleDateString()} - {store.workType} {' '}
                </CTableDataCell>
                <CTableDataCell>
                  <div className="flex items-center">
                    <Link
                      href={`/app/admin/events/${store.StoreEvents.id}`}
                      className="text-blue-600 hover:underline"
                    >
                    <CButton size="sm" color="primary" variant='outline'>
                      Editar
                    </CButton>

                    </Link>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>

</>  )
}

export default EventByMashguiachPage
