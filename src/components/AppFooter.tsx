import React from 'react'

import { CFooter } from '@coreui/react-pro'
import Link from 'next/link'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          Ocupi
        </a>
        <span className="ms-1">&copy; 2024.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a
          href="https://coreui.io/react"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ocupi
        </a>
        <span className="mx-2">|</span>
        <Link href="/privacy" className="text-decoration-none">
          Política de Privacidade
        </Link>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
