'use client'

import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCloseButton,
} from '@coreui/react-pro'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'

interface Contato {
  id: string
  nome: string
  email: string
  telefone: string | null
  assunto: string | null
  mensagem: string
  lido: boolean
  createdAt: string
  updatedAt: string
}

const ContatosAdminPage = () => {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const fetchContatos = async () => {
      try {
        const response = await fetch('/api/contato')
        if (!response.ok) {
          throw new Error('Erro ao buscar contatos')
        }
        const data = await response.json()
        setContatos(data)
      } catch (error) {
        console.error('Erro ao buscar contatos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContatos()
  }, [])

  const handleMarcarComoLido = async (id: string) => {
    try {
      const response = await fetch(`/api/contato/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lido: true }),
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar contato como lido')
      }

      // Atualizar a lista de contatos
      setContatos(contatos.map(contato => 
        contato.id === id ? { ...contato, lido: true } : contato
      ))

      // Se o contato selecionado for o que foi marcado como lido, atualizar também
      if (contatoSelecionado && contatoSelecionado.id === id) {
        setContatoSelecionado({ ...contatoSelecionado, lido: true })
      }
    } catch (error) {
      console.error('Erro ao marcar contato como lido:', error)
    }
  }

  const handleExcluirContato = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) {
      return
    }

    try {
      const response = await fetch(`/api/contato/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir contato')
      }

      // Remover o contato da lista
      setContatos(contatos.filter(contato => contato.id !== id))

      // Se o contato selecionado for o que foi excluído, fechar o modal
      if (contatoSelecionado && contatoSelecionado.id === id) {
        setModalVisible(false)
        setContatoSelecionado(null)
      }
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
    }
  }

  const handleVerDetalhes = (contato: Contato) => {
    setContatoSelecionado(contato)
    setModalVisible(true)

    // Se o contato não estiver lido, marcá-lo como lido
    if (!contato.lido) {
      handleMarcarComoLido(contato.id)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return format(data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <h4>Mensagens de Contato</h4>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <p>Carregando contatos...</p>
          ) : contatos.length === 0 ? (
            <p>Nenhuma mensagem de contato recebida.</p>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nome</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Assunto</CTableHeaderCell>
                  <CTableHeaderCell>Data</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {contatos.map((contato) => (
                  <CTableRow key={contato.id}>
                    <CTableDataCell>{contato.nome}</CTableDataCell>
                    <CTableDataCell>{contato.email}</CTableDataCell>
                    <CTableDataCell>{contato.assunto || 'Sem assunto'}</CTableDataCell>
                    <CTableDataCell>
                      {format(new Date(contato.createdAt), 'dd/MM/yyyy HH:mm')}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={contato.lido ? 'success' : 'warning'}>
                        {contato.lido ? 'Lido' : 'Não lido'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        color="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleVerDetalhes(contato)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </CButton>
                      {!contato.lido && (
                        <CButton 
                          color="success" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleMarcarComoLido(contato.id)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </CButton>
                      )}
                      <CButton 
                        color="danger" 
                        size="sm"
                        onClick={() => handleExcluirContato(contato.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal de detalhes do contato */}
      <CModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        size="lg"
      >
        {contatoSelecionado && (
          <>
            <CModalHeader>
              <CModalTitle>Detalhes da Mensagem</CModalTitle>
              <CCloseButton onClick={() => setModalVisible(false)} />
            </CModalHeader>
            <CModalBody>
              <div className="mb-3">
                <h5>Informações do Remetente</h5>
                <p><strong>Nome:</strong> {contatoSelecionado.nome}</p>
                <p><strong>Email:</strong> {contatoSelecionado.email}</p>
                {contatoSelecionado.telefone && (
                  <p><strong>Telefone:</strong> {contatoSelecionado.telefone}</p>
                )}
              </div>
              
              <div className="mb-3">
                <h5>Mensagem</h5>
                <p><strong>Assunto:</strong> {contatoSelecionado.assunto || 'Sem assunto'}</p>
                <p><strong>Data:</strong> {formatarData(contatoSelecionado.createdAt)}</p>
                <div className="p-3 bg-light rounded">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{contatoSelecionado.mensagem}</p>
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              {!contatoSelecionado.lido && (
                <CButton 
                  color="success" 
                  onClick={() => handleMarcarComoLido(contatoSelecionado.id)}
                >
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Marcar como lido
                </CButton>
              )}
              <CButton 
                color="danger" 
                onClick={() => handleExcluirContato(contatoSelecionado.id)}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Excluir
              </CButton>
              <CButton 
                color="secondary" 
                onClick={() => setModalVisible(false)}
              >
                Fechar
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
    </>
  )
}

export default ContatosAdminPage 