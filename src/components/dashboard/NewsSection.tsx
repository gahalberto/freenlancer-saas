'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CCardTitle,
  CBadge,
} from '@coreui/react-pro'

type News = {
  id: string
  title: string
  summary: string
  imageUrl?: string
  category: 'SYSTEM_UPDATE' | 'KASHRUT' | 'MISC'
  slug: string
  publishedAt: string
}

const categoryLabels = {
  SYSTEM_UPDATE: 'Atualização do Sistema',
  KASHRUT: 'Kashrut',
  MISC: 'Diversos',
}

const categoryColors = {
  SYSTEM_UPDATE: 'info',
  KASHRUT: 'success',
  MISC: 'primary',
}

export default function NewsSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<News[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/news')
        const data = await response.json()
        setNews(data)
      } catch (error) {
        console.error('Erro ao buscar notícias:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const handleCardClick = (slug: string) => {
    router.push(`/news/${slug}`)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CCardTitle>
          <strong>Notícias e Avisos</strong>
        </CCardTitle>
        <span className="text-gray-400">
          Últimas atualizações do sistema
        </span>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="d-flex justify-content-center">
            <CSpinner color="primary" />
          </div>
        ) : news.length === 0 ? (
          <p className="text-center">Nenhuma notícia disponível</p>
        ) : (
          <CRow>
            {news.map((item) => (
              <CCol key={item.id} sm={12} lg={6} xl={4} className="mb-4">
                <CCard 
                  className="h-100 shadow-sm border-0 cursor-pointer hover-scale" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCardClick(item.slug)}
                >
                  {item.imageUrl && (
                    <div 
                      style={{ 
                        height: '150px', 
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} 
                    />
                  )}
                  <CCardBody>
                    <div className="d-flex justify-content-between mb-2">
                      <CBadge color={categoryColors[item.category] as any}>
                        {categoryLabels[item.category]}
                      </CBadge>
                      <small className="text-muted">
                        {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                      </small>
                    </div>
                    <h5>{item.title}</h5>
                    <p className="text-muted">{item.summary}</p>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
} 