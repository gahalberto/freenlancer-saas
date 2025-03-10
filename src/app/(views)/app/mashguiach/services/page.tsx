'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getMashguiachServices } from '@/app/_actions/events/getMashguiachServices'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CSpinner,
  CBadge,
} from '@coreui/react-pro'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { formatCurrency } from '@/app/_lib/formatters'

dayjs.locale('pt-br')

// Definir interface para o serviço
interface Service {
  id: string
  arriveMashguiachTime: Date
  endMashguiachTime: Date
  mashguiachPrice: number
  accepted: boolean
  isApproved: boolean
  StoreEvents?: {
    title?: string
    store?: {
      title?: string
    }
  }
}

export default function MashguiachServicesPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState({
    totalServices: 0,
    totalHours: 0,
    totalValue: 0,
  })
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1)) // Mês atual (1-12)
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  // Gerar anos de 2020 até o ano atual + 1
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => ({
    value: String(2020 + i),
    label: `${2020 + i}`,
  }))

  const fetchServices = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const result = await getMashguiachServices({
        user_id: session.user.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      })

      if (result.success && result.services) {
        setServices(result.services as Service[])
        setStats({
          totalServices: result.totalServices || 0,
          totalHours: result.totalHours || 0,
          totalValue: result.totalValue || 0,
        })
      } else {
        console.error('Erro ao buscar serviços:', result.message)
        setServices([])
        setStats({
          totalServices: 0,
          totalHours: 0,
          totalValue: 0,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchServices()
    }
  }, [session, selectedMonth, selectedYear])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value)
  }

  const getStatusBadge = (service: Service) => {
    if (service.accepted) {
      return <CBadge color="success">Aceito</CBadge>
    } else if (service.isApproved) {
      return <CBadge color="warning">Aprovado</CBadge>
    } else {
      return <CBadge color="danger">Pendente</CBadge>
    }
  }

  const calculateDuration = (start: Date | string, end: Date | string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const durationMs = endTime.getTime() - startTime.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)
    return durationHours.toFixed(2)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h4>Meus Serviços</h4>
        <div className="d-flex gap-3 mt-3">
          <CFormSelect
            value={selectedMonth}
            onChange={handleMonthChange}
            label="Mês"
            options={[
              { label: 'Selecione o mês', value: '' },
              ...months,
            ]}
          />
          <CFormSelect
            value={selectedYear}
            onChange={handleYearChange}
            label="Ano"
            options={[
              { label: 'Selecione o ano', value: '' },
              ...years,
            ]}
          />
        </div>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center my-5">
            <CSpinner />
            <p className="mt-2">Carregando serviços...</p>
          </div>
        ) : (
          <>
            <CRow className="mb-4">
              <CCol md={4}>
                <CCard className="text-center p-3 bg-info text-white">
                  <h5>Total de Serviços</h5>
                  <h2>{stats.totalServices}</h2>
                </CCard>
              </CCol>
              <CCol md={4}>
                <CCard className="text-center p-3 bg-primary text-white">
                  <h5>Total de Horas</h5>
                  <h2>{stats.totalHours}</h2>
                </CCard>
              </CCol>
              <CCol md={4}>
                <CCard className="text-center p-3 bg-success text-white">
                  <h5>Valor Total</h5>
                  <h2>{formatCurrency(stats.totalValue)}</h2>
                </CCard>
              </CCol>
            </CRow>

            {services.length === 0 ? (
              <div className="text-center my-5">
                <p>Nenhum serviço encontrado para o período selecionado.</p>
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Data</CTableHeaderCell>
                    <CTableHeaderCell>Evento</CTableHeaderCell>
                    <CTableHeaderCell>Local</CTableHeaderCell>
                    <CTableHeaderCell>Horário</CTableHeaderCell>
                    <CTableHeaderCell>Duração (h)</CTableHeaderCell>
                    <CTableHeaderCell>Valor</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {services.map((service) => (
                    <CTableRow key={service.id}>
                      <CTableDataCell>
                        {dayjs(service.arriveMashguiachTime).format('DD/MM/YYYY')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {service.StoreEvents?.title || 'Sem título'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {service.StoreEvents?.store?.title || 'Local não informado'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {dayjs(service.arriveMashguiachTime).format('HH:mm')} - 
                        {dayjs(service.endMashguiachTime).format('HH:mm')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {calculateDuration(service.arriveMashguiachTime, service.endMashguiachTime)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {formatCurrency(service.mashguiachPrice)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {getStatusBadge(service)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
} 