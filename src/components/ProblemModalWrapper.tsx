'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CSpinner,
  CFormLabel,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react-pro';
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
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const toaster = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<any>(null);
  
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
  
  // Atualizar URL quando o modal for aberto
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        url: window.location.href
      }));
    }
  }, [isOpen]);
  
  // Não renderizar nada no servidor
  if (!mounted) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showToast('Erro', 'Por favor, envie apenas arquivos de imagem', 'danger');
        e.target.value = '';
        return;
      }
      
      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('Erro', 'A imagem deve ser menor que 2MB', 'danger');
        e.target.value = '';
        return;
      }
      
      setScreenshot(file);
    } else {
      setScreenshot(null);
    }
  };

  const showToast = (title: string, message: string, color: string = 'success') => {
    setToast(
      <CToast autohide={true} delay={5000} color={color}>
        <CToastHeader closeButton>
          <strong className="me-auto">{title}</strong>
        </CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      showToast('Erro', 'Você precisa estar logado para reportar um problema', 'danger');
      return;
    }

    if (!formData.title || !formData.description) {
      showToast('Erro', 'Preencha todos os campos obrigatórios', 'danger');
      return;
    }

    setLoading(true);
    
    try {
      // Usar FormData para enviar o arquivo
      const data = new FormData();
      data.append('userId', session.user.id);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('url', formData.url);
      
      // Anexar screenshot se existir
      if (screenshot) {
        data.append('screenshot', screenshot);
      }

      const response = await fetch('/api/problem-report', {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        showToast('Sucesso', 'Problema reportado com sucesso!', 'success');
        setTimeout(() => {
          onClose();
          setFormData({ 
            title: '', 
            description: '', 
            url: window.location.href
          });
          setScreenshot(null);
        }, 1500);
      } else {
        throw new Error('Erro ao reportar problema');
      }
    } catch (error) {
      showToast('Erro', 'Erro ao enviar o relatório de problema', 'danger');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              <small className="text-muted">
                URL atual do problema - você pode modificar caso necessário
              </small>
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="screenshot">Screenshot (opcional)</CFormLabel>
              <CFormInput
                type="file"
                id="screenshot"
                name="screenshot"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small className="text-muted">
                Envie uma imagem para ilustrar o problema (máximo 2MB)
              </small>
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
      
      <CToaster ref={toaster} placement="top-end">
        {toast}
      </CToaster>
    </>
  );
} 