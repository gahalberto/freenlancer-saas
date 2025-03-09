import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CButton, CSpinner } from '@coreui/react-pro';

type FixedJobReportButtonProps = {
  userId: string;
  userName: string;
};

const FixedJobReportButton: React.FC<FixedJobReportButtonProps> = ({ userId, userName }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleGenerateReport = async () => {
    if (!session?.user) {
      alert('Você precisa estar autenticado para gerar relatórios.');
      return;
    }

    setLoading(true);

    try {
      // Formatar datas para a API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Construir URL da API
      const apiUrl = `/api/reports/fixedJobReport?userId=${userId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

      // Iniciar download do PDF
      const response = await fetch(apiUrl, {
        headers: {
          // Usar o cabeçalho de autorização apenas se necessário
          // Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao baixar o relatório');
      }

      // Criar blob e link para download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${userId}-${formattedStartDate}-${formattedEndDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Não foi possível gerar o relatório. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <div className="flex justify-between mb-3">
        <div className="w-[48%]">
          <label htmlFor="startDate" className="block mb-1 text-sm font-medium">De:</label>
          <input
            id="startDate"
            type="date"
            className="w-full p-2 border rounded"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setStartDate(date);
              // Se a data de início for posterior à data de fim, ajustar a data de fim
              if (date > endDate) {
                setEndDate(date);
              }
            }}
          />
        </div>
        
        <div className="w-[48%]">
          <label htmlFor="endDate" className="block mb-1 text-sm font-medium">Até:</label>
          <input
            id="endDate"
            type="date"
            className="w-full p-2 border rounded"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            min={format(startDate, 'yyyy-MM-dd')}
          />
        </div>
      </div>
      
      <CButton
        color="primary"
        className="w-full py-3"
        onClick={handleGenerateReport}
        disabled={loading}
      >
        {loading ? (
          <>
            <CSpinner size="sm" className="me-2" />
            Gerando...
          </>
        ) : (
          'Gerar Relatório de Trabalho'
        )}
      </CButton>
    </div>
  );
};

export default FixedJobReportButton; 