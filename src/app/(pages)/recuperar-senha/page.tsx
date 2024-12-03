'use client'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const ForgotSchema = z.object({
  email: z.string().email('Digite um e-mail válido').nonempty('Digite o seu e-mail'),
})

type LoginFormValues = z.infer<typeof ForgotSchema>

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(ForgotSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || 'Erro ao enviar o e-mail de recuperação')
      } else {
        alert('E-mail de recuperação enviado com sucesso!')
      }
    } catch (err) {
      setError('Algo deu errado. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center text-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit(onSubmit)}>
                    <h1>Problemas para entrar na sua conta?</h1>
                    <h6 style={{ marginBottom: 30 }}>
                      Digite o seu e-mail e enviaremos um link para você recuperar a sua senha.
                    </h6>

                    {error && (
                      <div className="text-danger mb-3">
                        <span>{error}</span>
                      </div>
                    )}
                    {errors.email && (
                      <div className="text-danger mb-3">
                        <span>{errors.email.message}</span>
                      </div>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Digite o seu e-mail"
                        autoComplete="username"
                        {...register('email')}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol>
                        <CButton
                          type="submit"
                          color="primary"
                          className="px-4"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
