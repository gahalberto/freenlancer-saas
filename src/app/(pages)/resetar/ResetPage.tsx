// ResetPage.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { cilLockLocked } from '@coreui/icons'
import { ResetPassword } from '@/app/_actions/users/reset-password'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'

const recoverySchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type recoverySchema = z.infer<typeof recoverySchema>

export default function ResetPage() {
  const searchParams = useSearchParams()

  const token = searchParams?.get('token')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<recoverySchema>({
    resolver: zodResolver(recoverySchema),
  })

  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: recoverySchema) => {
    if (!token) {
      setMessage('Token não encontrado.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await ResetPassword(token, data.password)

      if (response.success) {
        setMessage('Senha atualizada com sucesso! Redirecionando...')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage(response.message || 'Erro ao atualizar a senha.')
      }
    } catch (err) {
      console.error('Erro durante a redefinição:', err)
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center text-center">
            <CCol md={8}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={handleSubmit(onSubmit)}>
                      <h1>Beit Yaakov</h1>
                      <h3 style={{ marginBottom: 30 }}>Recuperar a senha</h3>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Digite uma nova senha"
                          {...register('password')}
                          autoComplete="new-password"
                          type="password"
                          required
                        />
                      </CInputGroup>
                      {errors.password && (
                        <span className="text-danger">{errors.password.message}</span>
                      )}

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Repita a senha"
                          autoComplete="new-password"
                          type="password"
                          {...register('confirmPassword')}
                          required
                        />
                      </CInputGroup>
                      {errors.confirmPassword && (
                        <span className="text-danger">{errors.confirmPassword.message}</span>
                      )}

                      <CRow>
                        <CCol>
                          <CButton
                            type="submit"
                            color="primary"
                            className="px-4"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Enviando...' : 'Atualizar com a nova senha'}
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
    </div>
  )
}
