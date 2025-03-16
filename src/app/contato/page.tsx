'use client'

import { useState } from 'react'
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CButton,
  CAlert,
  CSpinner
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faMapMarkerAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import HomeHeader from '@/components/HomeHeader'
import HomeFooter from '@/components/HomeFooter'

const ContatoPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  })
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchTerm)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.mensagem) {
      setErro('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    setEnviando(true)
    setErro('')
    
    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }
      
      // Limpar o formulário e mostrar mensagem de sucesso
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      })
      setEnviado(true)
      
      // Esconder a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setEnviado(false)
      }, 5000)
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      setErro(error instanceof Error ? error.message : 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="contato-page">
      <HomeHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onSearch={handleSearch}
      />

      <CContainer className="py-5">
        <CRow>
          <CCol lg={12} className="mb-4">
            <h1 className="border-bottom pb-2 mb-4">Entre em Contato</h1>
            <p className="lead">
              Estamos à disposição para responder suas dúvidas, receber sugestões ou ajudar com informações sobre certificações Kosher.
            </p>
          </CCol>
        </CRow>

        <CRow className="mb-5">
          <CCol lg={6} className="mb-4 mb-lg-0">
            <CCard className="border-0 shadow h-100">
              <CCardBody>
                <h3 className="mb-4">Envie uma Mensagem</h3>
                
                {enviado && (
                  <CAlert color="success" dismissible>
                    Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.
                  </CAlert>
                )}
                
                {erro && (
                  <CAlert color="danger" dismissible onClose={() => setErro('')}>
                    {erro}
                  </CAlert>
                )}
                
                <CForm onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="nome">Nome *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      disabled={enviando}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <CFormLabel htmlFor="email">Email *</CFormLabel>
                    <CFormInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={enviando}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <CFormLabel htmlFor="telefone">Telefone</CFormLabel>
                    <CFormInput
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      disabled={enviando}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <CFormLabel htmlFor="assunto">Assunto</CFormLabel>
                    <CFormInput
                      type="text"
                      id="assunto"
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      disabled={enviando}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <CFormLabel htmlFor="mensagem">Mensagem *</CFormLabel>
                    <CFormTextarea
                      id="mensagem"
                      name="mensagem"
                      rows={5}
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                      disabled={enviando}
                    />
                  </div>
                  
                  <CButton type="submit" color="primary" disabled={enviando}>
                    {enviando ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
          
          <CCol lg={6}>
            <CCard className="border-0 shadow h-100">
              <CCardBody>
                <h3 className="mb-4">Informações de Contato</h3>
                
                <div className="mb-4">
                  <h5 className="mb-3">Departamento de Cashrut</h5>
                  <p>
                    O Departamento de Cashrut da Congregação Beit Yaacov é responsável pela certificação Kosher de estabelecimentos, garantindo que sigam as leis dietéticas judaicas.
                  </p>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Endereço</h5>
                  <p className="d-flex align-items-start mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-3 mt-1 text-primary" />
                    <span>
                      Rua Exemplo, 123<br />
                      Bairro Exemplo<br />
                      São Paulo, SP - CEP 01234-567<br />
                      Brasil
                    </span>
                  </p>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Contato</h5>
                  <p className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faPhone} className="me-3 text-primary" />
                    (11) 1234-5678
                  </p>
                  <p className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="me-3 text-primary" />
                    contato@beityaacov.org.br
                  </p>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Horário de Atendimento</h5>
                  <p>
                    Segunda a Quinta: 9h às 18h<br />
                    Sexta: 9h às 15h<br />
                    Sábado e Domingo: Fechado
                  </p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        
        <CRow>
          <CCol lg={12}>
            <CCard className="border-0 shadow">
              <CCardBody>
                <h3 className="mb-4">Nossa Localização</h3>
                <div className="map-container" style={{ height: '400px', width: '100%' }}>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0976701966534!2d-46.6565884!3d-23.5646162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1647887291102!5m2!1spt-BR!2sbr" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      <HomeFooter />
    </div>
  )
}

export default ContatoPage 