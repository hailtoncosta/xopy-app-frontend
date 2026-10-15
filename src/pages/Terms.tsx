import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Users, Lock, AlertCircle } from 'lucide-react';

const Terms = () => {
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
            <FileText className="h-6 w-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Termos e Condições</h1>
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
          <p className="text-orange-700 text-sm">15 de dezembro de 2024</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao Xopy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estes Termos e Condições ("Termos") regem o uso da plataforma Xopy, 
            um marketplace digital que conecta clientes, prestadores de serviços e lojistas 
            para compra de materiais de construção e contratação de serviços.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ao acessar ou usar nossos serviços, você concorda em cumprir estes Termos. 
            Se você não concordar com qualquer parte destes Termos, não deve usar nossa plataforma.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Definições */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Definições</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>Plataforma:</strong> O aplicativo e website Xopy</p>
              <p><strong>Usuário:</strong> Qualquer pessoa que acesse ou use a Plataforma</p>
              <p><strong>Cliente:</strong> Usuário que compra produtos ou contrata serviços</p>
              <p><strong>Prestador:</strong> Usuário que oferece serviços profissionais</p>
              <p><strong>Lojista:</strong> Usuário que vende produtos na Plataforma</p>
            </div>
          </div>

          {/* 2. Uso da Plataforma */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Uso da Plataforma</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Você pode usar nossa Plataforma para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Navegar e pesquisar produtos e serviços</li>
                <li>Fazer compras de materiais de construção</li>
                <li>Contratar prestadores de serviços</li>
                <li>Vender produtos (como Lojista)</li>
                <li>Oferecer serviços (como Prestador)</li>
              </ul>
            </div>
          </div>

          {/* 3. Conta de Usuário */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Conta de Usuário</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Para usar certas funcionalidades, você deve criar uma conta:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Forneça informações precisas e atualizadas</li>
                <li>Mantenha sua senha segura e confidencial</li>
                <li>Você é responsável por todas as atividades em sua conta</li>
                <li>Notifique-nos imediatamente sobre uso não autorizado</li>
              </ul>
            </div>
          </div>

          {/* 4. Transações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Transações e Pagamentos</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Todas as transações estão sujeitas às seguintes condições:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Preços podem variar sem aviso prévio</li>
                <li>Pagamentos são processados por parceiros seguros</li>
                <li>Taxas de entrega podem ser aplicadas</li>
                <li>Política de cancelamento varia por produto/serviço</li>
              </ul>
            </div>
          </div>

          {/* 5. Privacidade */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Privacidade e Dados</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Respeitamos sua privacidade e protegemos seus dados:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Coletamos apenas dados necessários para o serviço</li>
                <li>Não vendemos suas informações pessoais</li>
                <li>Usamos criptografia para proteger dados sensíveis</li>
                <li>Você pode solicitar exclusão de seus dados</li>
              </ul>
            </div>
          </div>

          {/* 6. Responsabilidades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Responsabilidades</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>Suas responsabilidades:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Usar a Plataforma de forma legal e ética</li>
                <li>Não publicar conteúdo ofensivo ou ilegal</li>
                <li>Respeitar direitos de propriedade intelectual</li>
                <li>Fornecer informações precisas</li>
              </ul>
              <p><strong>Nossas responsabilidades:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Manter a Plataforma funcionando adequadamente</li>
                <li>Proteger seus dados pessoais</li>
                <li>Facilitar transações entre usuários</li>
                <li>Fornecer suporte ao cliente</li>
              </ul>
            </div>
          </div>

          {/* 7. Limitações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">7</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Limitações de Responsabilidade</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>A Xopy não se responsabiliza por:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Qualidade dos produtos vendidos por terceiros</li>
                <li>Serviços prestados por prestadores independentes</li>
                <li>Disputas entre usuários</li>
                <li>Danos indiretos ou consequenciais</li>
              </ul>
            </div>
          </div>

          {/* 8. Alterações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">8</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Alterações nos Termos</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                Podemos atualizar estes Termos periodicamente. Quando fizermos alterações 
                significativas, notificaremos você através da Plataforma ou por email.
              </p>
              <p>
                O uso continuado da Plataforma após as alterações constitui aceitação 
                dos novos Termos.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-orange-800 mb-3">Dúvidas sobre os Termos?</h3>
          <p className="text-orange-700 mb-4">
            Se você tiver dúvidas sobre estes Termos e Condições, entre em contato conosco:
          </p>
          <div className="space-y-2 text-orange-700">
            <p><strong>Email:</strong> legal@xopy.com.br</p>
            <p><strong>Telefone:</strong> (98) 9 8787-6077</p>
            <p><strong>Endereço:</strong> São Luís, MA - Brasil</p>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Política de Privacidade</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Para saber mais sobre como coletamos, usamos e protegemos seus dados pessoais, 
            consulte nossa Política de Privacidade.
          </p>
          <button
            onClick={() => navigate('/politica-de-privacidade')}
            className="text-orange-600 hover:text-orange-700 font-semibold underline"
          >
            Ler Política de Privacidade →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;