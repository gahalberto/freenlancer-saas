import ResetPage from './ResetPage'
import React, { Suspense } from 'react'

export default function ResetPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPage />
    </Suspense>
  )
}
