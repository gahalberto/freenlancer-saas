'use client'

import React from 'react'
import { CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react-pro'
import RegisterForm from '@/components/register/RegisterForm'

const MashguiachRegisterPage = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <RegisterForm />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default MashguiachRegisterPage
