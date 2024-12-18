import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CCardImage,
} from '@coreui/react-pro'
import { useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCloudUpload } from '@coreui/icons'
import { v4 as uuidv4 } from 'uuid'

interface ModalCreateModulesProps {
  storeId: string
  imageUrl: string
}

export const UploadStoreLogo = ({ storeId, imageUrl }: ModalCreateModulesProps) => {
  const [visible, setVisible] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const uniqueName = `${uuidv4()}-${file.name}`
      const renamedFile = new File([file], uniqueName, { type: file.type })
      setImageFile(renamedFile)
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo válido.')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!imageFile) {
      setError('A imagem é obrigatória.')
      return
    }

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('storeId', storeId)

    try {
      console.log('Enviando requisição para o backend...') // Log de depuração
      const response = await fetch('/api/uploadLogo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        console.error('Resposta não está OK:', response.status) // Log de depuração
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao enviar a imagem.')
        console.error('Erro ao enviar a imagem:', errorData.error)
      } else {
        console.log('Imagem enviada com sucesso!')
        setVisible(false)
        setImageFile(null)
      }
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error) // Log de depuração
      setError('Erro ao enviar a imagem.')
    }
  }
  return (
    <>
      <CButton color="dark" onClick={() => setVisible(!visible)}>
        <CIcon icon={cilCloudUpload} className="me-2" />
        Logo do estabelecimento .png
      </CButton>

      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Logo do estabelecimento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            {imageUrl ? (
              <>
                <CFormLabel htmlFor="image" className="mt-3">
                  Logo atual:{' '}
                </CFormLabel>
                <CCardImage orientation="top" src={`${imageUrl}`} />
              </>
            ) : (
              <>
                <CFormLabel htmlFor="image" className="mt-3">
                  Esse estabelecimento ainda não tem uma logo{' '}
                </CFormLabel>
              </>
            )}
            <CFormInput
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              invalid={!!error}
            />
            {error && <p className="text-danger">{error}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Fechar
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Salvar mudanças
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UploadStoreLogo
