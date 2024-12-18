'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cilFastfood, cilLockLocked, cilMap, cilPhone, cilSearch, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
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
    phone: z.string().min(6, { message: 'Telefone é obrigatório' }),
    comercialPhone: z.string().min(6, { message: 'Telefone é obrigatório' }),
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
  const [storesType, setStoresType] = useState<any[]>([]) // Estado para armazenar os tipos de estabelecimento

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

    if (zipCode.length >= 8) {
      const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`)
      const cepData = await response.json()
      if (cepData.erro) {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.')
        setZipCode('')
        return
      }
      setValue('address_street', cepData.logradouro || '')
      setValue('address_neighbor', cepData.bairro || '')
      setValue('address_city', cepData.localidade || '')
      setValue('address_state', cepData.uf || '')
    } else {
      alert('CEP inválido, digite um CEP válido!')
    }
  }

  const onSubmit = async (data: registerStoreSchema) => {
    try {
      await registerUserStore({ ...data, roleId: '1' }) // Chama a função de registro
      alert('O Usuário e a loja foram criados com sucesso!') // Feedback para o usuário
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        // Se for um erro do tipo Error, acesse a mensagem
      } else {
        // Se for outro tipo de erro, exiba uma mensagem genérica
        alert('Ocorreu um erro desconhecido.')
      }
    }
  }

  useEffect(() => {
    fetchStoresType()
  }, [])

  return (
    <>
      <CForm onSubmit={handleSubmit(onSubmit)}>
        <h3>Registre-se como Estabelecimento</h3>
        <p className="text-medium-emphasis">
          Crie sua conta na plataforma do Dept. de Kashrut da Beit Yaakov.
        </p>

        {errors.name && <span className="text-danger">{errors.name.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilUser} />
          </CInputGroupText>
          <CFormInput placeholder="Digite seu nome" autoComplete="username" {...register('name')} />
        </CInputGroup>

        {errors.title && <span className="text-danger">{errors.title.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilFastfood} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite nome do estabelecimento"
            autoComplete="title"
            {...register('title')}
          />
        </CInputGroup>

        {errors.email && <span className="text-danger">{errors.email.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>@</CInputGroupText>
          <CFormInput placeholder="Email" autoComplete="email" {...register('email')} />
        </CInputGroup>

        {errors.phone && <span className="text-danger">{errors.phone.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilPhone} />
          </CInputGroupText>
          <CFormInput placeholder="Telefone" autoComplete="phone" {...register('phone')} />
        </CInputGroup>

        {errors.comercialPhone && (
          <span className="text-danger">{errors.comercialPhone.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilPhone} />
          </CInputGroupText>
          <CFormInput
            placeholder="Telefone Comercial"
            autoComplete="phone"
            {...register('comercialPhone')}
          />
        </CInputGroup>

        {errors.address_zipcode && (
          <span className="text-danger">{errors.address_zipcode.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite o seu cep!"
            autoComplete="address"
            {...register('address_zipcode')}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
          <CButton type="button" onClick={handleCep} color="primary">
            <CIcon icon={cilSearch} style={{ marginRight: 6 }} />
            Buscar
          </CButton>
        </CInputGroup>

        {errors.address_street && (
          <span className="text-danger">{errors.address_street.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Rua"
            autoComplete="address_street"
            {...register('address_street')}
          />
        </CInputGroup>

        {errors.address_number && (
          <span className="text-danger">{errors.address_number.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite o número"
            autoComplete="address"
            {...register('address_number')}
          />
        </CInputGroup>

        {errors.address_neighbor && (
          <span className="text-danger">{errors.address_neighbor.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite o Bairro"
            autoComplete="address"
            {...register('address_neighbor')}
          />
        </CInputGroup>

        {errors.address_city && <span className="text-danger">{errors.address_city.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite o Cidade"
            autoComplete="address"
            {...register('address_city')}
          />
        </CInputGroup>

        {errors.address_state && (
          <span className="text-danger">{errors.address_state.message}</span>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilMap} />
          </CInputGroupText>
          <CFormInput
            placeholder="Digite o Estado"
            autoComplete="address"
            {...register('address_state')}
          />
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

        <div className="mb-3">
          <CFormLabel htmlFor="storeTypeId">Tipo de Estabelecimento</CFormLabel>
          <CFormSelect id="storeTypeId" {...register('storeTypeId')} invalid={!!errors.storeTypeId}>
            <option value="">Selecione o tipo de estabelecimento</option>
            {storesType.map((store) => (
              <option value={store.id} key={store.id}>
                {store.title}
              </option>
            ))}
          </CFormSelect>
          {errors.storeTypeId && <span>{errors.storeTypeId.message}</span>}
        </div>

        <div className="d-grid">
          <CButton type="submit" color="primary">
            Criar conta
          </CButton>
        </div>
      </CForm>
    </>
  )
}

export default StoreRegisterForm
