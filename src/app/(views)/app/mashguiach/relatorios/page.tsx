'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { FreelancerJobReportButton } from '@/app/components';
import { FixedJobReportButton } from '@/app/components';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react-pro';

export default function RelatoriosPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      
      <CRow>
        <CCol md={6} className="mb-4">
          <CCard>
            <CCardHeader>
              <h2 className="text-lg font-semibold">Relatório de Trabalho Fixo</h2>
            </CCardHeader>
            <CCardBody>
              <p className="mb-4">
                Gere um relatório detalhado dos seus trabalhos fixos, incluindo horas trabalhadas e valores.
              </p>
              {userId && (
                <FixedJobReportButton 
                  userId={userId} 
                  userName={session?.user?.name || ''} 
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol md={6} className="mb-4">
          <CCard>
            <CCardHeader>
              <h2 className="text-lg font-semibold">Relatório de Trabalho Freelancer</h2>
            </CCardHeader>
            <CCardBody>
              <p className="mb-4">
                Gere um relatório detalhado dos seus trabalhos freelancer, incluindo horas trabalhadas e valores.
              </p>
              {userId && (
                <FreelancerJobReportButton 
                  userId={userId} 
                  userName={session?.user?.name || ''} 
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Informações sobre os relatórios</h3>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <strong>Relatório de Trabalho Fixo:</strong> Mostra os registros de ponto e horas trabalhadas em trabalhos fixos.
          </li>
          <li className="mb-2">
            <strong>Relatório de Trabalho Freelancer:</strong> Mostra os serviços de eventos realizados como freelancer.
            <ul className="list-disc pl-5 mt-1">
              <li>Serviços em <span className="text-red-600">vermelho</span> indicam que não houve check-in/check-out.</li>
              <li>Serviços realizados entre 22h e 6h são calculados com valor fixo de R$ 75,00 por hora.</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
} 