'use client'

import { Provider } from 'react-redux'
import store from './../store'
import './../styles/style.scss'
import './../styles/examples.scss'
import { SessionProvider } from 'next-auth/react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CAlert } from '@coreui/react-pro'
import { SessionProviderCustom } from '@/contexts/sessionContext'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTools, faClock } from '@fortawesome/free-solid-svg-icons'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance');
        const data = await res.json();
        setIsMaintenance(data.maintenance);
      } catch (error) {
        console.error('Erro ao verificar manutenção:', error);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  if (isMaintenance) {
    return (
      <html lang="en" className={inter.className}>
      <head>
        <title>Beit Yaacov - Dep. Cashrut</title>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .maintenance-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            padding: 20px;
            z-index: 9999;
            animation: fadeIn 1s ease-in-out;
          }
          .maintenance-title {
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .maintenance-message {
            font-size: 1.2rem;
            color: #34495e;
            max-width: 600px;
            margin-bottom: 30px;
          }
          .maintenance-icon {
            font-size: 4rem;
            color: #e67e22;
            margin-bottom: 20px;
          }
          .maintenance-footer {
            font-size: 0.9rem;
            color: #7f8c8d;
            margin-top: 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="maintenance-container">
          <div className="maintenance-icon">
            <FontAwesomeIcon icon={faTools} />
          </div>
          <h1 className="maintenance-title">
            <FontAwesomeIcon icon={faClock} />
            Site em Manutenção
          </h1>
          <p className="maintenance-message">
            Estamos trabalhando duro para trazer melhorias ao site. Por favor, volte mais tarde. Agradecemos sua paciência e compreensão!
          </p>
          <p className="maintenance-footer">
            © 2023 Beit Yaacov - Departamento de Cashrut. Todos os direitos reservados.
          </p>
        </div>
      </body>
    </html>
    );
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>Beit Yaacov - Dep. Cashrut</title>
      </head>
      <body>
        {/* 🔥 Agora o SessionProviderCustom está dentro do SessionProvider */}
        <SessionProvider>
          <SessionProviderCustom>
            <Provider store={store}>
              {children}
            </Provider>
          </SessionProviderCustom>
        </SessionProvider>
      </body>
    </html>
  )
}