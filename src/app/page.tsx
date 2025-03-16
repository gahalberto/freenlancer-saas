'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllStores } from './_actions/stores/getAllStores'
import { searchStores } from './_actions/stores/searchStores'
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCarousel,
  CCarouselItem
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStore } from '@fortawesome/free-solid-svg-icons'
import HomeHeader from '@/components/HomeHeader'
import StoreCard from '@/components/StoreCard'
import HomeFooter from '@/components/HomeFooter'

interface Store {
  id: string
  title: string
  address_city: string
  address_state: string
  address_street: string
  address_number: string
  address_neighbor: string
  phone: string
  comercialPhone: string
  imageUrl: string | null
  menuUrl: string | null
  storeType: {
    title: string
  }
  Certifications: any[]
}

const HomePage = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await getAllStores()
        setStores(storesData as any)
        setFilteredStores(storesData as any)
        
        // Verificar se há um parâmetro de pesquisa na URL
        const searchFromUrl = searchParams?.get('search')
        if (searchFromUrl) {
          setSearchTerm(searchFromUrl)
          const results = await searchStores(searchFromUrl)
          setFilteredStores(results as any)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error)
        setLoading(false)
      }
    }

    fetchStores()
  }, [searchParams])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredStores(stores)
      return
    }

    setLoading(true)
    try {
      const results = await searchStores(searchTerm)
      setFilteredStores(results as any)
      
      // Atualizar a URL com o termo de pesquisa
      const url = new URL(window.location.href)
      url.searchParams.set('search', searchTerm)
      window.history.pushState({}, '', url)
    } catch (error) {
      console.error('Erro ao pesquisar estabelecimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar lojas em grupos de 3 para o carrossel
  const storeGroups = []
  for (let i = 0; i < filteredStores.length; i += 3) {
    storeGroups.push(filteredStores.slice(i, i + 3))
  }

  const handleStoreClick = (storeId: string) => {
    router.push(`/store/${storeId}`)
  }

  return (
    <div className="home-page">
      {/* Header */}
      <HomeHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onSearch={handleSearch}
      />

      {/* Conteúdo principal */}
      <CContainer className="mb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando estabelecimentos...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-5">
            <FontAwesomeIcon icon={faStore} size="3x" className="text-muted mb-3" />
            <h3>Nenhum estabelecimento encontrado</h3>
            <p>Tente uma nova pesquisa ou verifique mais tarde.</p>
          </div>
        ) : (
          <>
            <h2 className="mb-4 border-bottom pb-2">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Estabelecimentos'}
            </h2>
            
            {/* Carrossel de cards */}
            {storeGroups.length > 1 && (
              <CCarousel controls indicators dark className="mb-4">
                {storeGroups.map((group, groupIndex) => (
                  <CCarouselItem key={groupIndex}>
                    <CRow>
                      {group.map((store) => (
                        <CCol xs={12} md={4} key={store.id} className="mb-4">
                          <StoreCard store={store} onClick={handleStoreClick} />
                        </CCol>
                      ))}
                    </CRow>
                  </CCarouselItem>
                ))}
              </CCarousel>
            )}
            
            {/* Lista de cards para visualização em grid */}
            <CRow className="mt-5">
              {filteredStores.map((store) => (
                <CCol xs={12} sm={6} lg={4} key={store.id} className="mb-4">
                  <StoreCard store={store} onClick={handleStoreClick} />
                </CCol>
              ))}
            </CRow>
          </>
        )}
      </CContainer>

      {/* Footer */}
      <HomeFooter />

      {/* Estilos CSS */}
      <style jsx global>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  )
}

export default HomePage
