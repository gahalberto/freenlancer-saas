import { addCertification } from '@/app/_actions/stores/addCertification'
import { cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCloseButton,
  CDatePicker,
  CForm,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from '@coreui/react-pro'
import { useState } from 'react'

// Enum para tipos de certificado
const TypeEnum = {
  CHALAVI: 'Chalavi',
  BASSARI: 'Bassari',
  PARVE: 'Parve',
} as const

type TypeEnum = keyof typeof TypeEnum

// Props do componente
type Props = {
  selectedStore: string
  visible: boolean
  setVisible: (visible: boolean) => void
  onCertificationAdded: () => void // Callback para notificar o sucesso
}

const CertificationForm = ({ selectedStore, visible, setVisible, onCertificationAdded }: Props) => {
  const [portugueseDescription, setPortugueseDescription] = useState(
    'Certificamos que este estabelecimento está sob a rigorosa supervisão do Departamento de Kashrut Beit Yaacov, o estabelecimento cumpre com as normas e determinações exigidas.',
  )
  const [englishDescription, setEnglishDescription] = useState(
    'We certify that this establishment is under the strict supervision of the Department of Kashrut Beit Yaacov, the establishment complies with the required standards and determinations.',
  )
  const [selectType, setSelectType] = useState<TypeEnum>()
  const [observations, setObservations] = useState('')
  const [kasherLePessach, setKasherLePessach] = useState(false)
  const [expeditionDate, setExpeditionDate] = useState<Date | null>(null)
  const [validityDate, setValidityDate] = useState<Date | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!expeditionDate || !validityDate) {
      alert('As datas de expedição e validade são obrigatórias!')
      return
    }

    if (!selectType) {
      alert('O tipo de certificado é obrigatório!')
      return
    }

    const certificationData = {
      storeId: selectedStore,
      description: portugueseDescription,
      englishDescription,
      observation: observations,
      kasherLePessach,
      issueDate: expeditionDate.toISOString(),
      validationDate: validityDate.toISOString(),
      type: selectType,
    }

    try {
      await addCertification(certificationData) // Envia os dados para a API
      alert('Certificado adicionado com sucesso!')
      setVisible(false)
      onCertificationAdded() // Notifica o sucesso
    } catch (error) {
      console.error('Erro ao adicionar certificado:', error)
      alert('Erro ao adicionar certificado.')
    }
  }

  return (
    <>
      <COffcanvas placement="start" visible={visible} onHide={() => setVisible(false)}>
        <COffcanvasHeader>
          <COffcanvasTitle>
            <CIcon icon={cilPlus} /> ADD CERTIFICADO
          </COffcanvasTitle>
          <CCloseButton className="text-reset" onClick={() => setVisible(false)} />
        </COffcanvasHeader>
        <COffcanvasBody>
          <CForm onSubmit={handleSubmit}>
            <CFormTextarea
              label="Descrição em português"
              placeholder="Descrição"
              onChange={(e) => setPortugueseDescription(e.target.value)}
              value={portugueseDescription}
              style={{ height: '200px' }}
            />

            <CFormTextarea
              className="mt-3"
              label="Descrição em Inglês"
              placeholder="Descrição"
              onChange={(e) => setEnglishDescription(e.target.value)}
              value={englishDescription}
              style={{ height: '200px' }}
            />

            <CFormInput
              className="mt-3"
              type="text"
              placeholder="Observações"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />

            <CFormCheck
              className="mt-3"
              label="Kasher LePessach?"
              checked={kasherLePessach}
              onChange={(e) => setKasherLePessach(e.target.checked)}
            />

            <CFormSelect
              className="mt-3"
              aria-label="Selecione o tipo"
              options={Object.keys(TypeEnum).map((key) => ({
                value: key,
                label: TypeEnum[key as TypeEnum],
              }))}
              value={selectType || ''}
              onChange={(e) => setSelectType(e.target.value as TypeEnum)}
            />

            <div className="row mt-3">
              <div className="col-sm-6">
                <CDatePicker
                  label="Expedição"
                  placeholder="Expedição de"
                  locale="pt-BR"
                  onDateChange={(date) => setExpeditionDate(date ? new Date(date) : null)}
                />
              </div>
              <div className="col-sm-6">
                <CDatePicker
                  label="Validade"
                  locale="pt-BR"
                  placeholder="Valido até"
                  onDateChange={(date) => setValidityDate(date ? new Date(date) : null)}
                />
              </div>
            </div>
            <CButton className="mt-3 w-100" size="lg" color="primary" type="submit">
              ADICIONAR NOVO CERTIFICADO
            </CButton>
          </CForm>
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

export default CertificationForm
