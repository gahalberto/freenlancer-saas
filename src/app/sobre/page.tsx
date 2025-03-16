'use client'

import { useState } from 'react'
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody,
  CCardImage
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faAward, faHandshake, faUtensils } from '@fortawesome/free-solid-svg-icons'
import HomeHeader from '@/components/HomeHeader'
import HomeFooter from '@/components/HomeFooter'
import Image from 'next/image'

const SobrePage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <div className="sobre-page">
      <HomeHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onSearch={handleSearch}
      />

      <CContainer className="py-5">
        {/* Seção de Introdução */}
        <CRow className="mb-5">
          <CCol lg={12} className="mb-4">
            <h1 className="border-bottom pb-2 mb-4">Sobre o Departamento de Cashrut</h1>
            <p className="lead">
              O Departamento de Cashrut da Congregação Beit Yaacov é responsável pela certificação e supervisão de estabelecimentos Kosher, garantindo que sigam as leis dietéticas judaicas.
            </p>
          </CCol>
        </CRow>

        {/* Seção Nossa História */}
        <CRow className="mb-5 align-items-center">
          <CCol lg={6} className="mb-4 mb-lg-0">
            <h2 className="mb-4">Nossa História</h2>
            <p>
              Fundado em 1985, o Departamento de Cashrut da Congregação Beit Yaacov tem sido uma referência na certificação Kosher no Brasil. Ao longo de mais de três décadas, temos trabalhado incansavelmente para garantir que a comunidade judaica tenha acesso a alimentos que atendam aos requisitos da lei judaica.
            </p>
            <p>
              Nossa jornada começou com a certificação de alguns poucos estabelecimentos locais e cresceu para abranger restaurantes, mercados, indústrias alimentícias e eventos em todo o país. Hoje, somos reconhecidos pela excelência e rigor em nossos processos de certificação.
            </p>
            <p>
              Nosso compromisso com a tradição, a autenticidade e a qualidade nos permitiu construir uma relação de confiança com a comunidade judaica e com os estabelecimentos que certificamos.
            </p>
          </CCol>
          <CCol lg={6}>
            <div className="text-center">
              <Image 
                src="/brand/logobyk.png" 
                alt="Beit Yaacov Logo" 
                width={300} 
                height={150} 
                className="img-fluid"
              />
            </div>
          </CCol>
        </CRow>

        {/* Seção Nossa Missão */}
        <CRow className="mb-5">
          <CCol lg={12}>
            <CCard className="border-0 shadow">
              <CCardBody className="p-5">
                <h2 className="text-center mb-5">Nossa Missão</h2>
                <CRow>
                  <CCol md={6} lg={3} className="mb-4 mb-lg-0">
                    <div className="text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faCheck} size="3x" className="text-primary" />
                      </div>
                      <h4>Garantir Qualidade</h4>
                      <p>Assegurar que todos os produtos e estabelecimentos certificados atendam aos mais altos padrões de qualidade Kosher.</p>
                    </div>
                  </CCol>
                  <CCol md={6} lg={3} className="mb-4 mb-lg-0">
                    <div className="text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faAward} size="3x" className="text-primary" />
                      </div>
                      <h4>Promover Confiança</h4>
                      <p>Construir e manter a confiança da comunidade através de processos de certificação transparentes e rigorosos.</p>
                    </div>
                  </CCol>
                  <CCol md={6} lg={3} className="mb-4 mb-lg-0">
                    <div className="text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faHandshake} size="3x" className="text-primary" />
                      </div>
                      <h4>Apoiar Estabelecimentos</h4>
                      <p>Oferecer suporte e orientação aos estabelecimentos para que possam atender às exigências da lei judaica.</p>
                    </div>
                  </CCol>
                  <CCol md={6} lg={3}>
                    <div className="text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faUtensils} size="3x" className="text-primary" />
                      </div>
                      <h4>Educar a Comunidade</h4>
                      <p>Promover a educação sobre as leis dietéticas judaicas e a importância da alimentação Kosher.</p>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Seção Processo de Certificação */}
        <CRow className="mb-5">
          <CCol lg={12}>
            <h2 className="mb-4">Processo de Certificação</h2>
            <p>
              Nosso processo de certificação é rigoroso e detalhado, garantindo que todos os estabelecimentos certificados atendam aos requisitos da lei judaica. Conheça as etapas do nosso processo:
            </p>
          </CCol>
          <CCol lg={12}>
            <CCard className="border-0 shadow mb-4">
              <CCardBody>
                <h4>1. Solicitação</h4>
                <p>
                  O estabelecimento interessado entra em contato conosco e preenche um formulário detalhado sobre seus produtos, processos e instalações.
                </p>
              </CCardBody>
            </CCard>
            <CCard className="border-0 shadow mb-4">
              <CCardBody>
                <h4>2. Avaliação Inicial</h4>
                <p>
                  Nossa equipe realiza uma visita ao estabelecimento para avaliar as instalações, processos e ingredientes utilizados.
                </p>
              </CCardBody>
            </CCard>
            <CCard className="border-0 shadow mb-4">
              <CCardBody>
                <h4>3. Adaptações</h4>
                <p>
                  Se necessário, orientamos o estabelecimento sobre as adaptações necessárias para atender aos requisitos Kosher.
                </p>
              </CCardBody>
            </CCard>
            <CCard className="border-0 shadow mb-4">
              <CCardBody>
                <h4>4. Supervisão</h4>
                <p>
                  Após as adaptações, iniciamos o processo de supervisão regular, com visitas periódicas de nossos Mashguiachim (supervisores).
                </p>
              </CCardBody>
            </CCard>
            <CCard className="border-0 shadow">
              <CCardBody>
                <h4>5. Certificação</h4>
                <p>
                  Após a aprovação, o estabelecimento recebe o certificado Kosher e passa a fazer parte do nosso diretório de estabelecimentos certificados.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Seção Equipe */}
        <CRow>
          <CCol lg={12} className="mb-4">
            <h2 className="mb-4">Nossa Equipe</h2>
            <p>
              Nossa equipe é composta por rabinos e especialistas em leis dietéticas judaicas, com ampla experiência em certificação Kosher. Todos os nossos Mashguiachim (supervisores) são treinados e capacitados para garantir o cumprimento rigoroso das leis de Cashrut.
            </p>
          </CCol>
          <CCol md={4} className="mb-4">
            <CCard className="border-0 shadow h-100">
              <CCardImage orientation="top" src="/images/placeholder-person.jpg" style={{ height: '250px', objectFit: 'cover' }} />
              <CCardBody className="text-center">
                <h4>Rabino David Cohen</h4>
                <p className="text-muted">Diretor do Departamento de Cashrut</p>
                <p>
                  Com mais de 30 anos de experiência em certificação Kosher, o Rabino Cohen lidera nossa equipe com sabedoria e dedicação.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4} className="mb-4">
            <CCard className="border-0 shadow h-100">
              <CCardImage orientation="top" src="/images/placeholder-person.jpg" style={{ height: '250px', objectFit: 'cover' }} />
              <CCardBody className="text-center">
                <h4>Rabino Moshe Levy</h4>
                <p className="text-muted">Supervisor Chefe</p>
                <p>
                  Especialista em processos industriais, o Rabino Levy coordena nossa equipe de supervisores e garante a qualidade de nossas certificações.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4} className="mb-4">
            <CCard className="border-0 shadow h-100">
              <CCardImage orientation="top" src="/images/placeholder-person.jpg" style={{ height: '250px', objectFit: 'cover' }} />
              <CCardBody className="text-center">
                <h4>Sarah Goldstein</h4>
                <p className="text-muted">Coordenadora Administrativa</p>
                <p>
                  Responsável pelo contato com os estabelecimentos e pela organização de nossos processos administrativos.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      <HomeFooter />
    </div>
  )
}

export default SobrePage 