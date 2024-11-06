'use client'

import { AppAside, AppSidebar, AppFooter, AppHeader } from '@/components'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light dark:bg-transparent">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          {children}
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </>
  )
}
