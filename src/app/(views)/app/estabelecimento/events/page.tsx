'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
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
import ButtonCompo from '@/components/CButtonCom'
import { getStores } from '@/app/_actions/stores/getStores'
import { Stores } from '@prisma/client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { getEventByEstabelecimento } from '@/app/_actions/events/getEventByEstabelecimento'

const AdminEvents = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<Stores[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        const data = await getEventByEstabelecimento(session.user.id)
        setStoresList(data as any)
      }
    }

    fetchStores()
  }, [session, status])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>Lista de Eventos para {session?.user.name}</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CTable>
          <CTableBody>
            {storesList.map((store, index) => (
              <CTableRow key={store.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{store.title}</CTableDataCell>
                <CTableDataCell>
                  <Link href={`/app/estabelecimento/events/${store.id}`}>Editar</Link>
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
