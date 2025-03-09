import React from 'react';
import FixedJobReportButton from '../components/FixedJobReportButton';
import { useRouter, useSearchParams } from 'next/navigation';

// Exemplo de tela de perfil do Mashguiach que inclui o botão de relatório
const MashguiachProfileScreen = ({ mashguiach }: { mashguiach: any }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-600 p-5 pt-10">
        <h1 className="text-2xl font-bold text-white">Perfil do Mashguiach</h1>
      </div>

      <div className="m-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-2xl font-bold mb-2">{mashguiach.name}</h2>
          <p className="text-gray-600 mb-1">Email: {mashguiach.email}</p>
          <p className="text-gray-600 mb-1">Telefone: {mashguiach.phone || 'Não informado'}</p>
          
          {/* Outras informações do perfil */}
          <div className="h-px bg-gray-200 my-4" />
          
          <h3 className="text-lg font-bold mb-2">Relatórios</h3>
          <p className="text-gray-500 text-sm mb-4">
            Gere relatórios de trabalho fixo para visualizar horas trabalhadas e valores.
          </p>
          
          {/* Componente de botão para gerar relatório */}
          <FixedJobReportButton 
            userId={mashguiach.id} 
            userName={mashguiach.name} 
          />
        </div>
      </div>
    </div>
  );
};

export default MashguiachProfileScreen; 