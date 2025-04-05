'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && !hasRedirected) {
      setHasRedirected(true)
      const roleId = session?.user?.roleId
      const redirectToFinancial = searchParams?.get('financial') === 'true'

      if (roleId === 1) {
        router.push('/app/dashboard/mashguiach')
      } else if (roleId === 2) {
        router.push('/app/dashboard/estabelecimento')
      } else if (roleId === 3 || roleId === 4) {
        if (redirectToFinancial) {
          router.push('/app/dashboard/financeiro')
        } else {
          router.push('/app/dashboard/admin2')
        }
      }
    }
  }, [session, status, router, hasRedirected, searchParams])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  return null
}

export default Dashboard
