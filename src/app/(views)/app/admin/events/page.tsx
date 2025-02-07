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
import { getPeddingEvent } from '@/app/_actions/events/getPendingEvents'
import { aproveEvent } from '@/app/_actions/events/aproveEvent'

type StoresWithEvents = Stores & {
  store: {
    title: string
  }
  isApproved: boolean
}

const AdminEvents = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<StoresWithEvents[]>([])

  const fetchStores = async () => {
    if (status === 'authenticated') {
      const data = await getPeddingEvent()
      setStoresList(data as any)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [session, status])

  const handleReleaseEvent = async (eventId: string, isApproved: boolean) => {
    const approved = await aproveEvent(eventId, isApproved)
    if (approved) fetchStores()
  }

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
                  <Link
                    href={`/app/admin/events/${store.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    <CButton size="sm" color="primary" >
                      Editar
                    </CButton>
                  </Link>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    color="warning"
                    onClick={() => handleReleaseEvent(store.id, store.isApproved)}
                  >
                    {store.isApproved ? 'Trancar' : 'Liberar'}
                  </CButton>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    color="danger"
                    onClick={() => handleDeleteEvent(store.id)}
                  >
                    Excluir
                  </CButton>
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
