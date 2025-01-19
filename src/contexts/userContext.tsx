'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

type UserContextType = {
  userId: string | null
  userName: string | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  userId: null,
  userName: null,
  loading: true,
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession()
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserId(session.user.id)
      setUserName(session.user.name || null)
      setLoading(false)
    } else if (status === 'unauthenticated') {
      setUserId(null)
      setUserName(null)
      setLoading(false)
    }
  }, [session, status])

  return (
    <UserContext.Provider value={{ userId, userName, loading }}>{children}</UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
