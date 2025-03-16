'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && !hasRedirected) {
      setHasRedirected(true)
      const roleId = session?.user?.roleId

      if (roleId === 1) {
        router.push('/app/dashboard/mashguiach')
      } else if (roleId === 2) {
        router.push('/app/dashboard/estabelecimento')
      } else if (roleId === 3) {
        router.push('/app/dashboard/admin2')
      }
    }
  }, [session, status, router, hasRedirected])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  return null
}

export default Dashboard
