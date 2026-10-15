import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Target, 
  Award, 
  Smartphone, 
  Shield, 
  Truck, 
  Clock,
  Star,
  CheckCircle,
  Heart,
  Zap
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const features = [
    {
      icon: Smartphone,
      title: 'App Intuitivo',
      description: 'Interface moderna e fácil de usar para todos os tipos de usuário'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Transações seguras e dados protegidos com criptografia avançada'
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Logística otimizada para entregas rápidas e eficientes'
    },
    {
      icon: Clock,
      title: 'Disponibilidade',
      description: 'Plataforma disponível 24/7 para suas necessidades'
    },
    {
      icon: Star,
      title: 'Qualidade',
      description: 'Produtos e serviços verificados e avaliados pela comunidade'
    },
    {
      icon: Heart,
      title: 'Suporte',
      description: 'Atendimento humanizado e suporte técnico especializado'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Usuários Ativos' },
    { number: '1000+', label: 'Produtos' },
    { number: '500+', label: 'Prestadores' },
    { number: '100+', label: 'Lojas Parceiras' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-800 mr-3">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Sobre o Xopy</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Conectando o mundo da construção</h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            O Xopy é a plataforma que revoluciona a forma como você compra materiais 
            de construção e contrata serviços profissionais.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Mission */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 -mt-8 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Simplificar e democratizar o acesso a materiais de construção e serviços 
              profissionais, conectando clientes, prestadores e lojistas em uma única 
              plataforma digital confiável e eficiente.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">O que fazemos</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Para Clientes</h4>
              <p className="text-gray-600">
                Encontre os melhores materiais de construção e prestadores de serviços 
                qualificados em um só lugar.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Para Prestadores</h4>
              <p className="text-gray-600">
                Conecte-se com clientes que precisam dos seus serviços e faça seu 
                negócio crescer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Para Lojistas</h4>
              <p className="text-gray-600">
                Expanda seu alcance vendendo seus produtos para milhares de 
                clientes em potencial.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Por que escolher o Xopy?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Como funciona</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cadastre-se</h4>
                <p className="text-gray-600">
                  Crie sua conta gratuita escolhendo o tipo de usuário: Cliente, Prestador ou Lojista.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Explore</h4>
                <p className="text-gray-600">
                  Navegue por milhares de produtos e serviços, compare preços e avaliações.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Conecte-se</h4>
                <p className="text-gray-600">
                  Faça pedidos, contrate serviços ou venda seus produtos de forma segura e fácil.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nossos Valores</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Transparência</h4>
                <p className="text-gray-600 text-sm">
                  Preços claros, avaliações reais e informações precisas sobre produtos e serviços.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Qualidade</h4>
                <p className="text-gray-600 text-sm">
                  Parceiros verificados e produtos de qualidade para garantir sua satisfação.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Inovação</h4>
                <p className="text-gray-600 text-sm">
                  Tecnologia de ponta para facilitar suas transações e melhorar sua experiência.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comunidade</h4>
                <p className="text-gray-600 text-sm">
                  Construindo uma comunidade forte e colaborativa no setor da construção.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-orange-100 mb-6">
            Junte-se a milhares de usuários que já descobriram uma nova forma de 
            comprar, vender e contratar no setor da construção.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Criar Conta Gratuita
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Entre em Contato</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
              <p className="text-orange-600">contato@xopy.com.br</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Telefone</h4>
              <p className="text-orange-600">(98) 8787-6077</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Suporte</h4>
              <p className="text-orange-600">suporte@xopy.com.br</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;