'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CFormLabel,
  CFormInput,
  CSpinner,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CBadge,
  CAlert
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilSave } from '@coreui/icons'

interface ScheduleDay {
  id: string;
  dayOfWeek: string;
  timeIn: string | null;
  timeOut: string | null;
  isDayOff: boolean;
  sundayOff: number | null;
}

interface Employee {
  id: string;
  user_id: string;
  store_id: string;
  price_per_hour: number;
  monthly_salary?: number;
  mashguiach?: {
    id: string;
    name: string;
  };
  store?: {
    id: string;
    title: string;
  };
  WorkSchedule: ScheduleDay[];
}

export default function EscalaFuncionario() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    title: '',
    color: 'success'
  })

  const employeeId = searchParams?.get('id')

  useEffect(() => {
    if (!employeeId) {
      router.push('/app/admin/banco-de-horas/funcionarios')
      return
    }

    fetchEmployee()
  }, [employeeId])

  const fetchEmployee = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fixedJobs/${employeeId}`)
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do funcionário')
      }
      const data = await response.json()
      setEmployee(data)
      
      if (data.WorkSchedule && Array.isArray(data.WorkSchedule)) {
        // Ordenar os dias da semana
        const orderedSchedule = orderDaysOfWeek(data.WorkSchedule)
        setSchedule(orderedSchedule)
      } else {
        // Criar escala padrão se não existir
        setSchedule([
          { id: 'temp-1', dayOfWeek: 'Monday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
          { id: 'temp-2', dayOfWeek: 'Tuesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
          { id: 'temp-3', dayOfWeek: 'Wednesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
          { id: 'temp-4', dayOfWeek: 'Thursday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
          { id: 'temp-5', dayOfWeek: 'Friday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
          { id: 'temp-6', dayOfWeek: 'Saturday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
          { id: 'temp-7', dayOfWeek: 'Sunday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null }
        ])
      }
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível carregar os dados do funcionário.'
      })
    } finally {
      setLoading(false)
    }
  }

  const orderDaysOfWeek = (scheduleArray: ScheduleDay[]) => {
    const daysOrder = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    }
    
    return [...scheduleArray].sort((a, b) => {
      // @ts-ignore
      return daysOrder[a.dayOfWeek] - daysOrder[b.dayOfWeek]
    })
  }

  const translateDayOfWeek = (day: string) => {
    const translations = {
      'Monday': 'Segunda-feira',
      'Tuesday': 'Terça-feira',
      'Wednesday': 'Quarta-feira',
      'Thursday': 'Quinta-feira',
      'Friday': 'Sexta-feira',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    }
    // @ts-ignore
    return translations[day] || day
  }

  const handleScheduleChange = (index: number, field: string, value: any) => {
    if (!editing) return
    
    const updatedSchedule = [...schedule]
    
    if (field === 'isDayOff') {
      const isDayOff = value === 'true' || value === true
      
      if (isDayOff) {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          timeIn: null,
          timeOut: null,
          isDayOff: true
        }
      } else {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          timeIn: '08:00',
          timeOut: '17:00',
          isDayOff: false
        }
      }
    } else if (field === 'sundayOff') {
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value ? parseInt(value) : null
      }
    } else {
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value
      }
    }
    
    setSchedule(updatedSchedule)
  }

  const handleSaveSchedule = async () => {
    if (!employee) return
    
    setSaving(true)
    try {
      const updatedEmployee = {
        ...employee,
        workSchedule: schedule.map(day => ({
          dayOfWeek: day.dayOfWeek,
          timeIn: day.timeIn,
          timeOut: day.timeOut,
          isDayOff: day.isDayOff,
          sundayOff: day.sundayOff
        }))
      }
      
      const response = await fetch(`/api/fixedJobs/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployee),
      })
      
      if (!response.ok) throw new Error('Falha ao salvar escala')
      
      setToast({
        visible: true,
        color: 'success',
        title: 'Sucesso',
        message: 'Escala atualizada com sucesso!'
      })
      
      setEditing(false)
      fetchEmployee() // Recarregar dados atualizados
    } catch (error) {
      console.error('Erro ao salvar escala:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível salvar a escala.'
      })
    } finally {
      setSaving(false)
    }
  }

  const formatHours = (timeString: string | null) => {
    if (!timeString) return '-'
    return timeString
  }

  return (
    <div className="container mx-auto p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <CButton 
            color="link" 
            className="me-2 p-0" 
            onClick={() => router.push('/app/admin/banco-de-horas/funcionarios')}
          >
            <CIcon icon={cilArrowLeft} size="xl" />
          </CButton>
          <h1 className="text-2xl font-bold m-0">
            Escala de Trabalho
            {employee?.mashguiach && (
              <span className="ms-2">- {employee.mashguiach.name}</span>
            )}
          </h1>
        </div>
        
        <div>
          {editing ? (
            <CButton 
              color="success" 
              onClick={handleSaveSchedule}
              disabled={saving}
            >
              {saving ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <CIcon icon={cilSave} className="me-2" />
                  Salvar Alterações
                </>
              )}
            </CButton>
          ) : (
            <CButton 
              color="primary" 
              onClick={() => setEditing(true)}
            >
              <CIcon icon={cilPencil} className="me-2" />
              Editar Escala
            </CButton>
          )}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <CSpinner />
        </div>
      ) : employee ? (
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>Informações do Funcionário</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4">
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel className="fw-bold">Funcionário:</CFormLabel>
                  <div>{employee.mashguiach?.name || 'N/A'}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel className="fw-bold">Estabelecimento:</CFormLabel>
                  <div>{employee.store?.title || 'N/A'}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel className="fw-bold">Valor por Hora:</CFormLabel>
                  <div>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(employee.price_per_hour)}
                  </div>
                </div>
              </CCol>
            </CRow>

            <h3 className="mb-3">Escala Semanal</h3>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow className="text-center">
                  <CTableHeaderCell style={{ width: '20%' }}>Dia da Semana</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>Entrada</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>Saída</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '35%' }}>Observações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {schedule.map((day, index) => (
                  <CTableRow key={day.id || index}>
                    <CTableDataCell>
                      {translateDayOfWeek(day.dayOfWeek)}
                    </CTableDataCell>
                    <CTableDataCell>
                      {editing ? (
                        <CFormSelect
                          value={day.isDayOff ? 'true' : 'false'}
                          onChange={(e) => handleScheduleChange(index, 'isDayOff', e.target.value)}
                        >
                          <option value="false">Dia de trabalho</option>
                          <option value="true">Folga</option>
                        </CFormSelect>
                      ) : (
                        <CBadge color={day.isDayOff ? 'danger' : 'success'}>
                          {day.isDayOff ? 'Folga' : 'Trabalho'}
                        </CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {day.isDayOff ? (
                        '-'
                      ) : editing ? (
                        <CFormInput
                          type="time"
                          value={day.timeIn || ''}
                          onChange={(e) => handleScheduleChange(index, 'timeIn', e.target.value)}
                        />
                      ) : (
                        formatHours(day.timeIn)
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {day.isDayOff ? (
                        '-'
                      ) : editing ? (
                        <CFormInput
                          type="time"
                          value={day.timeOut || ''}
                          onChange={(e) => handleScheduleChange(index, 'timeOut', e.target.value)}
                        />
                      ) : (
                        formatHours(day.timeOut)
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {day.dayOfWeek === 'Sunday' && (
                        editing ? (
                          <CFormSelect
                            value={day.sundayOff?.toString() || ''}
                            onChange={(e) => handleScheduleChange(index, 'sundayOff', e.target.value)}
                          >
                            <option value="">Todos os domingos</option>
                            <option value="1">1º domingo do mês</option>
                            <option value="2">2º domingo do mês</option>
                            <option value="3">3º domingo do mês</option>
                            <option value="4">4º domingo do mês</option>
                            <option value="5">5º domingo do mês</option>
                          </CFormSelect>
                        ) : (
                          <>
                            {day.sundayOff ? (
                              <span>Folga no {day.sundayOff}º domingo do mês</span>
                            ) : (
                              <span>Todos os domingos {day.isDayOff ? 'são folga' : 'são dias de trabalho'}</span>
                            )}
                          </>
                        )
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      ) : (
        <CAlert color="warning">
          Funcionário não encontrado.
        </CAlert>
      )}

      {/* Toast notifications */}
      <CToaster placement="top-end">
        {toast.visible && (
          <CToast
            autohide={true}
            visible={toast.visible}
            color={toast.color}
            onClose={() => setToast({ ...toast, visible: false })}
          >
            <CToastHeader closeButton>
              <strong>{toast.title}</strong>
            </CToastHeader>
            <CToastBody>
              {toast.message}
            </CToastBody>
          </CToast>
        )}
      </CToaster>
    </div>
  )
} 