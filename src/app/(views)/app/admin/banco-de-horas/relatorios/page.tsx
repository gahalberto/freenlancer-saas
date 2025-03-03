'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react-pro'
import { cilUser, cilPeople } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const ReportsIndexPage = () => {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Relatórios de Horas Trabalhadas</strong>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <strong>Relatório Individual</strong>
                </CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center">
                  <div className="mb-3">
                    <CIcon icon={cilUser} size="3xl" />
                  </div>
                  <p className="text-center mb-4">
                    Gere um relatório detalhado de horas trabalhadas para um mashguiach específico em um determinado mês.
                  </p>
                  <Link href="/app/admin/banco-de-horas/relatorios/individual" passHref>
                    <CButton color="primary">
                      Acessar Relatório Individual
                    </CButton>
                  </Link>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <strong>Relatório Mensal</strong>
                </CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center">
                  <div className="mb-3">
                    <CIcon icon={cilPeople} size="3xl" />
                  </div>
                  <p className="text-center mb-4">
                    Gere um relatório consolidado de horas trabalhadas por todos os mashguichim em um determinado mês.
                  </p>
                  <Link href="/app/admin/banco-de-horas/relatorios/mensal" passHref>
                    <CButton color="primary">
                      Acessar Relatório Mensal
                    </CButton>
                  </Link>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ReportsIndexPage