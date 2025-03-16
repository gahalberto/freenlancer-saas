'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CCard, 
  CCardBody, 
  CCardImage, 
  CCardTitle, 
  CContainer, 
  CRow, 
  CCol, 
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CBadge
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilPhone, cilArrowLeft, cilEnvelopeClosed, cilLink } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils, faCertificate, faCalendarAlt, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons'
import { db } from '@/app/_lib/prisma'
import HomeHeader from '@/components/HomeHeader'
import HomeFooter from '@/components/HomeFooter'

interface StoreDetails {
  id: string
  title: string
  address_city: string
  address_state: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_zipcode: string
  phone: string
  comercialPhone: string
  imageUrl: string | null
  menuUrl: string | null
  storeType: {
    title: string
  }
  Certifications: {
    id: string
    description: string
    observation: string | null
    kasherLePessach: boolean
    HashgachotType: string
    issueDate: string
    validationDate: string
  }[]
}

export default function StoreDetailsPage({ params }: { params: { id: string } }) {
  const [store, setStore] = useState<StoreDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await fetch(`/api/stores/${params.id}`)
        if (!response.ok) {
          throw new Error('Estabelecimento não encontrado')
        }
        const data = await response.json()
        setStore(data)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar detalhes do estabelecimento:', error)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStoreDetails()
    }
  }, [params.id])

  const handleGoBack = () => {
    router.back()
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  if (loading) {
    return (
      <div className="store-details-page">
        <HomeHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
        <CContainer className="py-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando detalhes do estabelecimento...</p>
          </div>
        </CContainer>
        <HomeFooter />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="store-details-page">
        <HomeHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
        <CContainer className="py-5">
          <div className="text-center py-5">
            <h3>Estabelecimento não encontrado</h3>
            <p>O estabelecimento solicitado não existe ou foi removido.</p>
            <CButton color="primary" onClick={handleGoBack}>
              <CIcon icon={cilArrowLeft} className="me-2" />
              Voltar
            </CButton>
          </div>
        </CContainer>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="store-details-page">
      {/* Header */}
      <HomeHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />

      {/* Conteúdo principal */}
      <CContainer className="py-4">
        {/* Botão voltar */}
        <CButton 
          color="link" 
          className="mb-4 ps-0 text-decoration-none" 
          onClick={handleGoBack}
        >
          <CIcon icon={cilArrowLeft} className="me-2" />
          Voltar para estabelecimentos
        </CButton>

        {/* Cabeçalho do estabelecimento */}
        <CCard className="mb-4 border-0 shadow">
          <CRow className="g-0">
            <CCol md={4}>
              <CCardImage 
                src={store.imageUrl || '/images/default-store.jpg'} 
                className="h-100 w-100"
                style={{ objectFit: 'cover', maxHeight: '300px' }}
              />
            </CCol>
            <CCol md={8}>
              <CCardBody className="d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <CCardTitle>{store.title}</CCardTitle>
                  {store.Certifications && store.Certifications.length > 0 && (
                    <CBadge color="success" shape="rounded-pill" className="px-3 py-2">
                      <FontAwesomeIcon icon={faCertificate} className="me-2" />
                      Certificado Kosher
                    </CBadge>
                  )}
                </div>
                
                <div className="mb-3 text-muted">
                  <FontAwesomeIcon icon={faUtensils} className="me-2" />
                  {store.storeType?.title || 'Estabelecimento'}
                </div>
                
                <div className="mb-2">
                  <CIcon icon={cilLocationPin} className="me-2 text-primary" />
                  {store.address_street}, {store.address_number} - {store.address_neighbor}, {store.address_city}/{store.address_state}
                </div>
                
                {store.phone && (
                  <div className="mb-2">
                    <CIcon icon={cilPhone} className="me-2 text-primary" />
                    {store.phone}
                  </div>
                )}
                
                {store.comercialPhone && (
                  <div className="mb-2">
                    <CIcon icon={cilEnvelopeClosed} className="me-2 text-primary" />
                    {store.comercialPhone}
                  </div>
                )}
                
                {store.menuUrl && (
                  <div className="mb-2">
                    <CIcon icon={cilLink} className="me-2 text-primary" />
                    <a href={store.menuUrl} target="_blank" rel="noopener noreferrer">
                      Ver cardápio
                    </a>
                  </div>
                )}
                
                <div className="mt-auto">
                  {store.menuUrl && (
                    <CButton color="primary" className="me-2" href={store.menuUrl} target="_blank">
                      Ver cardápio
                    </CButton>
                  )}
                  <CButton 
                    color="secondary"
                    href={`https://maps.google.com/?q=${store.address_street},${store.address_number},${store.address_city},${store.address_state}`} 
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={faMapMarkedAlt} className="me-2" />
                    Ver no mapa
                  </CButton>
                </div>
              </CCardBody>
            </CCol>
          </CRow>
        </CCard>

        {/* Abas de informações */}
        <CCard className="border-0 shadow">
          <CCardBody>
            <CNav variant="tabs" role="tablist">
              <CNavItem>
                <CNavLink
                  active={activeKey === 1}
                  onClick={() => setActiveKey(1)}
                >
                  Certificações
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeKey === 2}
                  onClick={() => setActiveKey(2)}
                >
                  Informações
                </CNavLink>
              </CNavItem>
            </CNav>
            <CTabContent className="py-4">
              <CTabPane role="tabpanel" visible={activeKey === 1}>
                {store.Certifications && store.Certifications.length > 0 ? (
                  <CRow>
                    {store.Certifications.map((cert) => (
                      <CCol md={6} key={cert.id} className="mb-4">
                        <CCard className="h-100 border-0 shadow-sm">
                          <CCardBody>
                            <div className="d-flex align-items-center mb-3">
                              <FontAwesomeIcon icon={faCertificate} className="text-success me-2" size="lg" />
                              <h5 className="mb-0">Certificação Kosher</h5>
                            </div>
                            <p><strong>Tipo:</strong> {cert.HashgachotType}</p>
                            <p><strong>Descrição:</strong> {cert.description}</p>
                            {cert.observation && (
                              <p><strong>Observação:</strong> {cert.observation}</p>
                            )}
                            <p>
                              <strong>Kasher Le Pessach:</strong> {cert.kasherLePessach ? 'Sim' : 'Não'}
                            </p>
                            <div className="d-flex justify-content-between mt-3">
                              <div>
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                                <small className="text-muted">
                                  Emitido em: {new Date(cert.issueDate).toLocaleDateString('pt-BR')}
                                </small>
                              </div>
                              <div>
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                                <small className="text-muted">
                                  Válido até: {new Date(cert.validationDate).toLocaleDateString('pt-BR')}
                                </small>
                              </div>
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                ) : (
                  <div className="text-center py-4">
                    <p>Este estabelecimento ainda não possui certificações registradas.</p>
                  </div>
                )}
              </CTabPane>
              <CTabPane role="tabpanel" visible={activeKey === 2}>
                <CRow>
                  <CCol md={6}>
                    <h5 className="mb-3">Endereço Completo</h5>
                    <p><strong>Rua:</strong> {store.address_street}</p>
                    <p><strong>Número:</strong> {store.address_number}</p>
                    <p><strong>Bairro:</strong> {store.address_neighbor}</p>
                    <p><strong>Cidade:</strong> {store.address_city}</p>
                    <p><strong>Estado:</strong> {store.address_state}</p>
                    <p><strong>CEP:</strong> {store.address_zipcode}</p>
                  </CCol>
                  <CCol md={6}>
                    <h5 className="mb-3">Contato</h5>
                    <p><strong>Telefone:</strong> {store.phone || 'Não informado'}</p>
                    <p><strong>Telefone Comercial:</strong> {store.comercialPhone || 'Não informado'}</p>
                    
                    <h5 className="mb-3 mt-4">Categoria</h5>
                    <p><strong>Tipo de Estabelecimento:</strong> {store.storeType?.title || 'Não categorizado'}</p>
                  </CCol>
                </CRow>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CContainer>

      {/* Footer */}
      <HomeFooter />
    </div>
  )
} 