'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    motivo: '',
    confirmacao: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmacao) {
      setSubmitStatus({
        success: false,
        message: 'Você precisa confirmar que entende as consequências da exclusão da conta.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aqui seria implementada a chamada à API para enviar a solicitação
      // Por enquanto, vamos simular uma resposta bem-sucedida após 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({
        success: true,
        message: 'Sua solicitação foi enviada com sucesso. Nossa equipe entrará em contato em até 5 dias úteis para confirmar a exclusão.',
      });
      
      // Limpar o formulário após envio bem-sucedido
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        motivo: '',
        confirmacao: false,
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente ou entre em contato diretamente pelo e-mail contato@beityaakovkashrut.com.br',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header com fundo */}
      <div className="bg-blue-600 text-white py-12 mb-10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Solicitar Exclusão de Conta</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Preencha o formulário abaixo para solicitar a exclusão da sua conta e dados pessoais
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 py-10 max-w-3xl bg-white rounded-lg shadow-md mb-16">
        {submitStatus.success ? (
          <div className="text-center py-8">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
              <p className="font-medium">{submitStatus.message}</p>
            </div>
            <p className="mb-6">
              Agradecemos por utilizar nossos serviços. Se mudar de ideia ou tiver alguma dúvida, 
              entre em contato conosco pelo e-mail contato@beityaakovkashrut.com.br.
            </p>
            <div className="mt-8">
              <Link 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Voltar para a página inicial
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Informações Importantes</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-800">
                  <strong>Atenção:</strong> A exclusão da sua conta e dados pessoais é irreversível. 
                  Após a confirmação, todos os seus dados serão removidos permanentemente do nosso sistema em até 30 dias.
                </p>
              </div>
              <p className="mb-4">
                Ao solicitar a exclusão da sua conta, você perderá acesso a:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Histórico de eventos e participações</li>
                <li>Informações de perfil e preferências</li>
                <li>Quaisquer benefícios associados à sua conta</li>
              </ul>
              <p>
                Após o envio deste formulário, nossa equipe analisará sua solicitação e entrará em contato 
                para confirmar a exclusão. O processo completo pode levar até 30 dias.
              </p>
            </div>

            {submitStatus.message && !submitStatus.success && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{submitStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o e-mail associado à sua conta"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu telefone (opcional)"
                />
              </div>

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Exclusão
                </label>
                <select
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um motivo (opcional)</option>
                  <option value="nao_uso_mais">Não uso mais o serviço</option>
                  <option value="problemas_tecnicos">Problemas técnicos</option>
                  <option value="privacidade">Preocupações com privacidade</option>
                  <option value="experiencia_ruim">Experiência ruim com o serviço</option>
                  <option value="outro">Outro motivo</option>
                </select>
              </div>

              <div className="pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="confirmacao"
                      name="confirmacao"
                      type="checkbox"
                      checked={formData.confirmacao}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="confirmacao" className="text-sm text-gray-700">
                      Confirmo que desejo excluir minha conta e entendo que esta ação é irreversível. *
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Exclusão da Conta'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Se preferir, você também pode solicitar a exclusão da sua conta enviando um e-mail para{' '}
                <a href="mailto:contato@beityaakovkashrut.com.br" className="text-blue-600 hover:underline">
                  contato@beityaakovkashrut.com.br
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 