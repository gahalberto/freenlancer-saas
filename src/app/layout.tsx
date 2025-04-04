'use client'

import { Provider } from 'react-redux'
import store from './../store'
import './../styles/style.scss'
import './../styles/examples.scss'
import { SessionProvider } from 'next-auth/react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CAlert } from '@coreui/react-pro'
import { SessionProviderCustom } from '@/contexts/sessionContext'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTools, faClock } from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'

// Importação dinâmica do componente com carregamento apenas no cliente
const ClientProblemReportButton = dynamic(
  () => import('@/components/ClientProblemReportButton'),
  { ssr: false }
)

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);

  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>Beit Yaacov - Dep. Cashrut</title>
      </head>
      <body>
        {/* 🔥 Agora o SessionProviderCustom está dentro do SessionProvider */}
        <SessionProvider>
          <SessionProviderCustom>
            <Provider store={store}>
              {children}
              <ClientProblemReportButton />
              <Toaster position="top-right" />
            </Provider>
          </SessionProviderCustom>
        </SessionProvider>
      </body>
    </html>
  )
}