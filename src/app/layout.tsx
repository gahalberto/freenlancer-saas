'use client'

import Script from 'next/script'

import { Provider } from 'react-redux'
import store from './../store'
import './../styles/style.scss'
// We use those styles to show code examples, you should remove them in your application.
import './../styles/examples.scss'
import { SessionProvider } from 'next-auth/react'
import { Metadata } from 'next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Beit Yaacov - Dep. Cashrut</title>
        <Script
          id="get-color-scheme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
        const userMode = localStorage.getItem('coreui-pro-next-js-admin-template-theme-default');
        const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (userMode === 'dark' || (userMode !== 'light' && systemDarkMode)) {
          document.documentElement.dataset.coreuiTheme = 'dark';
        }`,
          }}
        />
      </head>
      <body>
        <Provider store={store}>
          <SessionProvider>{children}</SessionProvider>
        </Provider>
      </body>
    </html>
  )
}
