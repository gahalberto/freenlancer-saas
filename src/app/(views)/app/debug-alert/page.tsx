'use client'

import { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CCardTitle,
} from '@coreui/react-pro'
import { useSession } from 'next-auth/react'

export default function DebugAlertPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const createTestAlert = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/debug-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      console.log('Resposta do servidor:', data)
      
      if (!response.ok) {
        throw new Error(`Erro ao criar alerta de teste: ${response.status}`)
      }
      
      setResult(data)
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getTestAlert = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/debug-alert')
      const data = await response.json()
      console.log('Resposta do servidor:', data)
      
      if (!response.ok) {
        throw new Error(`Erro ao obter alerta de teste: ${response.status}`)
      }
      
      setResult(data)
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const listUserAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/alerts')
      const data = await response.json()
      console.log('Resposta do servidor (alertas do usuário):', data)
      
      if (!response.ok) {
        throw new Error(`Erro ao listar alertas do usuário: ${response.status}`)
      }
      
      setResult({
        success: true,
        message: 'Alertas do usuário obtidos com sucesso',
        alerts: data,
      })
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle>
              <strong>Depuração de Alertas</strong>
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CButton
                color="primary"
                onClick={createTestAlert}
                disabled={loading}
                className="me-2"
              >
                {loading ? <CSpinner size="sm" className="me-2" /> : null}
                Criar Alerta de Teste
              </CButton>
              
              <CButton
                color="info"
                onClick={getTestAlert}
                disabled={loading}
                className="me-2"
              >
                {loading ? <CSpinner size="sm" className="me-2" /> : null}
                Verificar Alerta de Teste
              </CButton>
              
              <CButton
                color="success"
                onClick={listUserAlerts}
                disabled={loading}
              >
                {loading ? <CSpinner size="sm" className="me-2" /> : null}
                Listar Alertas do Usuário
              </CButton>
            </div>
            
            {error && (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            )}

            <div className="mb-4">
              <h5>Dados da Sessão:</h5>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            {result && (
              <div>
                <h5>Resultado:</h5>
                <pre
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
} 