'use client'

import StoreItem from '@/components/estabelecimentoItem'
import HomeNavBar from '@/components/navBar'
import { CFormInput } from '@coreui/react-pro'
import { Stores } from '@prisma/client'
import { useEffect, useState } from 'react'
import { getAllStores } from './_actions/stores/getAllStores'

const Home = () => {
  const [stores, setStores] = useState<Stores[]>([])

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await getAllStores()
        setStores(response)
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error)
      }
    }

    fetchStores()
  }, [])

  return (
    <>
      <title>Beit Yaacov - Departamento de Kashrut</title>
      <HomeNavBar />
      <div
        style={{
          backgroundColor: '#D7E0DA',
          height: '200px',
          display: 'flex',
          padding: '20px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className="w-screen"
      >
        <h2 className="text-1xl text-center pb-4">Estabelecimentos</h2>
        <p>
          Pesquise os estabelecimentos <b>supervisionados pela BYK</b>
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'center',
          alignItems: 'center',
          padding: '50px',
        }}
      >
        <CFormInput
          style={{
            maxWidth: '300px',
            marginBottom: '20px',
          }}
          type="text"
          placeholder="Digite o nome do estabelecimento"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Responsivo com largura mínima
            gap: '20px', // Espaçamento entre os itens
            width: '100%',
            padding: '20px',
          }}
        >
          {stores ? (
            stores.map((store) => <StoreItem key={store.id} store={store} />)
          ) : (
            <p>Carregando...</p>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
