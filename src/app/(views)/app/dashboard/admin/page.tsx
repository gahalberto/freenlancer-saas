'use client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdminFirstSection from '@/components/dashboard/AdminFirstSection'
import AdminSecondSection from '@/components/dashboard/AdminSecondSection'

const AdminDashboard = () => {
  // const router = useRouter()
  // const { data: session, status } = useSession()

  // if (session?.user.roleId !== 3) {
  //   router.push('/')
  //   return 'Carregando...'
  // }

  return (
    <>
      <AdminFirstSection />
      <AdminSecondSection />
    </>
  )
}

export default AdminDashboard
