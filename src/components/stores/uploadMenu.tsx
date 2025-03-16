import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react-pro'
import { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilFile } from '@coreui/icons'
import { useRouter } from 'next/navigation'

interface UploadMenuProps {
  storeId: string
  menuUrl: string
  onMenuUploaded?: (newMenuUrl: string) => void
}

const UploadMenu = ({ storeId, menuUrl, onMenuUploaded }: UploadMenuProps) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewFileName, setPreviewFileName] = useState<string | null>(null)
  const [currentMenuUrl, setCurrentMenuUrl] = useState<string>(menuUrl)
  const [isUploading, setIsUploading] = useState(false)

  const router = useRouter()

  // Atualizar o estado local quando a prop menuUrl mudar
  useEffect(() => {
    setCurrentMenuUrl(menuUrl)
  }, [menuUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Não usar preventDefault aqui, pois isso pode interferir com o comportamento normal do input
    const file = event.target.files?.[0] || null
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setPreviewFileName(file.name)
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo PDF válido.')
      setPreviewFileName(null)
    }
  }

  const handleSubmit = async (event: React.MouseEvent) => {
    // Usar MouseEvent em vez de FormEvent para evitar conflitos com o formulário
    event.preventDefault()
    event.stopPropagation()
    
    if (!pdfFile) {
      setError('O arquivo PDF é obrigatório.')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('pdf', pdfFile)
    formData.append('storeId', storeId)

    console.log('Preparando upload do cardápio:')
    console.log('- Arquivo:', pdfFile.name, 'Tamanho:', pdfFile.size, 'Tipo:', pdfFile.type)
    console.log('- ID do estabelecimento:', storeId)

    try {
      console.log('Enviando requisição para o backend...')
      const response = await fetch('/api/uploadMenu', {
        method: 'POST',
        body: formData,
      })

      console.log('Resposta recebida:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('Dados da resposta:', data)

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar o arquivo PDF.')
        console.error('Erro ao enviar o arquivo PDF:', data.error)
      } else {
        console.log('PDF enviado com sucesso!', data)
        
        // Atualizar o estado local com a nova URL do menu
        if (data.menuUrl) {
          console.log('Nova URL do menu:', data.menuUrl)
          setCurrentMenuUrl(data.menuUrl)
          
          // Chamar o callback para atualizar o formulário principal
          if (onMenuUploaded) {
            console.log('Chamando callback onMenuUploaded')
            onMenuUploaded(data.menuUrl)
          }
        }
        
        setPdfFile(null)
        setPreviewFileName(null)
        
        // Mostrar mensagem de sucesso
        alert('Cardápio enviado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error)
      setError('Erro ao enviar o arquivo. Verifique o console para mais detalhes.')
    } finally {
      setIsUploading(false)
    }
  }

  // Extrair o nome do arquivo do URL
  const getFileNameFromUrl = (url: string) => {
    if (!url) return null
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  const currentFileName = getFileNameFromUrl(currentMenuUrl)

  return (
    <div className="mb-4">
      <h5>Cardápio do Estabelecimento</h5>
      <CRow className="mb-3">
        <CCol md={6}>
          <div className="mb-3">
            <strong>Cardápio Atual:</strong>
            {currentMenuUrl ? (
              <div className="d-flex align-items-center mt-2">
                <CIcon icon={cilFile} size="xl" className="me-2" />
                <span>{currentFileName || 'cardapio.pdf'}</span>
                <CButton 
                  color="link" 
                  href={currentMenuUrl} 
                  target="_blank" 
                  className="ms-2"
                >
                  Visualizar
                </CButton>
              </div>
            ) : (
              <p>Nenhum cardápio cadastrado</p>
            )}
          </div>
        </CCol>
        
        <CCol md={6}>
          {previewFileName && (
            <div className="mb-3">
              <strong>Arquivo selecionado:</strong>
              <div className="d-flex align-items-center mt-2">
                <CIcon icon={cilFile} size="xl" className="me-2" />
                <span>{previewFileName}</span>
              </div>
            </div>
          )}
        </CCol>
      </CRow>
      
      <CRow>
        <CCol md={8}>
          <CFormInput
            type="file"
            id="menuFile"
            onChange={handleFileChange}
            accept="application/pdf"
            disabled={isUploading}
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </CCol>
        <CCol md={4}>
          <CButton 
            color="primary" 
            type="button" 
            disabled={isUploading || !pdfFile}
            onClick={handleSubmit}
          >
            {isUploading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <CIcon icon={cilCloudUpload} className="me-2" />
                Enviar Cardápio
              </>
            )}
          </CButton>
        </CCol>
      </CRow>
    </div>
  )
}

export default UploadMenu
