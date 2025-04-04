'use client'

import { useState, useEffect } from 'react'
import { CAlert, CButton, CSpinner } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type AlertProps = {
  id: string
  title: string
  message: string
  type: string
  link?: string | null
}

export default function DashboardAlert() {
  const [visible, setVisible] = useState(true)
  const [alerts, setAlerts] = useState<AlertProps[]>([])
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  console.log('DashboardAlert - Sessão do usuário:', session?.user)

  // Buscar alertas da API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('DashboardAlert - Buscando alertas...')
        
        const response = await fetch('/api/alerts')
        console.log('DashboardAlert - Status da resposta:', response.status)
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar alertas: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('DashboardAlert - Alertas recebidos:', data)
        
        setAlerts(data)
      } catch (error) {
        console.error('Erro ao buscar alertas:', error)
        setError(error instanceof Error ? error.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchAlerts()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const handleDismiss = () => {
    console.log('DashboardAlert - Fechando alerta temporariamente')
    setVisible(false)
    
    // Verificar se há mais alertas
    setTimeout(() => {
      if (currentAlertIndex < alerts.length - 1) {
        setCurrentAlertIndex(currentAlertIndex + 1)
        setVisible(true)
      }
    }, 300)
  }

  const handleMarkAsRead = async () => {
    if (alerts.length > 0 && currentAlertIndex < alerts.length) {
      const alertId = alerts[currentAlertIndex].id
      console.log('DashboardAlert - Marcando alerta como lido:', alertId)
      
      try {
        // Marcar o alerta como lido na API
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ alertId }),
        })
        
        console.log('DashboardAlert - Status ao marcar como lido:', response.status)
        
        if (!response.ok) {
          throw new Error(`Erro ao marcar alerta como lido: ${response.status}`)
        }
        
        // Remover o alerta atual da lista
        setVisible(false)
        
        // Verificar se há mais alertas
        setTimeout(() => {
          if (currentAlertIndex < alerts.length - 1) {
            setCurrentAlertIndex(currentAlertIndex + 1)
            setVisible(true)
          }
        }, 300)
      } catch (error) {
        console.error('Erro ao marcar alerta como lido:', error)
      }
    }
  }

  const handleNavigate = (url?: string | null) => {
    if (url) {
      console.log('DashboardAlert - Navegando para:', url)
      router.push(url)
    }
  }

  // Para fins de depuração, vamos mostrar informações mesmo se não houver alertas
  if (loading) {
    return (
      <CAlert color="info" className="d-flex align-items-center mb-4 mt-2">
        <CSpinner size="sm" className="me-2" />
        <div>Carregando alertas...</div>
      </CAlert>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" className="d-flex align-items-center mb-4 mt-2">
        <div>Erro ao carregar alertas: {error}</div>
      </CAlert>
    )
  }

  if (alerts.length === 0) {
    console.log('DashboardAlert - Nenhum alerta disponível')
    return null
  }

  if (currentAlertIndex >= alerts.length || !visible) {
    return null
  }

  const currentAlert = alerts[currentAlertIndex]
  const alertColor = currentAlert.type.toLowerCase() as any

  return (
    <CAlert 
      color={alertColor}
      className="d-flex align-items-center mb-4 mt-2"
      dismissible
      onClose={handleDismiss}
    >
      <div className="d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <strong>{currentAlert.title}</strong>
        </div>
        <div className="mt-2">{currentAlert.message}</div>
        <div className="mt-2 d-flex gap-2">
          {currentAlert.link && (
            <CButton 
              color={alertColor} 
              variant="outline"
              size="sm" 
              onClick={() => handleNavigate(currentAlert.link)}
            >
              Ver Mais
            </CButton>
          )}
          <CButton 
            color={alertColor} 
            variant="ghost"
            size="sm" 
            onClick={handleMarkAsRead}
          >
            Marcar como lido
          </CButton>
        </div>
      </div>
    </CAlert>
  )
} 