'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react-pro'
import { updateProfile } from '@/app/_actions/profile/updateProfile'
import Image from 'next/image'

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: ''
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || ''
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!session?.user?.id) throw new Error('Usuário não encontrado')
      
      await updateProfile(session.user.id, {
        name: formData.name,
        email: formData.email,
        avatar_url: formData.image
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/uploadAvatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, image: data.avatar_url }))
    } catch (err: any) {
      setError('Erro ao fazer upload da imagem')
    }
  }

  if (status === 'loading') {
    return <CSpinner />
  }

  if (status === 'unauthenticated') {
    return <p>Acesso negado. Por favor, faça login.</p>
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Editar Perfil</strong>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
          </CAlert>
        )}
        
        {success && (
          <CAlert color="success" className="mb-3">
            Perfil atualizado com sucesso!
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-4 justify-content-center">
            <CCol xs={12} md={4} className="text-center">
              <div className="position-relative" style={{ width: '150px', height: '150px', margin: '0 auto' }}>
                {formData.image ? (
                  <Image
                    src={formData.image}
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
              <CFormInput
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="mt-3"
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel htmlFor="name">Nome</CFormLabel>
              <CFormInput
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </CCol>

            <CCol md={6} className="mb-3">
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol>
              <CButton 
                type="submit" 
                color="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
} 