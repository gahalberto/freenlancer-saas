'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CFormLabel,
  CForm,
  CFormInput,
  CSpinner,
  CFormSelect,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CCloseButton,
  CInputGroup
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllStores } from '@/app/_actions/stores/getAllStores'

interface WorkSchedule {
  dayOfWeek: string;
  timeIn: string | null;
  timeOut: string | null;
  isDayOff: boolean;
  sundayOff: number | null;
}

interface FormData {
  user_id: string;
  store_id: string;
  monthly_salary: number;
  workSchedule: WorkSchedule[];
}

interface User {
  id: string;
  name: string;
}

interface Store {
  id: string;
  title: string;
}

interface Employee {
  id: string;
  user_id: string;
  store_id: string;
  monthly_salary: number;
  mashguiach?: User;
  store?: Store;
  WorkSchedule?: WorkSchedule[];
}

export default function GerenciarFuncionarios() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    title: '',
    color: 'success'
  })
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('info')

  // Formulário para novo funcionário ou edição
  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    store_id: '',
    monthly_salary: 0,
    workSchedule: [
      { dayOfWeek: 'Monday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
      { dayOfWeek: 'Tuesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
      { dayOfWeek: 'Wednesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
      { dayOfWeek: 'Thursday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
      { dayOfWeek: 'Friday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
      { dayOfWeek: 'Saturday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
      { dayOfWeek: 'Sunday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
    ]
  })

  // Estados para paginação e filtragem
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const itemsPerPage = 10

  useEffect(() => {
    fetchEmployees()
    fetchStores()
    fetchUsers()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fixedJobs')
      if (!response.ok) throw new Error('Falha ao carregar dados de funcionários')
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível carregar os dados dos funcionários.'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStores = async () => {
    try {
      const data = await getAllStores()
      setStores(data)
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error)
    }
  }

  const fetchUsers = async () => {''
    try {
      const data = await getAllMashguichim();
      setUsers(data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'monthly_salary' 
        ? parseFloat(value) || 0 
        : value
    })
  }

  const handleScheduleChange = (index: number, field: string, value: string | boolean) => {
    const updatedSchedule = [...formData.workSchedule]
    
    if (field === 'isDayOff') {
      const isDayOff = value === 'true' || value === true
      // Se marcado como folga, limpar horários
      if (isDayOff) {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          timeIn: null,
          timeOut: null,
          isDayOff
        }
      } else {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          timeIn: '08:00',
          timeOut: '17:00',
          isDayOff
        }
      }
    } else if (field === 'sundayOff') {
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value ? parseInt(value as string) : null
      }
    } else {
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value
      }
    }

    setFormData({
      ...formData,
      workSchedule: updatedSchedule
    })
  }

  const handleOpenNewEmployee = () => {
    setEditingEmployee(null)
    setFormData({
      user_id: '',
      store_id: '',
      monthly_salary: 0,
      workSchedule: [
        { dayOfWeek: 'Monday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Tuesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Wednesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Thursday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Friday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Saturday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
        { dayOfWeek: 'Sunday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
      ]
    })
    setShowModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    
    // Preparar dados da escala ou usar padrão se não existir
    const workSchedule = employee.WorkSchedule && employee.WorkSchedule.length 
      ? employee.WorkSchedule.map((schedule: any) => ({
          dayOfWeek: schedule.dayOfWeek,
          timeIn: schedule.timeIn,
          timeOut: schedule.timeOut,
          isDayOff: schedule.isDayOff,
          sundayOff: schedule.sundayOff
        }))
      : [
        { dayOfWeek: 'Monday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Tuesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Wednesday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Thursday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Friday', timeIn: '08:00', timeOut: '17:00', isDayOff: false, sundayOff: null },
        { dayOfWeek: 'Saturday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
        { dayOfWeek: 'Sunday', timeIn: null, timeOut: null, isDayOff: true, sundayOff: null },
      ]
    
    setFormData({
      user_id: employee.user_id,
      store_id: employee.store_id,
      monthly_salary: employee.monthly_salary || 0,
      workSchedule
    })
    
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.store_id || formData.monthly_salary <= 0) {
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Preencha todos os campos obrigatórios.'
      })
      return
    }
    
    setLoading(true)
    try {
      const url = editingEmployee 
        ? `/api/fixedJobs/${editingEmployee.id}`
        : '/api/fixedJobs'
        
      const method = editingEmployee ? 'PUT' : 'POST'
      
      // Remover o campo monthly_salary que não existe no banco de dados
      const { monthly_salary, ...dataWithoutMonthlySalary } = formData;
      
      // Garantir que valores numéricos são enviados corretamente
      const dataToSend = {
        ...dataWithoutMonthlySalary,
        monthly_salary: Number(formData.monthly_salary)
      }
      
      console.log('Enviando dados:', dataToSend)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Resposta de erro da API:', errorData)
        throw new Error(`Falha ao salvar funcionário: ${errorData.error || 'Erro desconhecido'}`)
      }
      
      setToast({
        visible: true,
        color: 'success',
        title: 'Sucesso',
        message: editingEmployee 
          ? 'Funcionário atualizado com sucesso!'
          : 'Funcionário cadastrado com sucesso!'
      })
      
      setShowModal(false)
      fetchEmployees()
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Não foi possível salvar os dados do funcionário.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/fixedJobs/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Falha ao remover funcionário')
      
      setToast({
        visible: true,
        color: 'success',
        title: 'Sucesso',
        message: 'Funcionário removido com sucesso!'
      })
      
      fetchEmployees()
    } catch (error) {
      console.error('Erro ao remover funcionário:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível remover o funcionário.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewSchedule = (employee: Employee) => {
    router.push(`/app/admin/banco-de-horas/escala?id=${employee.id}`)
  }

  // Filtrar e paginar funcionários
  const filteredEmployees = employees.filter(employee => 
    employee.mashguiach?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.store?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Funcionários</h1>
        <CButton color="primary" onClick={handleOpenNewEmployee}>
          <CIcon icon={cilPlus} className="me-2" /> Novo Funcionário
        </CButton>
      </div>

      <div className="mb-4">
        <CFormInput
          placeholder="Buscar por nome ou estabelecimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <CCard className="mb-4">
        <CCardBody className="p-0">
          <CTable responsive striped bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Funcionário</CTableHeaderCell>
                <CTableHeaderCell>Estabelecimento</CTableHeaderCell>
                <CTableHeaderCell>Salário Mensal</CTableHeaderCell>
                <CTableHeaderCell>Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {loading ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center py-4">
                    <CSpinner />
                  </CTableDataCell>
                </CTableRow>
              ) : currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <CTableRow key={employee.id}>
                    <CTableDataCell>{employee.mashguiach?.name || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{employee.store?.title || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{formatCurrency(employee.monthly_salary)}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton color="primary" variant="outline" size="sm" onClick={() => handleEditEmployee(employee)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="secondary" variant="outline" size="sm" onClick={() => handleViewSchedule(employee)}>
                          Escala
                        </CButton>
                        <CButton color="danger" variant="outline" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center py-4">
                    Nenhum funcionário encontrado
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
        {totalPages > 1 && (
          <CCardFooter className="d-flex justify-content-end gap-2 py-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <CButton
                key={i + 1}
                color={currentPage === i + 1 ? "primary" : "light"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </CButton>
            ))}
          </CCardFooter>
        )}
      </CCard>

      {/* Modal para adicionar/editar funcionário */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </CModalTitle>
          <CCloseButton onClick={() => setShowModal(false)} />
        </CModalHeader>
        
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            {/* Navegação por tabs */}
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'info'}
                  onClick={() => setActiveTab('info')}
                >
                  Informações
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'schedule'}
                  onClick={() => setActiveTab('schedule')}
                >
                  Escala de Trabalho
                </CNavLink>
              </CNavItem>
            </CNav>
            
            <CTabContent>
              <CTabPane role="tabpanel" visible={activeTab === 'info'}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="user_id">Funcionário</CFormLabel>
                    <CFormSelect 
                      id="user_id"
                      value={formData.user_id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, user_id: e.target.value})}
                    >
                      <option value="">Selecione um funcionário</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel htmlFor="store_id">Estabelecimento</CFormLabel>
                    <CFormSelect 
                      id="store_id"
                      value={formData.store_id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, store_id: e.target.value})}
                    >
                      <option value="">Selecione um estabelecimento</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="monthly_salary">Salário Mensal	 (R$)</CFormLabel>
                    <CFormInput
                      id="monthly_salary"
                      name="monthly_salary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthly_salary}
                      onChange={handleInputChange}
                    />
                  </CCol>
                </CRow>
              </CTabPane>
              
              <CTabPane role="tabpanel" visible={activeTab === 'schedule'}>
                {formData.workSchedule.map((day, index) => (
                  <CRow key={day.dayOfWeek} className="mb-3 align-items-center">
                    <CCol xs={12} md={2}>
                      <CFormLabel>{day.dayOfWeek}</CFormLabel>
                    </CCol>
                    
                    <CCol xs={12} md={2}>
                      <CFormSelect 
                        value={day.isDayOff ? 'true' : 'false'} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleScheduleChange(index, 'isDayOff', e.target.value)}
                      >
                        <option value="false">Dia de trabalho</option>
                        <option value="true">Folga</option>
                      </CFormSelect>
                    </CCol>
                    
                    {!day.isDayOff && (
                      <>
                        <CCol xs={12} md={3}>
                          <CFormLabel htmlFor={`timeIn-${index}`}>Entrada</CFormLabel>
                          <CFormInput
                            id={`timeIn-${index}`}
                            type="time"
                            value={day.timeIn || ''}
                            onChange={(e) => handleScheduleChange(index, 'timeIn', e.target.value)}
                          />
                        </CCol>
                        
                        <CCol xs={12} md={3}>
                          <CFormLabel htmlFor={`timeOut-${index}`}>Saída</CFormLabel>
                          <CFormInput
                            id={`timeOut-${index}`}
                            type="time"
                            value={day.timeOut || ''}
                            onChange={(e) => handleScheduleChange(index, 'timeOut', e.target.value)}
                          />
                        </CCol>
                      </>
                    )}
                    
                    {day.dayOfWeek === 'Sunday' && (
                      <CCol xs={12} md={day.isDayOff ? 8 : 2}>
                        <CFormLabel htmlFor="sundayOff">Folga no domingo</CFormLabel>
                        <CFormSelect 
                          value={day.sundayOff?.toString() || ''} 
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleScheduleChange(index, 'sundayOff', e.target.value)}
                        >
                          <option value="">Todos os domingos</option>
                          <option value="1">1º domingo do mês</option>
                          <option value="2">2º domingo do mês</option>
                          <option value="3">3º domingo do mês</option>
                          <option value="4">4º domingo do mês</option>
                          <option value="5">5º domingo do mês</option>
                        </CFormSelect>
                      </CCol>
                    )}
                  </CRow>
                ))}
              </CTabPane>
            </CTabContent>
          </CForm>
        </CModalBody>
        
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" /> 
                Salvando...
              </>
            ) : 'Salvar'}
          </CButton>
        </CModalFooter>
      </CModal>

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