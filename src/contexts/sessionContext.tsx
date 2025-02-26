import { createContext, useContext, useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type UserSession = {
  id: string
  name: string
  email: string
  asweredQuestions: boolean
  isAdminPreview: boolean
  roleId: number
} | null

const SessionContext = createContext<{
  session: UserSession
  updateRoleId: (roleId: number) => Promise<void>
} | null>(null)

export const useUserSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useUserSession deve ser usado dentro de um SessionProviderCustom")
  }
  return context
}

export const SessionProviderCustom = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<UserSession>(null)
  const { data: authSession, update } = useSession() // 🔥 Usa `useSession()`
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await getSession()
      if (userSession) {
        setSession({
          id: userSession.user.id,
          name: userSession.user.name || "Usuário",
          email: userSession.user.email || "user@mail.com",
          isAdminPreview: userSession.user.isAdminPreview || false,
          asweredQuestions: userSession.user.asweredQuestions || false,
          roleId: userSession.user.roleId,
        })
      }
    }
    fetchSession()
  }, [])

  // 🔥 Atualiza o roleId corretamente na sessão do NextAuth
  const updateRoleId = async (roleId: number) => {
    if (!session) return

    // Atualiza o estado local
    setSession((prevSession) => prevSession ? { ...prevSession, roleId } : null)

    // Atualiza a sessão no NextAuth 🔥
    await update({ roleId }) 

    // Aguarda um curto tempo e força um refresh na página para aplicar mudanças
    setTimeout(() => {
      router.refresh()
    }, 500)
  }

  return (
    <SessionContext.Provider value={{ session, updateRoleId }}>
      {children}
    </SessionContext.Provider>
  )
}
