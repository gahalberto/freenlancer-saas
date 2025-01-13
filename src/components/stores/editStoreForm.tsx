import React, { useEffect, useState } from 'react'
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
  CRow,
  CCol,
} from '@coreui/react-pro'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import CIcon from '@coreui/icons-react'
import { cilContact, cilMap, cilPhone, cilSearch } from '@coreui/icons'
import UploadStoreLogo from './uploadStoreLogo'
import UploadMenu from './uploadMenu'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getStoresTypes } from '@/app/_actions/stores/getStoresType'
import { editStore } from '@/app/_actions/stores/editStore'

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
  phone: z.string().nullable().default(''),
  comercialPhone: z.string().nullable().default(''),
  mashguiachId: z.string().optional().nullable(),
  storeTypeId: z.string().min(1, { message: 'Selecione o tipo de estabelecimento' }),
  imageUrl: z.string().optional(),
  menuUrl: z.string().optional(),
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
    phone: string | null
    comercialPhone: string | null
    imageUrl: string | null
    menuUrl: string | null
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
      isAutomated: storeData.isAutomated ?? false,
      isMashguiach: storeData.isMashguiach ?? false,
      mashguiachId: storeData.mashguiachId ?? undefined,
      storeTypeId: storeData.storeTypeId ?? '',
      imageUrl: storeData.imageUrl ?? '',
      menuUrl: storeData.menuUrl ?? '',
    },
  })

  const [mashguiachim, setMashguiachim] = useState<any[]>([])
  const [storesType, setStoresType] = useState<any[]>([])
  const [zipCode, setZipCode] = useState(storeData.address_zipcode || '')

  useEffect(() => {
    const fetchData = async () => {
      setMashguiachim(await getAllMashguichim())
      setStoresType(await getStoresTypes())
    }
    fetchData()
  }, [])

  const handleCep = async () => {
    if (zipCode.length >= 8) {
      const response = await fetch(`https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`)
      const cepData = await response.json()
      if (cepData.erro) {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.')
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

  const onSubmit = async (formData: FormData) => {
    try {
      // Adapte os valores opcionais para garantir compatibilidade
      const updatedFormData = {
        ...formData,
        id: storeData.id,
        mashguiachId: formData.mashguiachId ?? null,
        phone: formData.phone || '', // Converte null para string vazia
        comercialPhone: formData.comercialPhone || '', // Converte null para string vazia
        imageUrl: formData.imageUrl || null,
        menuUrl: formData.menuUrl || null,
        storeTypeId: formData.storeTypeId,
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
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="title">Nome/Título do Estabelecimento</CFormLabel>
                <CFormInput id="title" {...register('title')} invalid={!!errors.title} />
                {errors.title && <span className="text-danger">{errors.title.message}</span>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="address_zipcode">CEP</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    id="address_zipcode"
                    {...register('address_zipcode')}
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                  <CButton type="button" onClick={handleCep} color="primary">
                    Buscar
                  </CButton>
                </CInputGroup>
                {errors.address_zipcode && (
                  <span className="text-danger">{errors.address_zipcode.message}</span>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="address_street">Rua</CFormLabel>
                <CFormInput id="address_street" {...register('address_street')} />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="address_number">Número</CFormLabel>
                <CFormInput id="address_number" {...register('address_number')} />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="address_neighbor">Bairro</CFormLabel>
                <CFormInput id="address_neighbor" {...register('address_neighbor')} />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="address_city">Cidade</CFormLabel>
                <CFormInput id="address_city" {...register('address_city')} />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="address_state">Estado</CFormLabel>
                <CFormInput id="address_state" {...register('address_state')} />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="phone">Telefone</CFormLabel>
                <CFormInput id="phone" {...register('phone')} />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="comercialPhone">Telefone Comercial</CFormLabel>
                <CFormInput id="comercialPhone" {...register('comercialPhone')} />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="storeTypeId">Tipo de Estabelecimento</CFormLabel>
                <CFormSelect
                  id="storeTypeId"
                  {...register('storeTypeId')}
                  value={watch('storeTypeId')} // Garante que o valor seja atualizado corretamente
                  onChange={(e) => setValue('storeTypeId', e.target.value)} // Atualiza o valor manualmente
                  invalid={!!errors.storeTypeId}
                >
                  <option value="">Selecione o tipo de estabelecimento</option>
                  {storesType.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.title}
                    </option>
                  ))}
                </CFormSelect>
                {errors.storeTypeId && (
                  <span className="text-danger">{errors.storeTypeId.message}</span>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="mashguiachId">Mashguiach</CFormLabel>
                <CFormSelect
                  id="mashguiachId"
                  value={watch('mashguiachId') || ''} // Garante que null ou undefined sejam transformados em string vazia
                  {...register('mashguiachId')}
                  onChange={(e) => setValue('mashguiachId', e.target.value)} // Atualiza o valor manualmente
                  invalid={!!errors.mashguiachId}
                >
                  <option value="">Selecione</option>
                  {mashguiachim.map((mash) => (
                    <option key={mash.id} value={mash.id}>
                      {mash.name}
                    </option>
                  ))}
                </CFormSelect>
                {errors.mashguiachId && (
                  <span className="text-danger">{errors.mashguiachId.message}</span>
                )}
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-3">
                <UploadStoreLogo storeId={storeData.id} imageUrl={storeData.imageUrl || ''} />
              </CCol>
              <CCol md={6} className="mb-3">
                <UploadMenu storeId={storeData.id} menuUrl={storeData.menuUrl || ''} />
              </CCol>
            </CRow>

            <CButton type="submit" color="primary">
              Atualizar
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>MENU PDF</CCardHeader>
        <CCardBody>
          {storeData?.menuUrl && (
            <iframe
              src={storeData?.menuUrl}
              style={{ width: '100%', height: '600px', border: 'none' }}
              title="Menu PDF"
            ></iframe>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default EditStoreForm
