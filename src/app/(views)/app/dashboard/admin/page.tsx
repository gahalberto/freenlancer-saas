'use client'
import AdminFirstSection from '@/components/dashboard/AdminFirstSection'
import AdminSecondSection from '@/components/dashboard/AdminSecondSection'
import { useUserSession } from '@/contexts/sessionContext'
import { useRouter } from 'next/navigation'

const AdminDashboard = () => {
  const { session } = useUserSession()

  const router = useRouter()

  if(session?.roleId !== 3) {
    router.push('/app')
  }
  return (
    <>
      <AdminFirstSection />
      <AdminSecondSection />
    </>
  )
}

export default AdminDashboard
