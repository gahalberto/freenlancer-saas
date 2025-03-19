'use client'

import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CFormLabel,
  CForm,
  CSpinner,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CCloseButton
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilCheck, cilX, cilPencil, cilTrash } from '@coreui/icons'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllStores } from '@/app/_actions/stores/getAllStores'

export default function JustificarFaltas() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [justifications, setJustifications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    title: '',
    color: 'success'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Buscar justificativas
      const justificationsResponse = await fetch('/api/absenceJustifications')
      const justificationsData = await justificationsResponse.json()
      setJustifications(justificationsData)

      // Buscar usuários
      const usersData = await getAllMashguichim()
      setUsers(usersData)

      // Buscar estabelecimentos
      const storesData = await getAllStores()
      setStores(storesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível carregar os dados.',
        color: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser || !selectedStore || !date || !reason) {
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Preencha todos os campos.',
        color: 'danger'
      })
      return
    }

    setSubmitting(true)
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `/api/absenceJustifications/${editingId}` 
        : '/api/absenceJustifications'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser,
          store_id: selectedStore,
          date,
          reason
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar justificativa')
      }

      // Resetar formulário
      setSelectedUser('')
      setSelectedStore('')
      setDate('')
      setReason('')
      setEditingId(null)
      
      // Recarregar dados
      fetchData()
      
      setToast({
        visible: true,
        title: 'Sucesso',
        message: editingId 
          ? 'Justificativa atualizada com sucesso!' 
          : 'Justificativa registrada com sucesso!',
        color: 'success'
      })
    } catch (error) {
      console.error('Erro ao salvar justificativa:', error)
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível salvar a justificativa.',
        color: 'danger'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (justification: any) => {
    setSelectedUser(justification.user_id)
    setSelectedStore(justification.store_id)
    setDate(justification.date.split('T')[0]) // Formatar a data para YYYY-MM-DD
    setReason(justification.reason)
    setEditingId(justification.id)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/absenceJustifications/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir justificativa')
      }

      // Fechar modal e recarregar dados
      setShowModal(false)
      setDeleteId(null)
      fetchData()
      
      setToast({
        visible: true,
        title: 'Sucesso',
        message: 'Justificativa excluída com sucesso!',
        color: 'success'
      })
    } catch (error) {
      console.error('Erro ao excluir justificativa:', error)
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível excluir a justificativa.',
        color: 'danger'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setShowModal(true)
  }

  const handleApprove = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/absenceJustifications/${id}/approve`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Erro ao aprovar justificativa')
      }

      // Recarregar dados
      fetchData()
      
      setToast({
        visible: true,
        title: 'Sucesso',
        message: 'Justificativa aprovada com sucesso!',
        color: 'success'
      })
    } catch (error) {
      console.error('Erro ao aprovar justificativa:', error)
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível aprovar a justificativa.',
        color: 'danger'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/absenceJustifications/${id}/reject`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Erro ao rejeitar justificativa')
      }

      // Recarregar dados
      fetchData()
      
      setToast({
        visible: true,
        title: 'Sucesso',
        message: 'Justificativa rejeitada com sucesso!',
        color: 'success'
      })
    } catch (error) {
      console.error('Erro ao rejeitar justificativa:', error)
      setToast({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível rejeitar a justificativa.',
        color: 'danger'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <CBadge color="warning">Pendente</CBadge>
      case 'APPROVED':
        return <CBadge color="success">Aprovada</CBadge>
      case 'REJECTED':
        return <CBadge color="danger">Rejeitada</CBadge>
      default:
        return <CBadge color="secondary">Desconhecido</CBadge>
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Justificativas de Faltas</h1>
      
      <CRow>
        <CCol md={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <CCardTitle>{editingId ? 'Editar Justificativa' : 'Nova Justificativa'}</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="user">Funcionário</CFormLabel>
                    <CFormSelect 
                      id="user"
                      value={selectedUser}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUser(e.target.value)}
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
                    <CFormLabel htmlFor="store">Estabelecimento</CFormLabel>
                    <CFormSelect 
                      id="store"
                      value={selectedStore}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStore(e.target.value)}
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
                  <CCol md={6}>
                    <CFormLabel htmlFor="date">Data da Falta</CFormLabel>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="form-control"
                    />
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="reason">Motivo</CFormLabel>
                    <CFormTextarea 
                      id="reason"
                      value={reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                      rows={3}
                    />
                  </CCol>
                </CRow>

                <CButton 
                  type="submit"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> 
                      Salvando...
                    </>
                  ) : editingId ? 'Atualizar' : 'Registrar'}
                </CButton>
                
                {editingId && (
                  <CButton 
                    color="secondary"
                    onClick={() => {
                      setSelectedUser('')
                      setSelectedStore('')
                      setDate('')
                      setReason('')
                      setEditingId(null)
                    }}
                    className="ms-2"
                  >
                    Cancelar
                  </CButton>
                )}
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {loading ? (
        <CCard className="mb-4">
          <CCardBody className="text-center p-5">
            <CSpinner />
            <p className="mt-3">Carregando justificativas...</p>
          </CCardBody>
        </CCard>
      ) : (
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>Justificativas Registradas</CCardTitle>
          </CCardHeader>
          <CCardBody>
            {justifications.length === 0 ? (
              <CAlert color="info">
                Nenhuma justificativa registrada.
              </CAlert>
            ) : (
              <CTable striped responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Funcionário</CTableHeaderCell>
                    <CTableHeaderCell>Estabelecimento</CTableHeaderCell>
                    <CTableHeaderCell>Data</CTableHeaderCell>
                    <CTableHeaderCell>Motivo</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Ações</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {justifications.map((justification) => {
                    const user = users.find(u => u.id === justification.user_id)
                    const store = stores.find(s => s.id === justification.store_id)
                    
                    return (
                      <CTableRow key={justification.id}>
                        <CTableDataCell>{user?.name || 'Desconhecido'}</CTableDataCell>
                        <CTableDataCell>{store?.title || 'Desconhecido'}</CTableDataCell>
                        <CTableDataCell>
                          {new Date(justification.date).toLocaleDateString('pt-BR')}
                        </CTableDataCell>
                        <CTableDataCell>{justification.reason}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(justification.status)}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            {justification.status === 'PENDING' && (
                              <>
                                <CButton 
                                  color="success" 
                                  size="sm"
                                  onClick={() => handleApprove(justification.id)}
                                  disabled={submitting}
                                >
                                  <CIcon icon={cilCheck} />
                                </CButton>
                                
                                <CButton 
                                  color="danger" 
                                  size="sm"
                                  onClick={() => handleReject(justification.id)}
                                  disabled={submitting}
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </>
                            )}
                            
                            <CButton 
                              color="primary" 
                              size="sm"
                              onClick={() => handleEdit(justification)}
                              disabled={submitting}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            
                            <CButton 
                              color="danger" 
                              size="sm"
                              onClick={() => confirmDelete(justification.id)}
                              disabled={submitting}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* Modal de confirmação de exclusão */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirmar Exclusão</CModalTitle>
          <CCloseButton onClick={() => setShowModal(false)} />
        </CModalHeader>
        <CModalBody>
          Tem certeza que deseja excluir esta justificativa? Esta ação não pode ser desfeita.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? (
              <>
                <CSpinner size="sm" className="me-2" /> 
                Excluindo...
              </>
            ) : 'Excluir'}
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