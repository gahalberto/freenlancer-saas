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
} from '@coreui/react-pro'
import { useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload } from '@coreui/icons'
import { v4 as uuidv4 } from 'uuid'

interface ModalCreateModulesProps {
  storeId: string
  menuUrl: string
}

export const UploadMenu = ({ storeId, menuUrl }: ModalCreateModulesProps) => {
  const [visible, setVisible] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file && file.type === 'application/pdf') {
      const uniqueName = `${uuidv4()}-${file.name}`
      const renamedFile = new File([file], uniqueName, { type: file.type })
      setPdfFile(renamedFile)
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo PDF válido.')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!pdfFile) {
      setError('O arquivo PDF é obrigatório.')
      return
    }

    const formData = new FormData()
    formData.append('menuFile', pdfFile)
    formData.append('storeId', storeId)

    try {
      console.log('Enviando requisição para o backend...')
      const response = await fetch('/api/uploadMenu', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao enviar o arquivo PDF.')
      } else {
        console.log('PDF enviado com sucesso!')
        setVisible(false)
        setPdfFile(null)
      }
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error)
      setError('Erro ao enviar o arquivo.')
    }
  }

  return (
    <>
      <CButton color="dark" onClick={() => setVisible(!visible)}>
        <CIcon icon={cilCloudUpload} className="me-2" />
        Upload de Cardápio (PDF)
      </CButton>

      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Upload de Cardápio</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            {menuUrl ? (
              <>
                <CFormLabel htmlFor="menuFile" className="mt-3">
                  Cardápio atual:
                </CFormLabel>
                <p>
                  <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                    Ver cardápio atual
                  </a>
                </p>
              </>
            ) : (
              <>
                <CFormLabel htmlFor="menuFile" className="mt-3">
                  Esse estabelecimento ainda não possui um cardápio.
                </CFormLabel>
              </>
            )}
            <CFormInput
              id="menuFile"
              type="file"
              accept="application/pdf"
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

export default UploadMenu
