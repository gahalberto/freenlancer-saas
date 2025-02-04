'use client'

import Script from 'next/script'

import { Provider } from 'react-redux'
import store from './../store'
import './../styles/style.scss'
// We use those styles to show code examples, you should remove them in your application.
import './../styles/examples.scss'
import { SessionProvider } from 'next-auth/react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>Beit Yaacov - Dep. Cashrut</title>
      </head>
      <body>
        <Provider store={store}>
          <SessionProvider>{children}</SessionProvider>
        </Provider>
      </body>
    </html>
  )
}
