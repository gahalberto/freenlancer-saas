'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const roleId = session?.user?.roleId

      if (roleId === 1) {
        router.push('/app/dashboard/mashguiach')
      } else if (roleId === 2) {
        router.push('/app/dashboard/estabelecimento')
      } else if (roleId === 3) {
        router.push('/app/dashboard/admin')
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  return null
}

export default Dashboard
