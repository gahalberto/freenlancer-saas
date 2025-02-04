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
import { StoreEvents, Stores } from '@prisma/client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { deleteEventById } from '@/app/_actions/events/deleteUserEvent'
import { getPeddingEvent } from '@/app/_actions/events/getPendingEvents'
import StoreListTable from '@/components/stores/StoreListTable'
import { getAllStores } from '@/app/_actions/stores/getAllStores'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'
import { getEventsByStoreId } from '@/app/_actions/events/getEventsByStoreId'

type StoresWithEvents = Stores & {
  store: {
    title: string
  }
}

const AdminEvents = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<Stores[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [events, setEvents] = useState<StoreEvents[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        const data = await getAllStores()
        setStoresList(data as any)
      }
    }

    fetchStores()

    
  }, [session, status])

  const options = storesList.map(store => ({
    label: store.title,
    value: store.id
  }))



  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventById(eventId)

      setStoresList((prev) => prev.filter((store) => store.id !== eventId))
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
    const res = await getEventsByStoreId(id);
    setEvents(res)
    if(res) console.log(res)
  }
  

  return (
<>
<CMultiSelect
  multiple={false}
  options={options}
  placeholder="Filtre os eventos por estabelecimento"
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
                  <b> {store.title} </b> - {store.title}{' '}
                </CTableDataCell>
                <CTableDataCell>
                  <div className="flex items-center">
                    <Link
                      href={`/app/admin/events/${store.id}`}
                      className="text-blue-600 hover:underline"
                    >
                    <CButton size="sm" color="primary" variant='outline'>
                      Editar
                    </CButton>

                    </Link>
                    <span className="mx-4 h-5 w-px bg-gray-300"></span>
                    <CButton size="sm" color="danger" variant='outline' onClick={() => handleDeleteEvent(store.id)}>
                      Excluir
                    </CButton>
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

export default AdminEvents
