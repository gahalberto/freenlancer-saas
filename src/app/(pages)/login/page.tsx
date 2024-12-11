'use client'

import Link from 'next/link'
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
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Metadata } from 'next'

const loginSchema = z.object({
  email: z.string().nonempty('Digite o seu e-mail'),
  password: z.string().nonempty('Digite a sua senha'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Evita redirecionamento automático
      })

      if (result?.error) {
        setError(result.error) // Mostra a mensagem de erro no frontend
      } else {
        router.push('/app') // Redireciona para a página protegida após o login bem-sucedido
      }
    } catch (error) {
      setError('Erro ao tentar fazer login.')
      console.error('Error logging in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <title>Beit Yaacov - Login</title>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit(onSubmit)}>
                    <h1>Beit Yaakov</h1>
                    <h3>Dept. de Kashrut</h3>
                    <p className="text-medium-emphasis">Entre na sua conta ou registre-se!</p>

                    {/* Exibe a mensagem de erro se existir */}
                    {error && (
                      <div className="text-danger mb-10">
                        {error && <span className="text-danger">E-mail e/ou senha inválidos!</span>}
                      </div>
                    )}
                    {errors.email && (
                      <div className="">
                        <span className="text-danger">{errors.email.message}</span>
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
                    {errors.password && (
                      <span className="text-danger">{errors.password.message}</span>
                    )}

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Digite a sua senha"
                        autoComplete="current-password"
                        {...register('password')}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          type="submit"
                          color="primary"
                          className="px-4"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link href="/recuperar-senha">
                          <CButton color="link" className="px-0">
                            Esqueceu a senha?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5">
                <CCardBody className="text-center">
                  <div>
                    <h2>Registre-se</h2>
                    <p>
                      Se você ainda não é cadastrado como Mashguiach ou Estabelecimento, você deve
                      se registrar na nossa plataforma! Clique abaixo em registre-se!
                    </p>
                    <Link href="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Registre-se!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
