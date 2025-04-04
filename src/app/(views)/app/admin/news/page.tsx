'use client'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const categoryOptions = [
  { value: 'SYSTEM_UPDATE', label: 'Atualização do Sistema' },
  { value: 'KASHRUT', label: 'Kashrut' },
  { value: 'MISC', label: 'Diversos' },
]

export default function NewsAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    category: 'SYSTEM_UPDATE',
  })

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news')
        const data = await response.json()
        setNews(data)
      } catch (error) {
        console.error('Erro ao buscar notícias:', error)
      }
    }

    fetchNews()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar notícia')
      }

      router.refresh()
      setFormData({
        title: '',
        summary: '',
        content: '',
        imageUrl: '',
        category: 'SYSTEM_UPDATE',
      })
      
      // Atualizar a lista de notícias
      const newsResponse = await fetch('/api/news')
      const newsData = await newsResponse.json()
      setNews(newsData)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar notícia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Nova Notícia</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="title">Título</CFormLabel>
                <CFormInput
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="summary">Resumo</CFormLabel>
                <CFormTextarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="content">Conteúdo</CFormLabel>
                <CFormTextarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  rows={5}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="imageUrl">URL da Imagem</CFormLabel>
                <CFormInput
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="category">Categoria</CFormLabel>
                <CFormSelect
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Notícias Publicadas</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Título</CTableHeaderCell>
                  <CTableHeaderCell>Categoria</CTableHeaderCell>
                  <CTableHeaderCell>Data de Publicação</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {news.map((item: any) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell>{item.title}</CTableDataCell>
                    <CTableDataCell>
                      {categoryOptions.find(opt => opt.value === item.category)?.label || item.category}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        color="info" 
                        size="sm" 
                        onClick={() => router.push(`/news/${item.slug}`)}
                      >
                        Ver
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
} 