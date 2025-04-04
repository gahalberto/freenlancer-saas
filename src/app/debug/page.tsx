'use client'

import React from 'react'
import AppSidebarDebug from '@/components/AppSidebarDebug'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react-pro'

const DebugPage = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Depuração do Sistema</strong>
          </CCardHeader>
          <CCardBody>
            <AppSidebarDebug />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DebugPage 