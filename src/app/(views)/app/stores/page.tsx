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

const StoresList = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<Stores[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        const data = await getStores(session.user.id)
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
    <>
    <CCard className="mb-3">
          <CCardHeader>
            <CCardTitle className='flex'>
              <b>Meus estabelecimentos</b>
            </CCardTitle>
            <span className="text-gray-400">
              Todos estabelecimentos cadastrados para essa conta
            </span>
            <div className='flex-row'>
              <ButtonCompo link={'/app/stores/create'} title="Adicionar novo estabelecimento" />
              </div>

          </CCardHeader>
        </CCard>


    <CCard>
      <CCardBody>
        <CTable>
          <CTableBody>
            {storesList.map((store, index) => (
              <CTableRow key={store.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{store.title}</CTableDataCell>
                <CTableDataCell>
                  <Link href={`/app/stores/edit/${store.id}`}>Ver detalhes/Editar</Link>
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

export default StoresList
