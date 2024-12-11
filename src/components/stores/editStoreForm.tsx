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
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import CIcon from '@coreui/icons-react'
import { cilMap, cilSearch } from '@coreui/icons'
import { editStore } from '@/app/_actions/stores/editStore'

// Zod schema para validação do formulário
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
  mashguiachId: z.string().optional().nullable(),
  storeTypeId: z.string().min(1, { message: 'Selecione o tipo de estabelecimento' }),
})

type FormData = z.infer<typeof storeSchema>

interface EditStoreFormProps {
  storeData: {
    id: string
    title: string
    address_zipcode: string
    address_street: string
    address_number: string
    address_neighbor: string
    address_city: string
    address_state: string
    isAutomated: boolean | null
    isMashguiach: boolean | null
    storeTypeId: string
    mashguiachId?: string | null
  }
}

const EditStoreForm: React.FC<EditStoreFormProps> = ({ storeData }) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      ...storeData,
      isAutomated: storeData.isAutomated ?? false, // Converte null para false
      isMashguiach: storeData.isMashguiach ?? false, // Converte null para false
      mashguiachId: storeData.mashguiachId ?? undefined, // Converte null para undefined
    },
  })

  const [mashguiachim, setMashguiachim] = useState<any[]>([])
  const [storesType, setStoresType] = useState<any[]>([])
  const [zipCode, setZipCode] = useState(storeData.address_zipcode || '')

  const fetchStoresType = async () => {
    try {
      const storesTypes = await getStoresTypes()
      setStoresType(storesTypes)
    } catch (error) {
      console.error('Erro ao buscar tipos de lojas:', error)
    }
  }

  const fetchMashguiachim = async () => {
    try {
      const mashguichim = await getAllMashguichim()
      setMashguiachim(mashguichim)
    } catch (error) {
      console.error('Erro ao buscar mashguiachim:', error)
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

  useEffect(() => {
    fetchMashguiachim()
    fetchStoresType()
  }, [])

  const isMashguiach = watch('isMashguiach')

  const onSubmit = async (formData: FormData) => {
    try {
      // Adapte o valor de mashguiachId para garantir compatibilidade com o tipo esperado
      const updatedFormData = {
        ...formData,
        id: storeData.id,
        mashguiachId: formData.mashguiachId ?? null, // Converte undefined para null
      }

      await editStore(updatedFormData)
      alert('Estabelecimento atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error)
      alert('Erro ao atualizar estabelecimento.')
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Editar Estabelecimento</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <CFormLabel htmlFor="title">
                <b>Nome/Título do Estabelecimento</b>
              </CFormLabel>
              <CFormInput type="text" id="title" {...register('title')} invalid={!!errors.title} />
              {errors.title && <span>{errors.title.message}</span>}
            </div>
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
              Atualizar Estabelecimento
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default EditStoreForm
