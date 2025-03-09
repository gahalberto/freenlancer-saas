'use client'

import StoreItem from '@/components/estabelecimentoItem'
import HomeNavBar from '@/components/navBar'
import { CButton, CFormInput } from '@coreui/react-pro'
import { Stores } from '@prisma/client'
import { useEffect, useState } from 'react'
import { getAllStores } from './_actions/stores/getAllStores'

const Home = () => {
  const [stores, setStores] = useState<Stores[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos no cliente
    setIsClient(true)
    
    const fetchStores = async () => {
      try {
        const response = await getAllStores()
        console.log('Estabelecimentos retornados:', response)
        setStores(response || [])
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error)
      }
    }

    fetchStores()
  }, [])

  // Filtrar estabelecimentos com base no termo de pesquisa
  const filteredStores = stores.filter((store) =>
    store.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Renderizar um placeholder até que o componente seja montado no cliente
  if (!isClient) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <title>Beit Yaacov - Departamento de Kashrut</title>
      <HomeNavBar />

      {/* Header Section */}
      <div
        style={{
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          paddingTop: '40px',
          paddingBlockEnd: '60px',
        }}
        className="w-screen"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/kosher.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            zIndex: -1,
          }}
        ></div>
        <h2
          style={{
            fontFamily: 'revert',
            fontWeight: 'bold',
            color: '#1e384c',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Descubra e promova a alimentação Kosher com facilidade
        </h2>
        <div
          style={{
            paddingTop: '20px',
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CButton color="secondary">Solicitar Certificação Kosher</CButton>
          <CButton style={{ backgroundColor: '#1e384c', color: '#FFFFFF' }}>
            Buscar Estabelecimentos
          </CButton>
        </div>
      </div>

      {/* Search Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: '#1e384c',
        }}
      >
        <p
          style={{
            fontFamily: 'revert',
            color: '#FFFFFF',
            opacity: '0.8',
            fontSize: '16px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Encontre estabelecimentos certificados pelo Departamento de Kashrut da Congregação Beit
          Yaacov
        </p>
        <CFormInput
          style={{
            maxWidth: '400px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
          type="text"
          placeholder="Digite o nome do restaurante ou mercado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Store Listing Section */}
      <div
        style={{
          backgroundColor: '#F9F9F9',
          width: '100%',
          padding: '20px 40px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            justifyItems: 'center',
          }}
        >
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => <StoreItem key={store.id} store={store} />)
          ) : (
            <p style={{ color: '#1e384c', fontSize: '18px', fontWeight: 'bold' }}>
              Nenhum estabelecimento encontrado.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
