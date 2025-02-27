'use client'
import { createDemoAccount } from '@/app/_actions/admin/createDemoAccount'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CForm, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Esquema de validação usando Zod
const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Caminho para o campo que está com erro
  })

type RegisterSchema = z.infer<typeof registerSchema>

const CreateDemoAccount = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const [zipCode, setZipCode] = useState('')
  const [addError, setAddError] = useState(false)


  const onSubmit = async (data: RegisterSchema) => {
    try {
      const newAccount = await createDemoAccount(data) // Chama a função de registro
      if(newAccount) reset(); // Redireciona para a página de usuários
      
      alert('Usuário registrado com sucesso!') // Feedback para o usuário
    } catch (error) {
      if (error instanceof Error) {
        // Se for um erro do tipo Error, acesse a mensagem
      } else {
        // Se for outro tipo de erro, exiba uma mensagem genérica
        alert('Ocorreu um erro desconhecido.')
      }
    }
  }

  return (
    <>
      <CForm onSubmit={handleSubmit(onSubmit)}>
        <h3>Cadastrar uma conta demo</h3>
        {errors.name && <span className="text-danger">{errors.name.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilUser} />
          </CInputGroupText>
          <CFormInput placeholder="Nome" autoComplete="username" {...register('name')} />
        </CInputGroup>

        {errors.email && <span className="text-danger">{errors.email.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>@</CInputGroupText>
          <CFormInput placeholder="Email" autoComplete="email" {...register('email')} />
        </CInputGroup>

        {errors.password && <span className="text-danger">{errors.password.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilLockLocked} />
          </CInputGroupText>
          <CFormInput
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            {...register('password')}
          />
        </CInputGroup>

        {errors.confirmPassword && (
          <span className="text-danger">{errors.confirmPassword.message}</span>
        )}

        <CInputGroup className="mb-4">
          <CInputGroupText>
            <CIcon icon={cilLockLocked} />
          </CInputGroupText>
          <CFormInput
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </CInputGroup>

        <div className="d-grid">
          <CButton type="submit" color="primary">
            Criar conta
          </CButton>
        </div>
      </CForm>
    </>
  )
}

export default CreateDemoAccount
