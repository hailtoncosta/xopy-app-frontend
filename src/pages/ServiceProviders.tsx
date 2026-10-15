import { CurrencyInput } from '@/components/ui/currency-input';
import { MaskedInput } from '@/components/ui/masked-input';
import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Star, MessageCircle, Phone, Mail, Clock, User, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks';
import { AuthService } from '@/services/authService';
import { useServiceProviderAuth } from '@/hooks/useServiceProviderAuth';
import { serviceProviderAuthService } from '@/services/serviceProviderAuthService';
import { chatService } from '@/services/chatService';
import ChatModal from '@/components/chat/ChatModal';
import { serviceProviderService } from '@/services/serviceProviderService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  city: string;
  neighborhood: string;
  address: string;
  experience: string;
  daily_rate: number;
  specialties?: string;
}

import { Conversation } from '@/services/chatService';

interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  category: string;
  experience: string;
  dailyRate: number;
  city: string;
  neighborhood: string;
  address: string;
  description: string;
  specialties: string;
  password: string;
}

const ServiceProviders = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { user, register } = useAuth();
  const { isServiceProvider, serviceProviderData } = useServiceProviderAuth();

  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(serviceId || 'todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    phone: '',
    email: '',
    category: 'pedreiro',
    experience: 'iniciante',
    dailyRate: 0,
    city: '',
    neighborhood: '',
    address: '',
    description: '',
    specialties: '',
    password: ''
  });

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'pedreiro', name: 'Pedreiro' },
    { id: 'pintor', name: 'Pintor' },
    { id: 'eletricista', name: 'Eletricista' },
    { id: 'encanador', name: 'Encanador' },
    { id: 'engenheiro', name: 'Engenheiro' },
    { id: 'arquiteto', name: 'Arquiteto' },
    { id: 'marceneiro', name: 'Marceneiro' },
    { id: 'jardineiro', name: 'Jardineiro' }
  ];

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedCategory]);

  useEffect(() => {
    if (serviceId) {
      setSelectedCategory(serviceId);
    }
  }, [serviceId]);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      // Buscar todos os prestadores aprovados
      const data = await serviceProviderService.getAllApprovedServiceProviders();
      
      const mappedProviders = data.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        description: provider.description || '',
        rating: 4.5,
        city: provider.city,
        neighborhood: provider.neighborhood,
        address: provider.address,
        experience: provider.experience,
        daily_rate: provider.daily_rate,
        specialties: provider.specialties,
        category: provider.category,
        phone: provider.phone,
        email: provider.email,
        status: provider.status
      }));

      setProviders(mappedProviders);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      toast.error('Erro ao carregar prestadores');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(provider => provider.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  const handleChatOpen = async (provider: ServiceProvider) => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar uma conversa');
      navigate('/auth');
      return;
    }

    // Verificar se o usuário está tentando conversar consigo mesmo
    if (isServiceProvider && serviceProviderData?.id === provider.id) {
      toast.error('Você não pode iniciar uma conversa consigo mesmo');
      return;
    }

    setSelectedProvider(provider);
    setIsStartingChat(true);

    try {
      // Criar ou buscar conversa existente
      const conversationId = await chatService.getOrCreateConversation({ id: user.id } as any, provider.id);
      
      if (conversationId) {
        setCurrentConversation({ id: conversationId } as any);
        setIsChatOpen(true);
        toast.success('Conversa iniciada!');
      } else {
        toast.error('Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast.error('Erro ao iniciar conversa');
    } finally {
      setIsStartingChat(false);
    }
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedProvider(null);
    setCurrentConversation(null);
  };

  const handleRegistration = async () => {
    if (!registrationData.name.trim() || !registrationData.email.trim() || registrationData.password.length < 8) {
      toast.error('Informe nome completo, email e uma senha com pelo menos 8 caracteres.');
      return;
    }
    try {
      setIsRegistering(true);
      const result = await register({name: registrationData.name.trim(), email: registrationData.email.trim(), password: registrationData.password, type: 'service_provider'});
      if (!result.success) { toast.error(result.message || 'Não foi possível criar a conta'); return; }
      toast.success('Conta criada! Conclua seu cadastro de prestador.');
      setIsModalOpen(false);
      // Resetar formulário
      setRegistrationData({
        name: '',
        phone: '',
        email: '',
        category: 'pedreiro',
        experience: 'iniciante',
        dailyRate: 0,
        city: '',
        neighborhood: '',
        address: '',
        description: '',
        specialties: '',
        password: ''
      });

      // Fechar modal
      setIsModalOpen(false);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro interno no sistema. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const renderProviderCard = (provider: ServiceProvider) => (
    <div key={provider.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 mb-4 transform hover:-translate-y-1">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{provider.name}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium capitalize">
                {provider.category}
              </span>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-300 fill-current mr-1" />
                <span className="text-white text-sm font-semibold">{provider.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Descrição */}
        {provider.description && (
          <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2">
            {provider.description}
          </p>
        )}

        {/* Informações em grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Localização</p>
              <p className="text-sm text-gray-900 font-semibold truncate">{provider.city} - {provider.neighborhood}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Diária</p>
                <p className="text-sm text-gray-900 font-bold">R$ {provider.daily_rate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Experiência</p>
                <p className="text-sm text-gray-900 font-semibold capitalize truncate">{provider.experience}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        {provider.specialties && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold mb-1">Especialidades</p>
            <p className="text-sm text-gray-800 leading-relaxed">{provider.specialties}</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 mt-4">
          {/* Verificar se é o próprio prestador para desabilitar o chat */}
          {isServiceProvider && serviceProviderData?.id === provider.id ? (
            <Button
              disabled
              className="flex-1 bg-gray-400 text-white cursor-not-allowed h-12 rounded-xl font-semibold"
            >
              <User className="h-5 w-5 mr-2" />
              Seu Perfil
            </Button>
          ) : (
            <Button
              onClick={() => handleChatOpen(provider)}
              disabled={isStartingChat}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {isStartingChat && selectedProvider?.id === provider.id ? 'Iniciando...' : 'Conversar'}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Header />
      
      {/* Main Content */}
      <div className="p-4 pb-24 pt-[104px] sm:pt-20">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                console.log('Back button clicked');
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">Prestadores de Serviços</h1>
              <p className="text-orange-100 text-sm font-medium">
                {filteredProviders.length} prestador{filteredProviders.length !== 1 ? 'es' : ''} disponíve{filteredProviders.length !== 1 ? 'is' : 'l'}
              </p>
            </div>
          </div>
          
          {/* Só mostrar botão de cadastro se não for prestador aprovado */}
          {!(isServiceProvider && serviceProviderData?.status === 'approved') && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className={`w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold h-12 rounded-xl shadow-lg ${
                isServiceProvider && serviceProviderData?.status === 'pending' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              disabled={isServiceProvider && serviceProviderData?.status === 'pending'}
            >
              <Plus className="h-5 w-5 mr-2" />
              {isServiceProvider && serviceProviderData?.status === 'pending' 
                ? 'Aguardando Aprovação' 
                : 'Cadastrar como Prestador'
              }
            </Button>
          )}
        </div>

        {/* Status do usuário como prestador */}
        {isServiceProvider && serviceProviderData && (
          <div className="mb-6 p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                {/* Status do prestador */}
                {serviceProviderData.status === 'approved' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}
                {serviceProviderData.status === 'pending' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                )}
                {serviceProviderData.status === 'rejected' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                
                {/* Mensagem de status - apenas para pending e rejected */}
                {serviceProviderData.status !== 'approved' && (
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {serviceProviderData.status === 'pending' && 'Seu cadastro está em análise'}
                      {serviceProviderData.status === 'rejected' && 'Cadastro rejeitado'}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {serviceProviderData.status === 'pending' && 'Aguarde a aprovação para aparecer na listagem de prestadores.'}
                      {serviceProviderData.status === 'rejected' && 'Entre em contato conosco para mais informações sobre seu cadastro.'}
                    </p>
                  </div>
                )}
                
                {/* Botão para prestadores aprovados */}
                {serviceProviderData.status === 'approved' && (
                  <div className="flex-1">
                    <Button
                      onClick={() => navigate('/conversas')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      💬 Minhas Conversas
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search com ícone */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nome, categoria ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories com scroll horizontal melhorado */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorias</h3>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Providers List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Carregando prestadores...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum prestador encontrado
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'todos'
                ? 'Tente ajustar os filtros de busca ou escolher outra categoria'
                : 'Seja o primeiro a se cadastrar e oferecer seus serviços!'
              }
            </p>
            {!(isServiceProvider && serviceProviderData?.status === 'approved') && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold px-8 h-12 rounded-xl shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar como Prestador
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredProviders.map(renderProviderCard)}
          </div>
        )}
      </div>

      <BottomNavigation />

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cadastro de Prestador</h2>
              
              <div className="space-y-4">
                {/* Dados Pessoais */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <Input
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <Input
                    type="password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha para login no app"
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta senha será usada para fazer login no aplicativo
                  </p>
                </div>


              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {isRegistering ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedProvider && currentConversation && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={closeChatModal}
          conversation={currentConversation}
          serviceProviderName={selectedProvider.name}
          isServiceProvider={false}
        />
      )}
    </div>
  );
};

export default ServiceProviders;