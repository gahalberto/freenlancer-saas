import { 
  CContainer, 
  CRow, 
  CCol, 
  CInputGroup, 
  CFormInput, 
  CButton,
  CNavbar,
  CNavbarBrand,
  CNavbarNav,
  CNavItem,
  CNavLink
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass } from '@coreui/icons'
import { FormEvent } from 'react'
import Image from 'next/image'

interface HomeHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  onSearch?: () => void
}

const HomeHeader = ({ searchTerm, setSearchTerm, onSearch }: HomeHeaderProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch()
    }
  }

  return (
    <>
      {/* Navbar */}
      <CNavbar expand="lg" colorScheme="light" className="bg-white shadow-sm py-2 mb-0">
        <CContainer>
          <CNavbarBrand href="/" className="d-flex align-items-center">
            <Image 
              src="/brand/logobyk.png" 
              alt="Beit Yaacov Logo" 
              width={100} 
              height={50} 
              className="me-2"
            />
            <span className="fw-bold">Beit Yaacov</span>
            <span className="ms-2 text-muted small">Dep. Cashrut</span>
          </CNavbarBrand>
          <CNavbarNav className="ms-auto d-none d-lg-flex">
            <CNavItem>
              <CNavLink href="/" active>
                Início
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="/sobre">Sobre</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="/contato">Contato</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="/login">Login</CNavLink>
            </CNavItem>
          </CNavbarNav>
        </CContainer>
      </CNavbar>

      {/* Hero Section */}
      <div 
        className="header-section text-center py-5" 
        style={{ 
          background: 'linear-gradient(135deg, #0d6efd 0%, #084298 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}
      >
        <CContainer>
          <h1 className="display-4 fw-bold mb-3">Beit Yaacov - Dep. Cashrut</h1>
          <p className="lead mb-4">Encontre estabelecimentos Kosher certificados</p>
          
          {/* Campo de pesquisa */}
          <CRow className="justify-content-center">
            <CCol xs={12} md={8} lg={6}>
              <form onSubmit={handleSubmit}>
                <CInputGroup className="mb-3" size="lg">
                  <CFormInput
                    placeholder="Buscar por nome, cidade ou tipo de estabelecimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="shadow"
                  />
                  <CButton color="light" type="submit" className="shadow">
                    <CIcon icon={cilMagnifyingGlass} />
                  </CButton>
                </CInputGroup>
              </form>
            </CCol>
          </CRow>
        </CContainer>
      </div>

      {/* Estilos CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .header-section {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          
          .header-section h1 {
            font-size: 1.8rem;
          }
          
          .header-section p {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  )
}

export default HomeHeader 