'use client'

import { AppAside, AppSidebar, AppFooter, AppHeader } from '@/components'
import { CContainer } from '@coreui/react-pro'
import dynamic from 'next/dynamic'

// Carregamento dinâmico do componente - sem renderização no servidor
const ProblemButtonComponent = dynamic(
  () => import('@/components/SimpleProblemButton'),
  { ssr: false }
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CContainer lg className="px-4">
            {children}
          </CContainer>
        </div>
        <AppFooter />
      </div>
      <AppAside />
      {/* Componente de botão de problema carregado apenas no cliente */}
      <div id="problem-button-container">
        <ProblemButtonComponent />
      </div>
    </>
  )
}
