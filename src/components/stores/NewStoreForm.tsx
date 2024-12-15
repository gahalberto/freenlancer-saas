'use client'

import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react-pro'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getStoresTypes } from '@/app/_actions/stores/getStoresType'
import { createStore } from '@/app/_actions/stores/createStore'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CIcon from '@coreui/icons-react'
import { cilMap, cilPhone, cilSearch } from '@coreui/icons'

// Zod schema para validar o formulário
const storeSchema = z.object({
  title: z.string().min(1, { message: 'Digite um título para o seu estabelecimento' }),
  address_zipcode: z.string().min(1, { message: 'Digite o CEP e clique em buscar' }),
  address_street: z.string().min(1, { message: 'Digite a rua, digite o CEP e clique em buscar' }),
  address_number: z.string().min(1, { message: 'Digite o número do endereço' }),
  address_neighbor: z.string().min(1, { message: 'Digite o bairro' }),
  address_city: z.string().min(1, { message: 'Digite a cidade' }),
  address_state: z.string().min(1, { message: 'Digite o Estado' }),
  isAutomated: z.boolean(),
  isMashguiach: z.boolean(),
  comercialPhone: z.string().optional().nullable(), // Opcional
  phone: z.string().optional().nullable(), // Opcional
  mashguiachId: z.string().optional().nullable(), // Opcional se não for um mashguiach fixo
  storeTypeId: z.string().min(1, { message: 'Selecione o tipo de estabelecimento' }), // Não permitir vazio
})

type FormData = z.infer<typeof storeSchema>

const NewStoreForm = () => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(storeSchema),
  })

  const router = useRouter()

  // Obtém a sessão do NextAuth e o userId
  const { data: session } = useSession()
  const userId = session?.user?.id // Aqui o userId será extraído da sessão

  const [mashguiachim, setMashguiachim] = useState<any[]>([]) // Estado para armazenar os mashguiachim
  const [storesType, setStoresType] = useState<any[]>([]) // Estado para armazenar os tipos de estabelecimento
  const [zipCode, setZipCode] = useState('')
  const [addError, setAddError] = useState(false)

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

  // Função para buscar mashguiachim
  const fetchMashguiachim = async () => {
    try {
      const mashguichim = await getAllMashguichim()
      setMashguiachim(mashguichim)
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchMashguiachim()
    fetchStoresType()
  }, [])

  // Monitora o valor de isMashguiach para mostrar o select condicionalmente
  const isMashguiach = watch('isMashguiach')

  // Função para lidar com o envio do formulário
  const onSubmit = async (formData: FormData) => {
    if (!userId) {
      console.error('Usuário não autenticado.')
      return
    }

    const updatedFormData = {
      title: formData.title,
      address_zipcode: formData.address_zipcode,
      address_street: formData.address_street,
      address_number: formData.address_number,
      address_neighbor: formData.address_neighbor,
      address_city: formData.address_city,
      address_state: formData.address_state,
      comercialPhone: formData.comercialPhone || '', // Se não for fornecido, defina como null
      phone: formData.phone || '', // Se não for fornecido, defina como null
      userId, // Inclua o userId
      isAutomated: formData.isAutomated ?? null, // Se não for fornecido, defina como null
      isMashguiach: formData.isMashguiach ?? null, // Se não for fornecido, defina como null
      mashguiachId: formData.mashguiachId || null, // Trate como null se não fornecido
      storeType: {
        connect: {
          id: formData.storeTypeId, // Conecte o storeType pelo ID
        },
      },
    }

    try {
      await createStore(updatedFormData)
      alert('Estabelecimento criado com sucesso!')
      router.push('/app/stores')
    } catch (error) {
      console.error('Erro ao criar loja:', error)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Novo estabelecimento</strong>
        </CCardHeader>
        <CCardBody>
          <span>
            Cadastre o seus estabelecimentos nesse formulário, se você administra mais de um,
            preencher um por vez.
          </span>

          <CForm onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <CFormLabel htmlFor="title">
                <b>Nome/Titúlo do estabelecimento</b>
              </CFormLabel>
              <CFormInput type="text" id="title" {...register('title')} invalid={!!errors.title} />
              {errors.title && <span>{errors.title.message}</span>}
            </div>

            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilPhone} />
              </CInputGroupText>
              <CFormInput
                placeholder="Telefone Comercial"
                autoComplete="comercialPhone"
                {...register('comercialPhone')}
              />
            </CInputGroup>

            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilPhone} />
              </CInputGroupText>
              <CFormInput
                placeholder="Telefone Pessoal"
                autoComplete="phone"
                {...register('phone')}
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

            {errors.address_city && (
              <span className="text-danger">{errors.address_city.message}</span>
            )}
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

            {/* Checkbox para "O Estabelecimento é automatizado?" */}
            <div className="mb-3 form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isAutomated"
                {...register('isAutomated')}
              />
              <label className="form-check-label" htmlFor="isAutomated">
                O Estabelecimento é automatizado?
              </label>
            </div>

            {/* Checkbox para "O Mashguiach é fixo?" */}
            <div className="mb-3 form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isMashguiach"
                {...register('isMashguiach')}
              />
              <label className="form-check-label" htmlFor="isMashguiach">
                O Mashguiach é fixo?
              </label>
            </div>

            {/* Campo condicional para selecionar o Mashguiach */}
            {isMashguiach && (
              <div className="mb-3">
                <CFormLabel htmlFor="mashguiachId">Mashguiach</CFormLabel>
                <CFormSelect
                  id="mashguiachId"
                  {...register('mashguiachId')}
                  invalid={!!errors.mashguiachId}
                >
                  <option value="">Selecione um Mashguiach</option>
                  {mashguiachim.map((mashguiach) => (
                    <option key={mashguiach.id} value={mashguiach.id}>
                      {mashguiach.name}
                    </option>
                  ))}
                </CFormSelect>
                {errors.mashguiachId && <span>{errors.mashguiachId.message}</span>}
              </div>
            )}

            <div className="mb-3">
              <CFormLabel htmlFor="storeTypeId">Tipo de Estabelecimento</CFormLabel>
              <CFormSelect
                id="storeTypeId"
                {...register('storeTypeId')}
                invalid={!!errors.storeTypeId}
              >
                <option value="">Selecione o tipo de estabelecimento</option>
                {storesType.map((store) => (
                  <option value={store.id} key={store.id}>
                    {store.title}
                  </option>
                ))}
              </CFormSelect>
              {errors.storeTypeId && <span>{errors.storeTypeId.message}</span>}
            </div>

            <CButton type="submit" color="primary">
              Criar Estabelecimento
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default NewStoreForm
