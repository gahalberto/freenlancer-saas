import { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | BYK - Beit Yaakov Kashrut",
  description: "Conheça nossa política de privacidade e como protegemos seus dados pessoais no BYK - Beit Yaakov Kashrut",
};

export default function PrivacyPolicyPage() {
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header com fundo */}
      <div className="bg-blue-600 text-white py-12 mb-10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Saiba como o BYK - Beit Yaakov Kashrut protege suas informações e garante sua privacidade
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 py-10 max-w-4xl bg-white rounded-lg shadow-md mb-16">
        <div className="text-center mb-10">
          <p className="text-sm text-gray-600">Última atualização: {currentDate}</p>
        </div>

        <div className="prose prose-lg max-w-none px-4 md:px-8">
          <p className="mb-8 text-lg">
            Bem-vindo ao BYK - Beit Yaakov Kashrut. Valorizamos sua privacidade e estamos comprometidos em protegê-la. 
            Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nosso aplicativo.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">1. Informações Coletadas</h2>
          <p>
            O aplicativo BYK - Beit Yaakov Kashrut coleta apenas as informações essenciais para seu funcionamento interno. Isso inclui:
          </p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li><span className="text-blue-600">🔹</span> <strong>Informações Pessoais:</strong> Nome, e-mail e telefone informados no cadastro.</li>
            <li><span className="text-blue-600">🔹</span> <strong>Dados de Acesso:</strong> Informações sobre login e autenticação.</li>
            <li><span className="text-blue-600">🔹</span> <strong>Informações de Eventos:</strong> Dados relacionados aos eventos nos quais o usuário está registrado ou se inscreveu.</li>
            <li><span className="text-blue-600">🔹</span> <strong>Dados de Dispositivo:</strong> Coletamos informações sobre o tipo de dispositivo, versão do sistema operacional e identificadores do dispositivo para garantir o funcionamento adequado do app.</li>
          </ul>
          <p><span className="text-red-600">🚫</span> Não coletamos informações financeiras, dados sensíveis ou informações desnecessárias.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">2. Como Usamos Suas Informações</h2>
          <p>Usamos as informações coletadas para:</p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li><span className="text-green-600">✔️</span> Permitir o cadastro e login no aplicativo.</li>
            <li><span className="text-green-600">✔️</span> Gerenciar eventos e inscrições dos usuários.</li>
            <li><span className="text-green-600">✔️</span> Fornecer notificações sobre eventos futuros.</li>
            <li><span className="text-green-600">✔️</span> Melhorar a experiência do usuário e otimizar o funcionamento do app.</li>
            <li><span className="text-green-600">✔️</span> Cumprir exigências legais e garantir segurança.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">3. Compartilhamento de Informações</h2>
          <p><span className="text-blue-600">🔒</span> Seus dados NÃO são vendidos, compartilhados ou utilizados para fins comerciais.</p>
          <p>Podemos compartilhar informações apenas nos seguintes casos:</p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li><span className="text-green-600">✅</span> Com a empresa responsável pelo gerenciamento do app, para administração interna.</li>
            <li><span className="text-green-600">✅</span> Quando exigido por lei, em resposta a solicitações legais de autoridades.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">4. Armazenamento e Proteção dos Dados</h2>
          <p>
            Seus dados são armazenados em servidores seguros e protegidos contra acessos não autorizados.
          </p>
          <p className="my-6">
            <span className="text-blue-600">📌</span> Utilizamos criptografia e medidas de segurança avançadas para garantir a integridade das informações.
          </p>
          <p>
            Caso você queira excluir seus dados, entre em contato conosco através do e-mail abaixo ou utilize nossa <Link href="/excluir-conta" className="text-blue-600 hover:underline">página de solicitação de exclusão de conta</Link>.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">5. Permissões do Aplicativo</h2>
          <p>O aplicativo pode solicitar algumas permissões para funcionar corretamente:</p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li><span className="text-blue-600">📍</span> <strong>Acesso à Localização:</strong> Apenas se necessário para exibir eventos próximos (não obrigatório).</li>
            <li><span className="text-blue-600">🔔</span> <strong>Notificações:</strong> Para lembrar o usuário sobre eventos futuros.</li>
          </ul>
          <p>
            O usuário pode gerenciar essas permissões diretamente nas configurações do dispositivo.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">6. Retenção de Dados</h2>
          <p>
            Os dados dos usuários serão mantidos enquanto a conta estiver ativa. Caso o usuário solicite a exclusão da conta, 
            todos os seus dados serão removidos permanentemente em até 30 dias.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">7. Seus Direitos</h2>
          <p>Você tem os seguintes direitos em relação aos seus dados:</p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li><span className="text-green-600">✔️</span> Acessar suas informações pessoais.</li>
            <li><span className="text-green-600">✔️</span> Corrigir informações incorretas.</li>
            <li><span className="text-green-600">✔️</span> Solicitar a exclusão da conta e dos dados.</li>
            <li><span className="text-green-600">✔️</span> Limitar ou contestar o uso dos dados.</li>
          </ul>
          <p>
            Para exercer esses direitos, entre em contato através do e-mail: contato@beityaakovkashrut.com.br ou acesse nossa <Link href="/excluir-conta" className="text-blue-600 hover:underline font-medium">página de solicitação de exclusão de conta</Link>.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">8. Alterações na Política de Privacidade</h2>
          <p>
            Esta Política de Privacidade pode ser atualizada a qualquer momento. Notificaremos os usuários sobre 
            qualquer alteração significativa por meio do próprio aplicativo.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">9. Contato</h2>
          <p>
            Se tiver dúvidas sobre esta Política de Privacidade ou desejar solicitar informações sobre seus dados, entre em contato conosco:
          </p>
          <ul className="list-none pl-6 space-y-3 my-6">
            <li><span className="text-blue-600">📧</span> <strong>E-mail de suporte:</strong> contato@beityaakovkashrut.com.br</li>
            <li><span className="text-blue-600">🏢</span> <strong>Empresa responsável:</strong> Beit Yaakov Kashrut</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-6 text-blue-700">Conclusão</h2>
          <p className="mb-8">
            Ao utilizar o BYK - Beit Yaakov Kashrut, você concorda com esta Política de Privacidade. 
            Se não concordar com qualquer ponto, recomendamos que não utilize o aplicativo.
          </p>
          
          <div className="bg-gray-100 p-6 rounded-lg mt-10 text-center">
            <p className="mb-4 font-medium">Deseja solicitar a exclusão da sua conta e dados pessoais?</p>
            <Link 
              href="/excluir-conta" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Solicitar Exclusão de Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 