'use client'
import { AddAddressToEvent } from '@/app/_actions/events/addAddressToEvent'
import { cilMap, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Schema de validação Zod
const schema = z.object({
  address_zipcode: z.string().min(1, { message: 'Digite o CEP e clique em buscar' }),
  address_street: z.string().min(1, { message: 'Digite a rua, digite o CEP e clique em buscar' }),
  address_number: z.string().min(1, { message: 'Digite o número do endereço' }),
  address_neighbor: z.string().min(1, { message: 'Digite o bairro' }),
  address_city: z.string().min(1, { message: 'Digite a cidade' }),
  address_state: z.string().min(1, { message: 'Digite o Estado' }),
  workType: z.enum(['PRODUCAO', 'EVENTO'], {
    errorMap: () => ({ message: 'Selecione se o serviço é produção ou evento' }),
  }),
})

type FormData = z.infer<typeof schema>

type Props = {
  storeEventId: string
  onAddressAdded: () => void
}

const AddAddressModal = ({ storeEventId, onAddressAdded }: Props) => {
  const [visible, setVisible] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleCepSearch = async () => {
    const cep = getValues('address_zipcode').replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (data.erro) throw new Error('CEP não encontrado.')
        setValue('address_street', data.logradouro || '')
        setValue('address_neighbor', data.bairro || '')
        setValue('address_city', data.localidade || '')
        setValue('address_state', data.uf || '')
      } catch {
        alert('CEP não encontrado. Verifique o CEP e tente novamente.')
      }
    } else {
      alert('CEP inválido, digite um CEP válido!')
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formattedData = {
        ...data,
        storeEventId: storeEventId, // Substitua pelo ID real do evento
        address_zipcode: data.address_zipcode, // Renomeie o campo
      }

      await AddAddressToEvent(formattedData)
      alert('Endereço adicionado com sucesso!')
      onAddressAdded()
      setVisible(false)
    } catch (error) {
      console.error(error)
      alert('Ocorreu um erro ao adicionar o endereço.')
    }
  })

  return (
    <>
      <CButton size="sm" color="primary" onClick={() => setVisible(true)}>
        Adicionar Endereço
      </CButton>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        backdrop="static"
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Adicionar Endereço</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <form onSubmit={onSubmit}>
            <CRow className="gy-3">
              <CCol xs={12}>
                <CFormLabel>CEP do Local do Evento:</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Digite o CEP"
                    {...register('address_zipcode')}
                    className={errors.address_zipcode ? 'is-invalid' : ''}
                  />
                  <CButton type="button" color="primary" onClick={handleCepSearch}>
                    <CIcon icon={cilSearch} style={{ marginRight: 6 }} />
                    Buscar
                  </CButton>
                </CInputGroup>
                {errors.address_zipcode && (
                  <div className="text-danger">{errors.address_zipcode.message}</div>
                )}
              </CCol>

              <CCol md={8}>
                <CFormLabel>Rua:</CFormLabel>
                <CFormInput
                  {...register('address_street')}
                  placeholder="Rua"
                  className={errors.address_street ? 'is-invalid' : ''}
                />
                {errors.address_street && (
                  <div className="text-danger">{errors.address_street.message}</div>
                )}
              </CCol>

              <CCol md={4}>
                <CFormLabel>Número:</CFormLabel>
                <CFormInput
                  {...register('address_number')}
                  placeholder="Número"
                  className={errors.address_number ? 'is-invalid' : ''}
                />
                {errors.address_number && (
                  <div className="text-danger">{errors.address_number.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Bairro:</CFormLabel>
                <CFormInput
                  {...register('address_neighbor')}
                  placeholder="Bairro"
                  className={errors.address_neighbor ? 'is-invalid' : ''}
                />
                {errors.address_neighbor && (
                  <div className="text-danger">{errors.address_neighbor.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Cidade:</CFormLabel>
                <CFormInput
                  {...register('address_city')}
                  placeholder="Cidade"
                  className={errors.address_city ? 'is-invalid' : ''}
                />
                {errors.address_city && (
                  <div className="text-danger">{errors.address_city.message}</div>
                )}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Estado:</CFormLabel>
                <CFormInput
                  {...register('address_state')}
                  placeholder="Estado"
                  className={errors.address_state ? 'is-invalid' : ''}
                />
                {errors.address_state && (
                  <div className="text-danger">{errors.address_state.message}</div>
                )}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Tipo de Serviço:</CFormLabel>
                <CFormSelect
                  {...register('workType')}
                  className={errors.workType ? 'is-invalid' : ''}
                >
                  <option value="">Selecione...</option>
                  <option value="PRODUCAO">Produção</option>
                  <option value="EVENTO">Evento</option>
                </CFormSelect>
                {errors.workType && <div className="text-danger">{errors.workType.message}</div>}
              </CCol>
            </CRow>
          </form>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" type="submit" onClick={onSubmit}>
            Salvar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AddAddressModal
