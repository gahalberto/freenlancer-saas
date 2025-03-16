'use client'
import AdminFirstSection from '@/components/dashboard/AdminFirstSection'
import AdminSecondSection from '@/components/dashboard/AdminSecondSection'
import { useUserSession } from '@/contexts/sessionContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const AdminDashboard = () => {
  const { session } = useUserSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [hasCheckedRole, setHasCheckedRole] = useState(false)

  useEffect(() => {
    // Este código só será executado no cliente
    setIsClient(true)
    
    // Verificar o papel do usuário apenas uma vez
    if (!hasCheckedRole && session) {
      setHasCheckedRole(true)
      if (session.roleId !== 3) {
        router.push('/')
      }
    }
  }, [session, router, hasCheckedRole])

  // Renderiza um placeholder até que o componente seja montado no cliente
  if (!isClient) {
    return <div>Carregando...</div>
  }

  // Se o usuário não for admin, não renderize o conteúdo
  if (session?.roleId !== 3) {
    return <div>Redirecionando...</div>
  }

  return (
    <>
      <AdminFirstSection />
      <AdminSecondSection />
    </>
  )
}

export default AdminDashboard
