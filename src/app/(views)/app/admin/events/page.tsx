'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { Stores } from '@prisma/client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { deleteEventById } from '@/app/_actions/events/deleteUserEvent'

type StoresWithEvents = Stores & {
  store: {
    title: string
  }
}

const AdminEvents = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<StoresWithEvents[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        const data = await getAllEvents()
        setStoresList(data as any)
      }
    }

    fetchStores()
  }, [session, status])

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

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>Todos os eventos </CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CTable>
          <CTableBody>
            {storesList.map((store, index) => (
              <CTableRow key={store.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>
                  <b> {store.store.title} </b> - {store.title}{' '}
                </CTableDataCell>
                <CTableDataCell>
                  <div className="flex items-center">
                    <Link
                      href={`/app/admin/events/${store.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver/Liberar
                    </Link>
                    <span className="mx-4 h-5 w-px bg-gray-300"></span>
                    <CButton size="sm" color="danger" onClick={() => handleDeleteEvent(store.id)}>
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
  )
}

export default AdminEvents
