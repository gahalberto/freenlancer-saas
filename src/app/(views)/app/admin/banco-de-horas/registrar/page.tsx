'use client'

import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CCol,
  CRow,
  CFormLabel,
  CForm,
  CSpinner,
  CFormSelect,
  CAlert,
  CWidgetStatsF,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react-pro'
import { cilClock } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllStores } from '@/app/_actions/stores/getAllStores'

export default function RegistrarPonto() {
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [registryType, setRegistryType] = useState('entrace')
  const [coords, setCoords] = useState<{ latitude: number | null, longitude: number | null }>({ latitude: null, longitude: null })
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    title: '',
    color: 'success'
  })

  useEffect(() => {
    // Atualiza o relógio a cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Tenta obter a localização atual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
        }
      )
    }

    // Carregar lojas e usuários
    fetchStores()
    fetchUsers()

    return () => clearInterval(timer)
  }, [])

  const fetchStores = async () => {
    try {
      const response = await getAllStores();
      setStores(response)
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível carregar os estabelecimentos.'
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await getAllMashguichim()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível carregar os usuários.'
      })
    }
  }

  const handleRegisterTime = async () => {
    if (!selectedUser || !selectedStore) {
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Selecione um usuário e um estabelecimento.'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/timeEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser,
          store_id: selectedStore,
          entryType: registryType,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao registrar ponto')
      }

      setToast({
        visible: true,
        color: 'success',
        title: 'Sucesso',
        message: 'Ponto registrado com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao registrar ponto:', error)
      setToast({
        visible: true,
        color: 'danger',
        title: 'Erro',
        message: 'Não foi possível registrar o ponto.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Registro de Ponto</h1>
      
      <CRow>
        <CCol md={4}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilClock} height={24} />}
            title="Horário Atual"
            value={currentTime.toLocaleTimeString()}
            color="primary"
          />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Registrar Ponto</CCardTitle>
          <CCardText>Selecione o funcionário e o tipo de registro</CCardText>
        </CCardHeader>
        <CCardBody>
          <CForm>
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
              <CCol>
                <CFormLabel htmlFor="registryType">Tipo de Registro</CFormLabel>
                <CFormSelect
                  id="registryType"
                  value={registryType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegistryType(e.target.value)}
                >
                  <option value="entrace">Entrada</option>
                  <option value="exit">Saída</option>
                  <option value="lunchEntrace">Entrada Almoço</option>
                  <option value="lunchExit">Saída Almoço</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {coords.latitude && coords.longitude ? (
              <CAlert color="success" className="mb-3">
                Localização capturada com sucesso: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </CAlert>
            ) : (
              <CAlert color="warning" className="mb-3">
                Aguardando permissão de localização...
              </CAlert>
            )}

            <CButton 
              color="primary"
              onClick={handleRegisterTime} 
              disabled={loading || !selectedUser || !selectedStore}
              className="w-100"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> 
                  Registrando...
                </>
              ) : (
                'Registrar Ponto'
              )}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

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