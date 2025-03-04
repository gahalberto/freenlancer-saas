'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CMultiSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { Stores, TimeEntries, User } from '@prisma/client'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getTimesByUser } from '@/app/_actions/time-entries/getTimesByUser'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Definindo o tipo correto para as entradas de tempo
interface TimeEntry {
  id: number
  user_id: string
  store_id: string
  entrace: Date | null
  exit: Date | null
  lunchEntrace: Date | null
  lunchExit: Date | null
  latitude: number | null
  longitude: number | null
  user: User
  stores: Stores
}

const TimeEntriesPage = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<User[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [times, setTimes] = useState<TimeEntry[]>([])
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchStores = async () => {
      if (status === 'authenticated') {
        const data = await getAllMashguichim()
        setStoresList(data as User[])
      }
    }

    fetchStores()
  }, [session, status])

  const options = storesList.map(store => ({
    label: store.name,
    value: store.id
  }))

  const formatDateTime = (date: Date | null) => {
    if (!date) return '-'
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }
  
  const filterEventsByStore = async (selected: any) => {
    if (!selected || selected.length === 0) return
    setSelectedStoreId(selected.length > 0 ? String(selected[0]?.value) : null)
    const storeId = String(selected[0]?.value)
    fetchEventsByStore(storeId)
  }

  const fetchEventsByStore = async (id: string) => {
    try {
      const res = await getTimesByUser(id)
      setTimes(res as TimeEntry[])

      // Buscar endereços para todas as entradas
      res.forEach((time) => {
        if (time.latitude && time.longitude) {
          fetchAddress(String(time.id), time.latitude, time.longitude)
        }
      })
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  const fetchAddress = async (id: string, lat: number, lng: number) => {
    if (addresses[id]) return

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address
        setAddresses(prev => ({ ...prev, [id]: formattedAddress }))
      } else {
        setAddresses(prev => ({ ...prev, [id]: 'Endereço não encontrado' }))
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
      setAddresses(prev => ({ ...prev, [id]: 'Erro ao buscar' }))
    }
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
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">USUÁRIO</CTableHeaderCell>
                <CTableHeaderCell scope="col">ESTABELECIMENTO</CTableHeaderCell>
                <CTableHeaderCell scope="col">ENTRADA</CTableHeaderCell>
                <CTableHeaderCell scope="col">SAÍDA</CTableHeaderCell>
                <CTableHeaderCell scope="col">ALMOÇO ENTRADA</CTableHeaderCell>
                <CTableHeaderCell scope="col">ALMOÇO SAÍDA</CTableHeaderCell>
                <CTableHeaderCell scope="col">LOCALIDADE</CTableHeaderCell>
              </CTableRow>
              {times.map((time, index) => (
                <CTableRow key={time.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    <b>{time.id}</b>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{time.user?.name || '-'}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{time.stores?.title || '-'}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{formatDateTime(time.entrace)}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{formatDateTime(time.exit)}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{formatDateTime(time.lunchEntrace)}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">{formatDateTime(time.lunchExit)}</span>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="flex items-center">
                      <span className="mx-4 h-5 w-px bg-gray-300">
                        {addresses[time.id] || 'Carregando...'}
                      </span>
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

export default TimeEntriesPage
