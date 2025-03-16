import { 
  CContainer, 
  CRow, 
  CCol, 
  CFooter
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import Image from 'next/image'

const HomeFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <CFooter className="bg-dark text-white py-5">
      <CContainer>
        <CRow>
          <CCol md={4} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <Image 
                src="/brand/logobyk.png" 
                alt="Beit Yaacov Logo" 
                width={100} 
                height={100} 
                className="me-2"
              />
              <h5 className="mb-0">Beit Yaacov - Dep. Cashrut</h5>
            </div>
            <p className="mb-3">
              Encontre estabelecimentos Kosher certificados pelo departamento de Cashrut da Beit Yaacov e confiáveis para sua alimentação.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="#" className="text-white">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="#" className="text-white">
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </a>
            </div>
          </CCol>
          
          <CCol md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Links Úteis</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-white text-decoration-none">Início</a>
              </li>
              <li className="mb-2">
                <a href="/sobre" className="text-white text-decoration-none">Sobre</a>
              </li>
              <li className="mb-2">
                <a href="/contato" className="text-white text-decoration-none">Contato</a>
              </li>
              <li className="mb-2">
                <a href="/app/login" className="text-white text-decoration-none">Login</a>
              </li>
            </ul>
          </CCol>
          
          <CCol md={4}>
            <h5 className="mb-3">Contato</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                São Paulo, SP - Brasil
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                (11) 1234-5678
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                contato@beityaacov.org.br
              </li>
            </ul>
          </CCol>
        </CRow>
        
        <hr className="my-4" />
        
        <div className="text-center">
          <p className="mb-0">
            &copy; {currentYear} Beit Yaacov - Dep. Cashrut. Todos os direitos reservados.
          </p>
        </div>
      </CContainer>
    </CFooter>
  )
}

export default HomeFooter 