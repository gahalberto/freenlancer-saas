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

  useEffect(() => {
    // Este código só será executado no cliente
    setIsClient(true)
    
    if(session?.roleId !== 3) {
      router.push('/app')
    }
  }, [session, router])

  // Renderiza um placeholder até que o componente seja montado no cliente
  if (!isClient) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <AdminFirstSection />
      <AdminSecondSection />
    </>
  )
}

export default AdminDashboard
