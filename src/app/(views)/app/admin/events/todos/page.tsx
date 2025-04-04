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
  CPagination,
  CPaginationItem,
  CSpinner
} from '@coreui/react-pro'
import Link from 'next/link'
import { StoreEvents } from '@prisma/client'
import { getAllEvents } from '@/app/_actions/events/getAllEvents'
import { deleteEventById } from '@/app/_actions/events/deleteUserEvent'
import CIcon from '@coreui/icons-react'
import { cilPen, cilTrash } from '@coreui/icons'
import { useUserSession } from '@/contexts/sessionContext'

type EventWithStore = {
  id: string;
  title: string;
  date: Date;
  store: {
    title: string;
  };
}

type PaginatedEvents = {
  events: EventWithStore[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  }
}

const AdminEvents = () => {
  const { session } = useUserSession()
  const [eventsData, setEventsData] = useState<PaginatedEvents | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        if (session) {
          const data = await getAllEvents(currentPage, 10)
          setEventsData(data as PaginatedEvents)
        }
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [session, currentPage])

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
      if (eventsData) {
        setEventsData({
          ...eventsData,
          events: eventsData.events.filter((event) => event.id !== eventId)
        })
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1) return
    if (eventsData && page > eventsData.pagination.pages) return
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  if (!session) return <p>Carregando...</p>
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CSpinner color="primary" />
      </div>
    )
  }
  
  const events = eventsData?.events || []
  
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

        {events.map((event) => (
          <CCard key={event.id} className="mb-3 p-3 shadow-sm">
            <CCardBody>
              <h5 className="font-bold">{event.store.title}</h5>
              <p className="text-gray-600">{event.title}</p>
              <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
              <div className=" flex justify-between mt-3 ">

                <Link href={`/app/admin/events/${event.id}`} className="text-blue-600 hover:underline">
                  <CButton size="sm" color="secondary">
                    <CIcon icon={cilPen} size="sm" /> Editar
                  </CButton>
                </Link>
            <span> </span>
                <CButton
                  size="sm"
                  color="danger"
                  disabled={session.roleId !== 3}
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-white"
                  >
                  <CIcon icon={cilTrash} size="sm" /> Excluir
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        ))}
        
        {eventsData && eventsData.pagination.pages > 1 && (
          <div className="flex justify-center mt-4">
            <CPagination aria-label="Navegação de página">
              <CPaginationItem 
                aria-label="Anterior"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </CPaginationItem>
              
              {[...Array(eventsData.pagination.pages)].map((_, i) => (
                <CPaginationItem 
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
              
              <CPaginationItem 
                aria-label="Próximo"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === eventsData.pagination.pages}
              >
                Próximo
              </CPaginationItem>
            </CPagination>
          </div>
        )}
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
                <CTableHeaderCell>Data</CTableHeaderCell>
                <CTableHeaderCell>Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {events.map((event, index) => (
                <CTableRow key={event.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    <b> {event.store.title} </b> - {event.title}
                  </CTableDataCell>
                  <CTableDataCell>
                    {new Date(event.date).toLocaleDateString()}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="dflex items-center space-x-4">
                      <Link href={`/app/admin/events/${event.id}`} className="text-blue-600 hover:underline">
                        <CButton size="sm" color="secondary">
                          <CIcon icon={cilPen} size="sm" /> Editar
                        </CButton>
                      </Link>
                      <span className="mx-2 h-2 w-px bg-gray-300"></span>
                      <CButton
                        size="sm"
                        color="danger"
                        disabled={session.roleId !== 3}
                        onClick={() => handleDeleteEvent(event.id)}
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
          
          {eventsData && eventsData.pagination.pages > 1 && (
            <div className="flex justify-center mt-4">
              <CPagination aria-label="Navegação de página">
                <CPaginationItem 
                  aria-label="Anterior"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </CPaginationItem>
                
                {[...Array(eventsData.pagination.pages)].map((_, i) => (
                  <CPaginationItem 
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                
                <CPaginationItem 
                  aria-label="Próximo"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === eventsData.pagination.pages}
                >
                  Próximo
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default AdminEvents
