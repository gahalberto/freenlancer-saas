'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cilFastfood, cilLockLocked, cilMap, cilPhone, cilSearch, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react-pro'
import { registerUser, registerUserStore } from '@/app/_actions/register'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getStoresTypes } from '@/app/_actions/stores/getStoresType'

// Esquema de validação usando Zod
const registerStoreSchema = z
  .object({
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    title: z.string().min(1, { message: 'O nome do estabelecimento é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    address_zipcode: z.string().min(1, { message: 'Digite o CEP e clique em buscar' }),
    address_street: z.string().min(1, { message: 'Digite a rua, digite o CEP e clique em buscar' }),
    address_number: z.string().min(1, { message: 'Digite o número do endereço' }),
    address_neighbor: z.string().min(1, { message: 'Digite o bairro' }),
    address_city: z.string().min(1, { message: 'Digite a cidade' }),
    address_state: z.string().min(1, { message: 'Digite o Estado' }),
    phone: z.string().min(14, { message: 'Telefone é obrigatório e deve estar no formato correto' }),
    comercialPhone: z.string().min(14, { message: 'Telefone comercial é obrigatório e deve estar no formato correto' }),
    password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'Confirmação de senha é obrigatória' }),
    storeTypeId: z.string().min(1, { message: 'Selecione o tipo de estabelecimento' }), // Não permitir vazio
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Caminho para o campo que está com erro
  })

type registerStoreSchema = z.infer<typeof registerStoreSchema>

