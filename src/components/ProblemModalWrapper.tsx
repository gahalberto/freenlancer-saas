'use client';

import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CSpinner
} from '@coreui/react-pro';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProblemModalWrapper({ isOpen, onClose }: ModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });
  
  // Atualizar URL e definir como montado apenas no cliente
  useEffect(() => {
    setMounted(true);
    
    // Atualizar URL apenas no cliente
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        url: window.location.href
      }));
    }
  }, []);
  
  // Não renderizar nada no servidor
  if (!mounted) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('Você precisa estar logado para reportar um problema');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/problem-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          ...formData
        })
      });

      if (response.ok) {
        toast.success('Problema reportado com sucesso!');
        onClose();
        setFormData({ 
          title: '', 
          description: '', 
          url: window.location.href
        });
      } else {
        throw new Error('Erro ao reportar problema');
      }
    } catch (error) {
      toast.error('Erro ao enviar o relatório de problema');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={isOpen} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Reportar Problema</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormInput
              type="text"
              id="title"
              name="title"
              label="Título"
              placeholder="Título do problema"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormTextarea
              id="description"
              name="description"
              label="Descrição"
              placeholder="Descreva o problema detalhadamente"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormInput
              type="text"
              id="url"
              name="url"
              label="URL (opcional)"
              placeholder="URL da página onde ocorreu o problema"
              value={formData.url}
              onChange={handleInputChange}
            />
          </div>
          <CModalFooter>
            <CButton color="secondary" onClick={onClose}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? <CSpinner size="sm" className="me-2" /> : null}
              Enviar
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  );
} 