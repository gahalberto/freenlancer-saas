import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CCardImage,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react-pro'
import { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload } from '@coreui/icons'
import { useRouter } from 'next/navigation'

interface UploadStoreLogoProps {
  storeId: string
  imageUrl: string
  onImageUploaded?: (newImageUrl: string) => void
}

const UploadStoreLogo = ({ storeId, imageUrl, onImageUploaded }: UploadStoreLogoProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  // Atualizar o estado local quando a prop imageUrl mudar
  useEffect(() => {
    setCurrentImageUrl(imageUrl)
  }, [imageUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Não usar preventDefault aqui, pois isso pode interferir com o comportamento normal do input
    const file = event.target.files?.[0] || null
    if (file) {
      setImageFile(file)
      setError(null)
      
      // Criar URL para preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    } else {
      setError('Por favor, selecione um arquivo válido.')
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (event: React.MouseEvent) => {
    // Usar MouseEvent em vez de FormEvent para evitar conflitos com o formulário
    event.preventDefault()
    event.stopPropagation()
    
    if (!imageFile) {
      setError('A imagem é obrigatória.')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('storeId', storeId)

    try {
      console.log('Enviando requisição para o backend...')
      const response = await fetch('/api/uploadLogo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Resposta não está OK:', response.status)
        setError(data.error || 'Erro ao enviar a imagem.')
        console.error('Erro ao enviar a imagem:', data.error)
      } else {
        console.log('Imagem enviada com sucesso!', data)
        
        // Atualizar o estado local com a nova URL da imagem
        if (data.imageUrl) {
          setCurrentImageUrl(data.imageUrl)
          
          // Chamar o callback para atualizar o formulário principal
          if (onImageUploaded) {
            onImageUploaded(data.imageUrl)
          }
        }
        
        setImageFile(null)
        setPreviewUrl(null)
        
        // Mostrar mensagem de sucesso
        alert('Logo enviado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error)
      setError('Erro ao enviar a imagem. Verifique o console para mais detalhes.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mb-4">
      <h5>Logo do Estabelecimento</h5>
      <CRow className="mb-3">
        <CCol md={6}>
          <div className="mb-3">
            <strong>Logo Atual:</strong>
            {currentImageUrl ? (
              <CCardImage src={currentImageUrl} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', display: 'block', marginTop: '10px' }} />
            ) : (
              <p>Nenhum logo cadastrado</p>
            )}
          </div>
        </CCol>
        
        <CCol md={6}>
          {previewUrl && (
            <div className="mb-3">
              <strong>Preview:</strong>
              <CCardImage src={previewUrl} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', display: 'block', marginTop: '10px' }} />
            </div>
          )}
        </CCol>
      </CRow>
      
      <CRow>
        <CCol md={8}>
          <CFormInput
            type="file"
            id="logoFile"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </CCol>
        <CCol md={4}>
          <CButton 
            color="primary" 
            type="button" 
            disabled={isUploading || !imageFile}
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
                Enviar Logo
              </>
            )}
          </CButton>
        </CCol>
      </CRow>
    </div>
  )
}

export default UploadStoreLogo
