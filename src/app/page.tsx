'use client'

import StoreItem from '@/components/estabelecimentoItem'
import HomeNavBar from '@/components/navBar'
import { CFormInput } from '@coreui/react-pro'

const Home = () => {
  return (
    <>
      <HomeNavBar />
      <div
        style={{
          backgroundColor: '#D7E0DA',
          height: '300px',
          display: 'flex',
          padding: '20px',
          flexDirection: 'column', // Garante layout em coluna
          justifyContent: 'center', // Centraliza verticalmente
          alignItems: 'center', // Centraliza horizontalmente
        }}
        className="w-screen"
      >
        <h2 className="text-1xl text-center pb-4">Estabelecimentos</h2>
        <p>
          Supervisionados pela <b>Beit Yaakov</b>
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'center',
          alignItems: 'center',
          padding: '100px',
        }}
      >
        <CFormInput
          style={{
            maxWidth: '300px', // Limita a largura do input
            marginBottom: '20px', // Espaçamento inferior
          }}
          type="text"
          placeholder="Digite o nome do estabelecimento"
        />

        <StoreItem />
      </div>
    </>
  )
}

export default Home
