'use client'

import { useEffect, useState } from 'react'
import {
  CBadge,
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
import { StoreEvents, Stores } from '@prisma/client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { deleteEventById } from '@/app/_actions/events/deleteUserEvent'
import CIcon from '@coreui/icons-react'
import { cilPen, cilTrash } from '@coreui/icons'
import { useUserSession } from '@/contexts/sessionContext'

type StoresWithEvents = StoreEvents & {
  store: {
    title: string
  }
}

const AdminEvents = () => {
  const {session} = useUserSession()
  const [storesList, setStoresList] = useState<StoresWithEvents[]>([])
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const fetchStores = async () => {
      if (session) {
        const data = await getAllEvents()
        setStoresList(data as any)
      }
    }
    fetchStores()
  }, [session])

  // Detectar se a tela é mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Considera mobile se for menor que 768px
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventById(eventId)
      setStoresList((prev) => prev.filter((store) => store.id !== eventId))
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  if (!session) return <p>Carregando...</p>
  
  if (isMobile) {
    // 🔹 Layout em Cards para Mobile
    return (
      <>
        <CCard className="mb-3">
          <CCardHeader>
            <CCardTitle>
              <b>Todos Eventos</b>
            </CCardTitle>
            <span className="text-gray-400">
              <CBadge textBgColor="primary" shape="rounded-pill">ADMIN</CBadge> Todos os eventos registrados no sistema
            </span>
          </CCardHeader>
        </CCard>

        {storesList.map((store) => (
          <CCard key={store.id} className="mb-3 p-3 shadow-sm">
            <CCardBody>
              <h5 className="font-bold">{store.store.title}</h5>
              <p className="text-gray-600">{store.title}</p>
              <p className="text-gray-600">{store.date.toLocaleDateString()}</p>
              <div className=" flex justify-between mt-3 ">

                <Link href={`/app/admin/events/${store.id}`} className="text-blue-600 hover:underline">
                  <CButton size="sm" color="secondary">
                    <CIcon icon={cilPen} size="sm" /> Editar
                  </CButton>
                </Link>
            <span> </span>
                <CButton
                  size="sm"
                  color="danger"
                  disabled={session.roleId !== 3}
                  onClick={() => handleDeleteEvent(store.id)}
                  className="text-white"
                  >
                  <CIcon icon={cilTrash} size="sm" /> Excluir
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        ))}
      </>
    )
  }

  // 🔹 Layout em Tabela para Desktop
  return (
    <>
      <CCard className="mb-2 flex items-center justify-between">
        <CCardHeader>
          <CCardTitle>
            <b>Todos Eventos</b>
          </CCardTitle>
          <span className="text-gray-400">
            <CBadge textBgColor="primary" shape="rounded-pill">ADMIN</CBadge> Todos os eventos registrados no sistema
          </span>
        </CCardHeader>
      </CCard>

      <CCard>
        <CCardBody>
          <CTable responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Evento</CTableHeaderCell>
                <CTableHeaderCell>Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {storesList.map((store, index) => (
                <CTableRow key={store.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    <b> {store.store.title} </b> - {store.title}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="dflex items-center space-x-4">
                      <Link href={`/app/admin/events/${store.id}`} className="text-blue-600 hover:underline">
                        <CButton size="sm" color="secondary">
                          <CIcon icon={cilPen} size="sm" /> Editar
                        </CButton>
                      </Link>
                      <span className="mx-2 h-2 w-px bg-gray-300"></span>
                      <CButton
                        size="sm"
                        color="danger"
                        disabled={session.roleId !== 3}
                        onClick={() => handleDeleteEvent(store.id)}
                        className="text-white"
                      >
                        <CIcon icon={cilTrash} size="sm" /> Excluir
                      </CButton>
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
