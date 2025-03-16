import {
  CButton,
  CRow,
  CCol,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilFile, cilCloudDownload } from '@coreui/icons'
import { useState, useEffect } from 'react'

interface MenuPdfViewerProps {
  menuUrl: string | null
}

const MenuPdfViewer = ({ menuUrl }: MenuPdfViewerProps) => {
  const [currentMenuUrl, setCurrentMenuUrl] = useState<string | null>(menuUrl)

  // Atualizar o estado local quando a prop menuUrl mudar
  useEffect(() => {
    setCurrentMenuUrl(menuUrl)
  }, [menuUrl])

  if (!currentMenuUrl) {
    return <p>Nenhum cardápio disponível para visualização.</p>
  }

  // Extrair o nome do arquivo do URL
  const getFileNameFromUrl = (url: string) => {
    if (!url) return 'cardapio.pdf'
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  const fileName = getFileNameFromUrl(currentMenuUrl)

  return (
    <div className="mb-4">
      <CRow className="mb-3">
        <CCol>
          <h4>Visualização do Cardápio</h4>
        </CCol>
        <CCol className="text-end">
          <CButton 
            color="primary" 
            href={currentMenuUrl} 
            target="_blank"
            download={fileName}
          >
            <CIcon icon={cilCloudDownload} className="me-2" />
            Download
          </CButton>
        </CCol>
      </CRow>
      <iframe
        src={currentMenuUrl}
        style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
        title="Menu PDF"
      ></iframe>
    </div>
  )
}

export default MenuPdfViewer 