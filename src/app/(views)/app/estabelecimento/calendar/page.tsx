'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import EstablishmentCalendar from '@/components/estabelecimento/EstablishmentCalendar'
import { CAlert, CRow, CCol, CSpinner } from '@coreui/react-pro'

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado e tem o papel correto (roleId = 2)
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.roleId !== 2) {
      router.push('/app') // Redirecionar para o dashboard apropriado
      return
    }
  }, [session, status, router])

  // Exibir spinner enquanto carrega
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // Exibir mensagem se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <CAlert color="danger">
        Você precisa estar autenticado para acessar esta página.
      </CAlert>
    )
  }

  // Exibir mensagem se não tiver o papel correto
  if (session?.user?.roleId !== 2) {
    return (
      <CAlert color="warning">
        Você não tem permissão para acessar esta página. Esta página é específica para estabelecimentos.
      </CAlert>
    )
  }

  return (
    <CRow>
      <CCol>
        <h3 className="mb-4">Calendário de Eventos</h3>
        <p className="text-muted mb-4">
          Visualize e gerencie todos os seus eventos em um só lugar. Os eventos pendentes de aprovação estão marcados em amarelo.
        </p>
        <EstablishmentCalendar />
      </CCol>
    </CRow>
  )
} 