'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import Image from 'next/image'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <CSpinner />
  }

  if (status === 'unauthenticated') {
    return <p>Acesso negado. Por favor, faça login.</p>
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Meu Perfil</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-4 justify-content-center">
          <CCol xs={12} md={4} className="text-center">
            <div className="position-relative" style={{ width: '150px', height: '150px', margin: '0 auto' }}>
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={150}
                  height={150}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ width: '150px', height: '150px' }}
                >
                  <i className="cil-user" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
            </div>
          </CCol>
        </CRow>

        <CRow className="justify-content-center">
          <CCol xs={12} md={8}>
            <div className="mb-3">
              <strong>Nome:</strong>
              <p>{session?.user?.name || 'Não informado'}</p>
            </div>

            <div className="mb-3">
              <strong>Email:</strong>
              <p>{session?.user?.email || 'Não informado'}</p>
            </div>

            <CButton 
              color="primary"
              onClick={() => router.push('/app/profile/edit')}
            >
              Editar Perfil
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
} 