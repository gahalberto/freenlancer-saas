'use client'

import { AppAside, AppSidebar, AppFooter, AppHeader } from '@/components'
import { CContainer } from '@coreui/react-pro'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CContainer lg className="px-4">{children}</CContainer>
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </>
  )
}
