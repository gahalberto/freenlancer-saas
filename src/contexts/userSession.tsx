import { createContext, useContext, useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'

// Criando o contexto
const UserIdContext = createContext<string | null>(null)

// Hook para usar o contexto
export const useUserId = () => {
  return useContext(UserIdContext)
}

type UserSession = {
    id: string
    name: string
    email: string
    asweredQuestions: boolean
}

// Componente de provedor
export const UserIdProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null)
console.log(userId)
  useEffect(() => {
    const fetchUserId = async () => {
      const session = await getSession()
      if (session) {
        setUserId(session.user.id)
      }
    }
    fetchUserId()
  }, [])

  return <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
}
