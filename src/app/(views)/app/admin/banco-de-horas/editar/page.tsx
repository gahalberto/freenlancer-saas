'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { User } from '@prisma/client'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getTimesByUserAndMonth } from '@/app/_actions/time-entries/getTimesByUserAndMonth'
import { editTimeEntry } from '@/app/_actions/time-entries/editTimeEntry'
import { adjustSingleTimeEntry, adjustAllTimeEntries } from '@/app/_actions/time-entries/adjustTimeEntries'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSearchParams } from 'next/navigation'

interface TimeEntry {
  id: number
  type: 'ENTRADA' | 'SAIDA'
  data_hora: Date
}

const EditTimeEntriesPage = () => {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [mashguichimList, setMashguichimList] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>(searchParams?.get('userId') ?? '')
  const [selectedMonth, setSelectedMonth] = useState<number>(parseInt(searchParams?.get('month') ?? '') || new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(parseInt(searchParams?.get('year') ?? '') || new Date().getFullYear())
  const [timeEntries, setTimeEntries] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [newDateTime, setNewDateTime] = useState<string>('')

  useEffect(() => {
    const fetchMashguichim = async () => {
      if (status === 'authenticated') {
        const data = await getAllMashguichim()
        setMashguichimList(data as User[])
      }
    }

    fetchMashguichim()
  }, [status])

  useEffect(() => {
    if (selectedUserId) {
      fetchTimeEntries()
    }
  }, [selectedUserId, selectedMonth, selectedYear])

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1)
    return format(date, 'MMMM', { locale: ptBR })
  }

  const fetchTimeEntries = async () => {
    if (!selectedUserId) {
      alert('Por favor, selecione um mashguiach')
      return
    }

    setLoading(true)
    try {
      const data = await getTimesByUserAndMonth(selectedUserId, selectedMonth, selectedYear)
      setTimeEntries(data)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
      alert('Ocorreu um erro ao buscar os registros')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setNewDateTime(format(new Date(entry.data_hora), "yyyy-MM-dd'T'HH:mm"))
    setEditModalVisible(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedEntry || !newDateTime) return

    try {
      await editTimeEntry(selectedEntry.id, new Date(newDateTime))
      setEditModalVisible(false)
      fetchTimeEntries() // Recarrega os dados
      alert('Registro atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar registro:', error)
      alert('Erro ao atualizar registro')
    }
  }

  const handleAdjustSingle = async (entryId: number, adjustType: 'up' | 'down') => {
    try {
      await adjustSingleTimeEntry(entryId, adjustType)
      fetchTimeEntries() // Recarrega os dados
      alert('Registro ajustado com sucesso!')
    } catch (error) {
      console.error('Erro ao ajustar registro:', error)
      alert('Erro ao ajustar registro')
    }
  }

  const handleAdjustAll = async (adjustType: 'up' | 'down') => {
    if (!selectedUserId) return

    try {
      await adjustAllTimeEntries(selectedUserId, selectedMonth, selectedYear, adjustType)
      fetchTimeEntries() // Recarrega os dados
      alert('Todos os registros foram ajustados com sucesso!')
    } catch (error) {
      console.error('Erro ao ajustar registros:', error)
      alert('Erro ao ajustar registros')
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Editar Registros de Ponto</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="mashguiach">Mashguiach</CFormLabel>
                <CFormSelect
                  id="mashguiach"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Selecione um mashguiach</option>
                  {mashguichimList.map((mashguiach) => (
                    <option key={mashguiach.id} value={mashguiach.id}>
                      {mashguiach.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="month">Mês</CFormLabel>
                <CFormSelect
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="year">Ano</CFormLabel>
                <CFormInput
                  id="year"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton
                  color="primary"
                  onClick={fetchTimeEntries}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? 'Buscando...' : 'Buscar Registros'}
                </CButton>
                {timeEntries && (
                  <>
                    <CButton
                      color="warning"
                      onClick={() => handleAdjustAll('up')}
                      disabled={loading}
                      className="me-2"
                    >
                      Ajustar Todos para Cima
                    </CButton>
                    <CButton
                      color="warning"
                      onClick={() => handleAdjustAll('down')}
                      disabled={loading}
                    >
                      Ajustar Todos para Baixo
                    </CButton>
                  </>
                )}
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {timeEntries && (
        <CCard>
          <CCardHeader>
            <strong>
              Registros de Ponto - {mashguichimList.find(m => m.id === selectedUserId)?.name} - {getMonthName(selectedMonth)}/{selectedYear}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CTable bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Data/Hora</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Object.entries(timeEntries.entriesByDay).map(([day, times]: [string, any]) => (
                  <>
                    {times.entrada && (
                      <CTableRow key={`entrada-${day}`}>
                        <CTableDataCell>{formatDateTime(times.entrada)}</CTableDataCell>
                        <CTableDataCell>Entrada</CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            color="primary"
                            size="sm"
                            onClick={() => handleEditClick({
                              id: times.entradaId,
                              type: 'ENTRADA',
                              data_hora: new Date(times.entrada)
                            })}
                            className="me-2"
                          >
                            Editar
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleAdjustSingle(times.entradaId, 'up')}
                            className="me-2"
                          >
                            ↑ Próxima Hora
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleAdjustSingle(times.entradaId, 'down')}
                          >
                            ↓ Hora Atual
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                    {times.saida && (
                      <CTableRow key={`saida-${day}`}>
                        <CTableDataCell>{formatDateTime(times.saida)}</CTableDataCell>
                        <CTableDataCell>Saída</CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            color="primary"
                            size="sm"
                            onClick={() => handleEditClick({
                              id: times.saidaId,
                              type: 'SAIDA',
                              data_hora: new Date(times.saida)
                            })}
                            className="me-2"
                          >
                            Editar
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleAdjustSingle(times.saidaId, 'up')}
                            className="me-2"
                          >
                            ↑ Próxima Hora
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleAdjustSingle(times.saidaId, 'down')}
                          >
                            ↓ Hora Atual
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Editar Registro de {selectedEntry?.type === 'ENTRADA' ? 'Entrada' : 'Saída'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>Data e Hora</CFormLabel>
          <CFormInput
            type="datetime-local"
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveEdit}>
            Salvar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default EditTimeEntriesPage 