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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSearchParams } from 'next/navigation'

interface TimeEntry {
  id: number
  entrace: Date
  exit: Date | null
  lunchEntrace: Date | null
  lunchExit: Date | null
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
  const [editType, setEditType] = useState<'entrada' | 'saida' | 'almoco_entrada' | 'almoco_saida'>('entrada')
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

  const handleEditClick = (entry: TimeEntry, type: 'entrada' | 'saida' | 'almoco_entrada' | 'almoco_saida') => {
    setSelectedEntry(entry)
    setEditType(type)
    let dateToEdit: Date | null = null
    
    switch (type) {
      case 'entrada':
        dateToEdit = entry.entrace
        break
      case 'saida':
        dateToEdit = entry.exit
        break
      case 'almoco_entrada':
        dateToEdit = entry.lunchEntrace
        break
      case 'almoco_saida':
        dateToEdit = entry.lunchExit
        break
    }
    
    if (dateToEdit) {
      setNewDateTime(format(dateToEdit, "yyyy-MM-dd'T'HH:mm"))
    } else {
      const baseDate = entry.entrace
      setNewDateTime(format(baseDate, "yyyy-MM-dd'T'HH:mm"))
    }
    
    setEditModalVisible(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedEntry || !newDateTime) return

    try {
      const updateData = {
        id: selectedEntry.id,
        [editType === 'entrada' ? 'entrace' :
          editType === 'saida' ? 'exit' :
          editType === 'almoco_entrada' ? 'lunchEntrace' : 'lunchExit']: new Date(newDateTime)
      }
      
      await editTimeEntry(updateData)
      setEditModalVisible(false)
      fetchTimeEntries() // Recarrega os dados
      alert('Registro atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar registro:', error)
      alert('Erro ao atualizar registro')
    }
  }

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return '-'
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
                  <CTableHeaderCell>Data</CTableHeaderCell>
                  <CTableHeaderCell>Entrada</CTableHeaderCell>
                  <CTableHeaderCell>Almoço Entrada</CTableHeaderCell>
                  <CTableHeaderCell>Almoço Saída</CTableHeaderCell>
                  <CTableHeaderCell>Saída</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Object.entries(timeEntries.entriesByDay).map(([day, times]: [string, any]) => (
                  <CTableRow key={day}>
                    <CTableDataCell>{formatDateTime(times.entrada).split(' ')[0]}</CTableDataCell>
                    <CTableDataCell>
                      {formatDateTime(times.entrada).split(' ')[1]}
                      <CButton
                        color="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleEditClick(times, 'entrada')}
                      >
                        Editar
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      {formatDateTime(times.almoco?.entrada).split(' ')[1]}
                      <CButton
                        color="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleEditClick(times, 'almoco_entrada')}
                      >
                        Editar
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      {formatDateTime(times.almoco?.saida).split(' ')[1]}
                      <CButton
                        color="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleEditClick(times, 'almoco_saida')}
                      >
                        Editar
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      {formatDateTime(times.saida).split(' ')[1]}
                      <CButton
                        color="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleEditClick(times, 'saida')}
                      >
                        Editar
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      {timeEntries.hoursWorkedByDay[day] ? `${timeEntries.hoursWorkedByDay[day]} horas` : '-'}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Editar {editType.replace('_', ' ').charAt(0).toUpperCase() + editType.slice(1)}</CModalTitle>
        </CModalHeader>
        <CModalBody>
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