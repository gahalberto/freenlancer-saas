'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CSpinner,
} from '@coreui/react-pro'

const categoryLabels = {
  SYSTEM_UPDATE: 'Atualização do Sistema',
  KASHRUT: 'Kashrut',
  MISC: 'Diversos',
}

type Props = {
  params: {
    slug: string
  }
}

export default function NewsPage({ params }: Props) {
  const [news, setNews] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/news/${params.slug}`)
        if (!response.ok) {
          notFound()
        }
        const data = await response.json()
        setNews(data)
      } catch (error) {
        console.error('Erro ao buscar notícia:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [params.slug])

  if (loading) {
    return (
      <CContainer fluid className="p-4">
        <div className="d-flex justify-content-center">
          <CSpinner />
        </div>
      </CContainer>
    )
  }

  if (!news) {
    return notFound()
  }

  return (
    <CContainer fluid className="p-4">
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{news.title}</h4>
            <div>
              <span className="badge bg-primary me-2">
                {categoryLabels[news.category as keyof typeof categoryLabels]}
              </span>
              <small className="text-muted">
                {new Date(news.publishedAt).toLocaleDateString('pt-BR')}
              </small>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {news.imageUrl && (
            <div className="mb-4">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="img-fluid rounded"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <div className="news-content" style={{ whiteSpace: 'pre-wrap' }}>
            {news.content}
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
} 