'use client'

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
  CFormTextarea,
  CInputGroup,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormCheck,
  CCardTitle,
  CBadge,
} from '@coreui/react-pro'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Alert = {
  id: string
  title: string
  message: string
  type: string
  link?: string | null
  active: boolean
  roleIds: number[]
  validFrom: string
  validTo?: string | null
  createdAt: string
  updatedAt: string
}

export default function AlertsAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    link: '',
    active: true,
    roleIds: [] as number[],
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
  })

  const alertTypes = [
    { value: 'info', label: 'Informação' },
    { value: 'success', label: 'Sucesso' },
    { value: 'warning', label: 'Aviso' },
    { value: 'danger', label: 'Erro' },
    { value: 'primary', label: 'Primário' },
    { value: 'secondary', label: 'Secundário' },
  ]

  const roleOptions = [
    { value: 1, label: 'Mashguiach' },
    { value: 2, label: 'Estabelecimento' },
    { value: 3, label: 'Admin' },
    { value: 4, label: 'Superadmin' },
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAlerts()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/alerts')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar alertas')
      }
      
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        roleIds: [...formData.roleIds, roleId]
      })
    } else {
      setFormData({
        ...formData,
        roleIds: formData.roleIds.filter(id => id !== roleId)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar alerta')
      }

      // Limpar formulário e recarregar alertas
      setFormData({
        title: '',
        message: '',
        type: 'info',
        link: '',
        active: true,
        roleIds: [],
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
      })
      
      fetchAlerts()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar alerta')
    } finally {
      setLoading(false)
    }
  }

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do alerta')
      }

      fetchAlerts()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status do alerta')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (!session?.user || (session.user.roleId !== 3 && session.user.roleId !== 4)) {
    return <p>Você não tem permissão para acessar esta página.</p>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>
              <strong>Cadastrar Novo Alerta</strong>
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="title">Título</CFormLabel>
                    <CFormInput
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="type">Tipo</CFormLabel>
                    <CFormSelect
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      {alertTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel htmlFor="message">Mensagem</CFormLabel>
                <CFormTextarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="link">Link (opcional)</CFormLabel>
                <CFormInput
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="Ex: /news/novidade"
                />
              </div>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="validFrom">Data de início</CFormLabel>
                    <CFormInput
                      type="date"
                      id="validFrom"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="validTo">Data de término (opcional)</CFormLabel>
                    <CFormInput
                      type="date"
                      id="validTo"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Exibir para:</CFormLabel>
                <div className="d-flex gap-3 flex-wrap">
                  {roleOptions.map((role) => (
                    <div key={role.value}>
                      <CFormCheck
                        id={`role-${role.value}`}
                        label={role.label}
                        checked={formData.roleIds.includes(role.value)}
                        onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <CFormCheck
                  id="active"
                  label="Ativo"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              </div>

              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>
              <strong>Alertas Cadastrados</strong>
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Título</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Válido de</CTableHeaderCell>
                  <CTableHeaderCell>Válido até</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <CTableRow key={alert.id}>
                      <CTableDataCell>{alert.title}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={alert.type as any}>
                          {alertTypes.find(t => t.value === alert.type)?.label || alert.type}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{formatDate(alert.validFrom)}</CTableDataCell>
                      <CTableDataCell>{alert.validTo ? formatDate(alert.validTo) : 'Sem data limite'}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={alert.active ? 'success' : 'danger'}>
                          {alert.active ? 'Ativo' : 'Inativo'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color={alert.active ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => toggleAlertStatus(alert.id, alert.active)}
                        >
                          {alert.active ? 'Desativar' : 'Ativar'}
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">
                      Nenhum alerta cadastrado
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
} 