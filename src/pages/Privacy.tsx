import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Users, Lock, AlertCircle, Eye, Database, CreditCard, Share2, UserCheck, Clock, Mail } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-800 mr-3">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Last Updated */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-800">Última atualização</span>
          </div>
          <p className="text-orange-700 text-sm">Novembro de 2025</p>
          <p className="text-orange-700 text-sm mt-1">Endereço: https://xopy.com.br</p>
          <p className="text-orange-700 text-sm">Contato: suporte@xopy.com.br</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🧾 Política de Privacidade - XOPY</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Esta Política de Privacidade descreve como o Xopy – Marketplace da Construção Civil 
            coleta, usa, armazena e protege suas informações pessoais quando você utiliza nossa plataforma.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ao usar nossos serviços, você concorda com as práticas descritas nesta política.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Sobre o Xopy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">🧱 1. Sobre o XOPY</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                O Xopy – Marketplace da Construção Civil é uma plataforma que conecta usuários, 
                lojas e prestadores de serviço do setor da construção civil, permitindo a compra 
                e venda de produtos, além da contratação de profissionais de forma segura e prática.
              </p>
              <p>
                O aplicativo é operado pela equipe da Xopy, responsável por proteger os dados dos 
                usuários e garantir o uso ético das informações coletadas.
              </p>
            </div>
          </div>

          {/* 2. Coleta de Informações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Database className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">🔒 2. Coleta de Informações</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>Durante o uso do aplicativo e do site, o Xopy pode coletar as seguintes informações:</p>
              
              <div>
                <p className="font-semibold mb-2">🧍 Usuários:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nome completo, e-mail, telefone e endereço</li>
                  <li>Senha de acesso (armazenada de forma criptografada)</li>
                  <li>Cidade e estado para exibir lojas e serviços locais</li>
                  <li>Histórico de pedidos e preferências de compra</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">🧱 Lojas:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Razão social, CNPJ, e dados de contato</li>
                  <li>Informações de produtos, preços e estoque</li>
                  <li>Dados bancários (para repasse de pagamentos via Mercado Pago)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">🧰 Prestadores de Serviço:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nome, profissão, especialidades e anos de experiência</li>
                  <li>Valores cobrados por hora e descrição dos serviços</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">🧭 Dados automáticos:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Endereço IP e informações de localização (se autorizado)</li>
                  <li>Cookies e dados de navegação (para personalizar a experiência)</li>
                  <li>Informações sobre dispositivo e sistema operacional</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Pagamentos e Segurança */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">💳 3. Pagamentos e Segurança Financeira</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>O Xopy utiliza a integração com o <strong>Mercado Pago</strong>, que é responsável por todo o processamento financeiro.</li>
                <li><strong>Nenhuma informação sensível de cartão de crédito</strong> é armazenada em nossos servidores.</li>
                <li>O Xopy apenas registra o status da transação (aprovado, pendente ou cancelado) e o repasse de valores.</li>
              </ul>
              <p className="mt-4">
                Toda a comunicação é criptografada com <strong>HTTPS/TLS 1.3</strong>, e os dados ficam 
                hospedados de forma segura no <strong>Supabase</strong>, plataforma que segue padrões de 
                segurança SOC 2 e GDPR.
              </p>
            </div>
          </div>

          {/* 4. Uso das Informações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">⚙️ 4. Uso das Informações</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>As informações coletadas são utilizadas para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Criar e gerenciar contas de usuários e lojistas</li>
                <li>Exibir produtos, serviços e anúncios relevantes</li>
                <li>Processar pedidos e pagamentos</li>
                <li>Melhorar a experiência e desempenho do app</li>
                <li>Enviar notificações sobre promoções e atualizações</li>
              </ul>
              <p className="mt-4">
                Os dados <strong>não são vendidos ou compartilhados com terceiros</strong>, exceto 
                quando exigido por lei ou para o funcionamento de integrações essenciais 
                (ex: Mercado Pago, Supabase).
              </p>
            </div>
          </div>

          {/* 5. Compartilhamento de Dados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Share2 className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">🧩 5. Compartilhamento de Dados</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>O Xopy pode compartilhar dados apenas com:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Mercado Pago:</strong> para processar pagamentos e repasses</li>
                <li><strong>Serviços de hospedagem (Supabase / Netlify):</strong> para armazenar informações</li>
                <li><strong>Autoridades competentes:</strong> mediante solicitação judicial</li>
              </ul>
            </div>
          </div>

          {/* 6. Direitos do Usuário (LGPD) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">🧠 6. Direitos do Usuário (LGPD)</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Solicitar acesso, correção ou exclusão de informações</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
              <p className="mt-4">
                Para exercer seus direitos, entre em contato pelo e-mail:<br />
                <strong>📩 privacidade@xopy.com.br</strong>
              </p>
            </div>
          </div>

          {/* 7. Retenção e Exclusão */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">📦 7. Retenção e Exclusão de Dados</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                Os dados pessoais são mantidos pelo período necessário ao uso do app e obrigações 
                legais (ex: transações financeiras).
              </p>
              <p>
                Após esse período, podem ser anonimizados ou excluídos de forma segura.
              </p>
            </div>
          </div>

          {/* 8. Segurança */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">🔐 8. Segurança</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>O Xopy adota medidas técnicas e organizacionais para proteger seus dados:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Criptografia de senhas e informações sensíveis</li>
                <li>Autenticação segura via e-mail ou Google</li>
                <li>Monitoramento de acessos e logs no Supabase</li>
              </ul>
            </div>
          </div>

          {/* 9. Atualizações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">📱 9. Atualizações</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                Esta Política pode ser atualizada a qualquer momento. A data da última revisão 
                estará sempre indicada no topo desta página.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-bold text-orange-800">📬 10. Contato</h3>
          </div>
          <p className="text-orange-700 mb-4">
            Dúvidas sobre privacidade ou solicitações de dados:
          </p>
          <div className="space-y-2 text-orange-700">
            <p><strong>Xopy - Equipe de Privacidade</strong></p>
            <p><strong>E-mail:</strong> privacidade@xopy.com.br</p>
            <p><strong>Site:</strong> https://xopy.com.br</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
