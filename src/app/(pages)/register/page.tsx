'use client'

import React from 'react'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilFastfood, cilHouse, cilLockLocked, cilUser } from '@coreui/icons'
import RegisterForm from '@/components/register/RegisterForm'
import Link from 'next/link'

const Register = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <h4 className="text-center mb-4">Você quer se cadastrar como</h4>
                <p className="text-center mb-4">Escolha pelo menos uma opção</p>
                {/* Flexbox com centralização e gap */}
                <div className="d-flex justify-content-center gap-3">
                  <Link href={`register/mashguiach`}>
                    <CButton color="primary">
                      <CIcon icon={cilUser} /> Mashguiach
                    </CButton>
                  </Link>
                  <Link href={`register/estabelecimento`}>
                    <CButton color="primary">
                      <CIcon icon={cilFastfood} /> Estabelecimento
                    </CButton>
                  </Link>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
