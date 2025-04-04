'use client';

import React, { useState, useEffect } from 'react';
import { CButton } from '@coreui/react-pro';
import { cilBug } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import dynamic from 'next/dynamic';

// Criação de um componente com lazy loading para o modal
const ClientOnlyModal = dynamic(
  () => import('./ProblemModalWrapper'),
  { ssr: false }
);

function SimpleProblemButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Certificar-se de que o componente está renderizado apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Retornar um espaço reservado ou nada durante SSR
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        borderRadius: '20px',
      }}
    >
      <CButton
        color="primary"
        size="sm"
        style={{
          borderRadius: '20px',
          padding: '8px 16px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => setIsOpen(true)}
      >
        <CIcon icon={cilBug} style={{ marginRight: '8px' }} />
        Reportar Problema
      </CButton>
      
      {isOpen && <ClientOnlyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

// Exportar como componente puro com renderização apenas no cliente
export default function ClientOnlyWrapper() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted ? <SimpleProblemButton /> : null;
} 