import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, MessageCircle, User, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceProviderAuth } from '@/hooks/useServiceProviderAuth';
const ServiceProviderStatus = () => {
  const navigate = useNavigate();
  const {
    serviceProviderData,
    isLoading
  } = useServiceProviderAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
        <BottomNavigation />
      </div>;
  }
  if (!serviceProviderData) {
    return <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Status do Prestador</h1>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Você não é um prestador de serviços
              </h3>
              <p className="text-gray-500 mb-4">
                Cadastre-se como prestador para oferecer seus serviços
              </p>
              <Button onClick={() => navigate('/servicos/todos')} className="bg-orange-600 hover:bg-orange-700 text-white">
                Cadastrar como Prestador
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>;
  }
  const getStatusIcon = () => {
    switch (serviceProviderData.status) {
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'pending':
        return <Clock className="h-8 w-8 text-orange-600" />;
      case 'rejected':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Clock className="h-8 w-8 text-gray-600" />;
    }
  };
  const getStatusTitle = () => {
    switch (serviceProviderData.status) {
      case 'approved':
        return '🎉 Prestador Aprovado!';
      case 'pending':
        return '⏳ Cadastro em Análise';
      case 'rejected':
        return '❌ Cadastro Rejeitado';
      default:
        return 'Status Desconhecido';
    }
  };
  const getStatusDescription = () => {
    switch (serviceProviderData.status) {
      case 'approved':
        return 'Parabéns! Seu cadastro foi aprovado e você já pode receber mensagens de clientes interessados em seus serviços.';
      case 'pending':
        return 'Seu cadastro está sendo analisado pela nossa equipe. Aguarde a aprovação para começar a aparecer na listagem de prestadores.';
      case 'rejected':
        return 'Seu cadastro foi rejeitado. Entre em contato conosco para mais informações e orientações.';
      default:
        return 'Status não identificado. Entre em contato com o suporte.';
    }
  };
  const getStatusColor = () => {
    switch (serviceProviderData.status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-4 pb-20">
        {/* Back Button - Always visible */}
        <div className="mb-6 pt-2">
          <Button onClick={() => navigate('/')} variant="outline" size="lg" className="flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-400 font-semibold px-6 shadow-sm py-[15px] my-[36px] mx-[15px] text-zinc-950">
            <ArrowLeft className="h-5 w-5" />
            ← Voltar ao Início
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          
        </div>

        {/* Status Card */}
        

        {/* Provider Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Prestador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base text-gray-900">{serviceProviderData.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Categoria</p>
                <Badge variant="secondary" className="mt-1">
                  {serviceProviderData.category}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-sm text-gray-900">{serviceProviderData.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="text-sm text-gray-900">{serviceProviderData.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Localização
                </p>
                <p className="text-sm text-gray-900">
                  {serviceProviderData.neighborhood}, {serviceProviderData.city}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Valor Diário
                </p>
                <p className="text-sm text-gray-900">
                  R$ {serviceProviderData.daily_rate?.toFixed(2) || '0,00'}
                </p>
              </div>

              {serviceProviderData.description && <div>
                  <p className="text-sm font-medium text-gray-500">Descrição</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {serviceProviderData.description}
                  </p>
                </div>}

              {serviceProviderData.specialties && <div>
                  <p className="text-sm font-medium text-gray-500">Especialidades</p>
                  <p className="text-sm text-gray-700">
                    {serviceProviderData.specialties}
                  </p>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {serviceProviderData.status === 'approved' && <div className="space-y-3">
            <Button onClick={() => navigate('/conversas')} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3">
              <MessageCircle className="h-4 w-4 mr-2" />
              💬 Minhas Conversas
            </Button>
            
            <Button onClick={() => navigate('/servicos/todos')} variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 py-3">
              Ver Outros Prestadores
            </Button>
          </div>}

        {serviceProviderData.status === 'pending' && <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 border-2 border-orange-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Clock className="h-8 w-8 text-orange-600 animate-pulse" />
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-bold text-orange-900 mb-1">
                  ⏳ Cadastro em Análise
                </h3>
                <p className="text-sm text-orange-800 font-medium">
                  Estamos analisando seu cadastro
                </p>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3 mb-3 border border-orange-200">
                <p className="text-xs text-orange-700 leading-relaxed">
                  Nossa equipe está verificando suas informações. Este processo geralmente leva até 24 horas.
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              
              <p className="text-xs text-orange-600 mt-3 font-medium">
                🔔 Você receberá uma notificação quando houver atualizações
              </p>
            </CardContent>
          </Card>}

        {serviceProviderData.status === 'rejected' && <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-800 font-medium mb-3">
                Entre em contato para mais informações
              </p>
              <Button onClick={() => navigate('/ajuda')} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                Central de Ajuda
              </Button>
            </CardContent>
          </Card>}
      </div>

      <BottomNavigation />
    </div>;
};
export default ServiceProviderStatus;