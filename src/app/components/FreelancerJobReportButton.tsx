import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CButton, CSpinner } from '@coreui/react-pro';

type FreelancerJobReportButtonProps = {
  userId: string;
  userName: string;
};

const FreelancerJobReportButton: React.FC<FreelancerJobReportButtonProps> = ({ userId, userName }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'date' | 'month'>('date');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Ano atual

  const handleGenerateReport = async () => {
    if (!session?.user) {
      alert('Você precisa estar autenticado para gerar relatórios.');
      return;
    }

    setLoading(true);

    try {
      // Construir URL da API com base no tipo de relatório
      let apiUrl = `/api/reports/freelancerJobReport?userId=${userId}`;
      
      if (reportType === 'date') {
        // Formatar datas para a API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        apiUrl += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else {
        // Usar mês e ano
        const formattedMonth = month.toString().padStart(2, '0');
        apiUrl += `&month=${formattedMonth}&year=${year}`;
      }

      // Iniciar download do PDF
      const response = await fetch(apiUrl, {
        headers: {
          // Usar o cabeçalho de autorização apenas se necessário
          // Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao baixar o relatório');
      }

      // Criar blob e link para download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nome do arquivo com base no tipo de relatório
      let fileName = '';
      if (reportType === 'date') {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        fileName = `relatorio-freelancer-${userId}-${formattedStartDate}-${formattedEndDate}.pdf`;
      } else {
        const formattedMonth = month.toString().padStart(2, '0');
        fileName = `relatorio-freelancer-${userId}-${year}-${formattedMonth}.pdf`;
      }
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert(`Não foi possível gerar o relatório. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Array de meses para o seletor
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  // Gerar array de anos (últimos 5 anos)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="my-4">
      <div className="mb-3">
        <div className="flex gap-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              checked={reportType === 'date'}
              onChange={() => setReportType('date')}
              className="mr-2"
            />
            Por período
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              checked={reportType === 'month'}
              onChange={() => setReportType('month')}
              className="mr-2"
            />
            Por mês
          </label>
        </div>

        {reportType === 'date' ? (
          <div className="flex justify-between">
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
        ) : (
          <div className="flex justify-between">
            <div className="w-[48%]">
              <label htmlFor="month" className="block mb-1 text-sm font-medium">Mês:</label>
              <select
                id="month"
                className="w-full p-2 border rounded"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-[48%]">
              <label htmlFor="year" className="block mb-1 text-sm font-medium">Ano:</label>
              <select
                id="year"
                className="w-full p-2 border rounded"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
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
          'Gerar Relatório de Trabalho Freelancer'
        )}
      </CButton>
    </div>
  );
};

export default FreelancerJobReportButton; 