const StoreRegisterForm = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<registerStoreSchema>({
    resolver: zodResolver(registerStoreSchema),
  })

  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [comercialPhone, setComercialPhone] = useState('')
  const [storesType, setStoresType] = useState<any[]>([]) // Estado para armazenar os tipos de estabelecimento
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Função para formatar o CEP
  const formatCEP = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 5) {
      return numericValue
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`
  }

  // Função para formatar o telefone
  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    
    if (numericValue.length <= 2) {
      return `(${numericValue}`
    }
    if (numericValue.length <= 6) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`
    }
    if (numericValue.length <= 10) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6)}`
    }
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value)
    setPhone(formattedPhone)
    setValue('phone', formattedPhone)
  }

  const handleComercialPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value)
    setComercialPhone(formattedPhone)
    setValue('comercialPhone', formattedPhone)
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value)
    setZipCode(formattedCEP)
    setValue('address_zipcode', formattedCEP)
  }

  // Função para buscar tipos de loja
  const fetchStoresType = async () => {
    try {
      const storesTypes = await getStoresTypes()
      setStoresType(storesTypes)
    } catch (error) {
      throw error
    }
  }

  const handleCep = async () => {
    const newCep = zipCode.replace(/\D/g, '')

    if (newCep.length >= 8) {
      const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`)
      const cepData = await response.json()
      if (cepData.erro) {
        setErrorMessage('CEP não encontrado. Verifique o CEP e tente novamente.')
        setZipCode('')
        return
      }
      setValue('address_street', cepData.logradouro || '')
      setValue('address_neighbor', cepData.bairro || '')
      setValue('address_city', cepData.localidade || '')
      setValue('address_state', cepData.uf || '')
    } else {
      setErrorMessage('CEP inválido, digite um CEP válido!')
    }
  }

  const onSubmit = async (data: registerStoreSchema) => {
    try {
      await registerUserStore({ ...data, roleId: '1' }) // Chama a função de registro
      setSuccessMessage('O Usuário e a loja foram criados com sucesso!')
      setErrorMessage(null)
      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        // Se for um erro do tipo Error, acesse a mensagem
        setErrorMessage(error.message)
        setSuccessMessage(null)
      } else {
        // Se for outro tipo de erro, exiba uma mensagem genérica
        setErrorMessage('Ocorreu um erro desconhecido.')
        setSuccessMessage(null)
      }
    }
  }

  useEffect(() => {
    fetchStoresType()
  }, [])

  return (
    <>
      {errorMessage && (
        <CAlert color="danger" dismissible onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </CAlert>
      )}
      
      {successMessage && (
        <CAlert color="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </CAlert>
      )}
      
      <CCard className="shadow-sm border-0 mb-4">
        <CCardBody>
          <h3 className="text-center text-primary font-bold text-xl mb-4">Registre-se como Estabelecimento</h3>
          <p className="text-medium-emphasis text-center mb-4">
            Crie sua conta na plataforma do Dept. de Kashrut da Beit Yaakov.
          </p>

          <CForm onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {errors.name && <span className="text-danger text-sm">{errors.name.message}</span>}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput 
                    placeholder="Nome completo" 
                    autoComplete="username" 
                    {...register('name')} 
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.title && <span className="text-danger text-sm">{errors.title.message}</span>}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilFastfood} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Nome do estabelecimento"
                    autoComplete="title"
                    {...register('title')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>
            </div>

            <div>
              {errors.email && <span className="text-danger text-sm">{errors.email.message}</span>}
              <CInputGroup className="mb-3">
                <CInputGroupText>@</CInputGroupText>
                <CFormInput 
                  placeholder="Email" 
                  autoComplete="email" 
                  {...register('email')} 
                  className="focus:border-primary"
                />
              </CInputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {errors.phone && <span className="text-danger text-sm">{errors.phone.message}</span>}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilPhone} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="(00) 00000-0000"
                    autoComplete="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.comercialPhone && (
                  <span className="text-danger text-sm">{errors.comercialPhone.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilPhone} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="(00) 00000-0000"
                    autoComplete="phone"
                    value={comercialPhone}
                    onChange={handleComercialPhoneChange}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                {errors.address_zipcode && (
                  <span className="text-danger text-sm">{errors.address_zipcode.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="00000-000"
                    autoComplete="address"
                    value={zipCode}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="focus:border-primary"
                  />
                  <CButton type="button" onClick={handleCep} color="primary">
                    <CIcon icon={cilSearch} className="me-1" />
                    Buscar
                  </CButton>
                </CInputGroup>
              </div>

              <div className="md:col-span-2">
                {errors.address_street && (
                  <span className="text-danger text-sm">{errors.address_street.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Rua"
                    autoComplete="address_street"
                    {...register('address_street')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.address_number && (
                  <span className="text-danger text-sm">{errors.address_number.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Número"
                    autoComplete="address"
                    {...register('address_number')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {errors.address_neighbor && (
                  <span className="text-danger text-sm">{errors.address_neighbor.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Bairro"
                    autoComplete="address"
                    {...register('address_neighbor')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.address_city && <span className="text-danger text-sm">{errors.address_city.message}</span>}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Cidade"
                    autoComplete="address"
                    {...register('address_city')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.address_state && (
                  <span className="text-danger text-sm">{errors.address_state.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Estado"
                    autoComplete="address"
                    {...register('address_state')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {errors.password && <span className="text-danger text-sm">{errors.password.message}</span>}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Senha"
                    autoComplete="new-password"
                    {...register('password')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>

              <div>
                {errors.confirmPassword && (
                  <span className="text-danger text-sm">{errors.confirmPassword.message}</span>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="focus:border-primary"
                  />
                </CInputGroup>
              </div>
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="storeTypeId" className="text-sm font-medium">Tipo de Estabelecimento</CFormLabel>
              <CFormSelect 
                id="storeTypeId" 
                {...register('storeTypeId')} 
                invalid={!!errors.storeTypeId}
                className="focus:border-primary"
              >
                <option value="">Selecione o tipo de estabelecimento</option>
                {storesType.map((store) => (
                  <option value={store.id} key={store.id}>
                    {store.title}
                  </option>
                ))}
              </CFormSelect>
              {errors.storeTypeId && <span className="text-danger text-sm">{errors.storeTypeId.message}</span>}
            </div>

            <div className="d-grid mt-4">
              <CButton type="submit" color="primary" className="py-2">
                Criar conta
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default StoreRegisterForm
