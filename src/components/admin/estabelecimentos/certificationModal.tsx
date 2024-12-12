import { CModal, CModalBody, CModalHeader, CModalTitle, CButton } from '@coreui/react-pro'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

type Props = {
  visible: boolean
  setVisible: (visible: boolean) => void
  certificateId: any
}

import { Cardo } from 'next/font/google'
import { Certifications, Stores } from '@prisma/client'
import { useEffect, useState } from 'react'
import { getCertificate } from '@/app/_actions/stores/getOneCertification'

interface certificationWithStores extends Certifications {
  store: Stores
}

const cardo = Cardo({ subsets: ['latin'], weight: ['400', '700'] })

const CertificateModal = ({ visible, setVisible, certificateId }: Props) => {
  const [certificate, setCertificate] = useState<certificationWithStores | null>(null)

  const handleDownload = async () => {
    const element = document.getElementById('certificate')
    if (element) {
      const canvas = await html2canvas(element)
      const pdf = new jsPDF('l', 'mm', 'a4') // Landscape
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210) // Dimensões A4 em landscape
      pdf.save('certificate.pdf')
    }
  }

  const fetchCertification = async () => {
    if (certificateId) {
      try {
        const certification = await getCertificate(certificateId.id)
        setCertificate(certification || null) // Atualiza o estado ou define como null
      } catch (error) {
        console.error('Erro ao buscar certificado:', error)
        setCertificate(null) // Define como null em caso de erro
      }
    }
  }

  useEffect(() => {
    fetchCertification()
  }, [certificateId]) // Atualiza sempre que certificateId mudar

  return (
    <CModal size="xl" alignment="center" visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader>
        <CModalTitle>Certificado</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {certificate ? (
          <div
            id="certificate"
            style={{
              width: '100%', // Responsivo: ocupa 100% da largura do container
              height: '210mm',
              maxWidth: '297mm', // Limite para telas grandes
              position: 'relative',
              backgroundImage: `url('/images/certificado.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '5%', // Padding proporcional para telas menores
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '35%',
                left: '10%',
                width: '80%',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              <h1
                style={{
                  fontFamily: "'Cardo', serif",
                  fontSize: '20px', // Menor para telas pequenas
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                {certificate.store.title || 'Nome do Estabelecimento'}
              </h1>
              <h2
                style={{
                  fontSize: '16px',
                  color: 'red',
                  marginBottom: '20px',
                }}
              >
                {certificate.HashgachotType || 'Tipo não informado'}
              </h2>
              <p style={{ fontSize: '12px', marginBottom: '10px' }}>
                <b>{certificate.description || 'Descrição em português não disponível'}</b>
              </p>
              <p style={{ fontSize: '12px', marginBottom: '20px' }}>
                {certificate.englishDescription || 'Descrição em inglês não disponível'}
              </p>
              <p style={{ fontSize: '10px', marginBottom: '5px' }}>
                <b>Data de expedição:</b>{' '}
                {certificate.issueDate
                  ? new Date(certificate.issueDate).toLocaleDateString('pt-BR')
                  : 'Data não informada'}
              </p>
              <p style={{ fontSize: '10px', marginBottom: '5px' }}>
                <b>Data de validade:</b>{' '}
                {certificate.validationDate
                  ? new Date(certificate.validationDate).toLocaleDateString('pt-BR')
                  : 'Data não informada'}
              </p>
              <p style={{ fontSize: '10px', marginTop: '20px' }}>
                Obs: {certificate.observation || 'Sem observações adicionais'}
              </p>
            </div>
          </div>
        ) : (
          <p>Carregando certificado...</p>
        )}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <CButton color="primary" onClick={handleDownload}>
            Download Certificado
          </CButton>
        </div>
      </CModalBody>
    </CModal>
  )
}

export default CertificateModal
