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
import { useUserSession } from '@/contexts/sessionContext'
import CIcon from '@coreui/icons-react'
import { cilPen, cilTrash } from '@coreui/icons'

type StoresWithEvents = Stores & {
  store: {
    title: string
  }
}

const AdminEvents = () => {
  const {session} = useUserSession()
  const [storesList, setStoresList] = useState<Stores[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [events, setEvents] = useState<StoreEvents[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      if (session) {
        const data = await getAllStores()
        setStoresList(data as any)
      }
    }

    fetchStores()
  }, [session])

  const options = storesList.map((store) => ({
    label: store.title,
    value: store.id,
  }))

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventById(eventId)

      setStoresList((prev) => prev.filter((store) => store.id !== eventId))
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  const filterEventsByStore = async (selected: any) => {
    if (!selected || selected.length === 0) return
    setSelectedStoreId(selected.length > 0 ? String(selected[0]?.value) : null)
    const storeId = String(selected[0]?.value)
    fetchEventsByStore(storeId)
  }

  const fetchEventsByStore = async (id: string) => {
    const res = await getEventsByStoreId(id)
    setEvents(res)
    if (res) console.log(res)
  }

  return (
    <>
      <CCard className="flex mb-3">
        <CCardHeader>
          <CCardTitle>
            <b>Eventos por Estabelecimento</b>
          </CCardTitle>
          <span className="text-gray-400">
            Filtre os todos eventos registrados em um estabelecimento.
          </span>
        </CCardHeader>
      </CCard>

      <CMultiSelect
        multiple={false}
        options={options}
        placeholder="Digite o nome do estabelecimento"
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
                    <div className="d-flex items-center space-x-4">
                      <Link
                        href={`/app/admin/events/${store.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        <CButton size="sm" color="secondary">
                          <CIcon icon={cilPen} size="sm" /> Editar
                        </CButton>
                      </Link>
                      <span className="mx-2 h-2 w-px bg-gray-300"></span>
                      {/* <CButton
                          size="sm"
                          color="danger"
                          disabled={session?.roleId !== 3}
                          onClick={() => handleDeleteEvent(store.id)}
                          className="text-white"
                        >
                          <CIcon icon={cilTrash} size="sm" /> Excluir
                        </CButton> */}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default AdminEvents
