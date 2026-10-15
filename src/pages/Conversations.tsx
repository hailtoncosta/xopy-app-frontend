import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, MoreVertical } from 'lucide-react';
import { chatService, Conversation } from '@/services/chatService';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';
import ChatModal from '@/components/chat/ChatModal';

const Conversations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      checkIfServiceProvider();
      
      // Subscribe to notifications for real-time updates
      const notificationChannel = chatService.subscribeToNotifications(user.id, (notification) => {
        if (notification.type === 'new_message') {
          // Reload conversations when new message notification arrives
          loadConversations();
        }
      });
      
      return () => {
        if (notificationChannel) {
          notificationChannel.unsubscribe();
        }
      };
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Verificar se é prestador de serviço
      const isProvider = await chatService.isServiceProvider({ id: user.id } as any);
      setIsServiceProvider(isProvider);
      
      console.log('Usuário é prestador:', isProvider);
      console.log('User ID:', user.id);
      
      // Carregar conversas apropriadas
      const userConversations = isProvider 
        ? await chatService.getServiceProviderConversations({ id: user.id } as any)
        : await chatService.getUserConversations({ id: user.id } as any);
      
      console.log('Conversas carregadas:', userConversations.length);
      console.log('Conversas:', userConversations);
      
      setConversations(userConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfServiceProvider = async () => {
    if (!user) return;
    
    try {
      const isProvider = await chatService.isServiceProvider({ id: user.id } as any);
      setIsServiceProvider(isProvider);
    } catch (error) {
      console.error('Erro ao verificar se é prestador:', error);
    }
  };

  const openChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    // Recarregar conversas e notificações para atualizar contadores
    loadConversations();
    
    // Disparar evento personalizado para atualizar notificações
    window.dispatchEvent(new CustomEvent('conversationRead'));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const providerName = conv.service_provider?.name?.toLowerCase() || '';
    const userName = conv.user?.name?.toLowerCase() || '';
    const lastMessage = conv.last_message?.content?.toLowerCase() || '';
    
    return providerName.includes(searchLower) || 
           userName.includes(searchLower) || 
           lastMessage.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão de voltar clicado');
                try {
                  // Navegar para a página inicial em vez de usar navigate(-1)
                  navigate('/');
                } catch (error) {
                  console.error('Erro ao navegar:', error);
                  window.location.href = '/';
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative z-20 cursor-pointer"
              type="button"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-black">Conversas</h1>
              <p className="text-sm text-gray-500">
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? 'Tente buscar por outro termo'
                : isServiceProvider 
                  ? 'Quando alguém iniciar uma conversa com você, ela aparecerá aqui'
                  : 'Inicie uma conversa com um prestador de serviços para começar'
              }
            </p>
            {!searchTerm && !isServiceProvider && (
              <button
                onClick={() => navigate('/service-providers')}
                className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Encontrar Prestadores
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              const displayName = isServiceProvider 
                ? conversation.user?.name || 'Cliente'
                : conversation.service_provider?.name || 'Prestador';
              
              const displayAvatar = '/placeholder.svg';
              const hasUnread = (conversation.unread_count || 0) > 0;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => openChat(conversation)}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          hasUnread ? 'text-black font-bold' : 'text-gray-900'
                        }`}>
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conversation.last_message_at && (
                            <span className={`text-xs ${
                              hasUnread ? 'text-orange-600 font-medium' : 'text-gray-500'
                            }`}>
                              {formatTime(conversation.last_message_at)}
                            </span>
                          )}
                          {hasUnread && (
                            <div className="bg-orange-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Last message */}
                      {conversation.last_message && (
                        <div className="flex items-center gap-1">
                          {conversation.last_message.sender_type === (isServiceProvider ? 'service_provider' : 'user') && (
                            <span className="text-gray-400 text-sm">Você:</span>
                          )}
                          <p className={`text-sm truncate ${
                            hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                          }`}>
                            {conversation.last_message.content}
                          </p>
                        </div>
                      )}
                      
                      {/* Service category for service providers */}
                      {!isServiceProvider && conversation.service_provider?.category && (
                        <p className="text-xs text-orange-600 mt-1">
                          {conversation.service_provider.category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={closeChat}
          conversation={selectedConversation}
          serviceProviderName={selectedConversation.service_provider?.name}
          isServiceProvider={isServiceProvider}
        />
      )}
    </div>
  );
};

export default Conversations;