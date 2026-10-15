import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { chatService, Conversation, Message } from '@/services/chatService';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  serviceProviderName?: string;
  serviceProviderAvatar?: string;
  isServiceProvider?: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversation,
  serviceProviderName,
  serviceProviderAvatar,
  isServiceProvider = false
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const sendLockRef = useRef(false);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar mensagens da conversa
  useEffect(() => {
    if (isOpen && conversation?.id && user) {
      loadMessages();
      subscribeToMessages();
      // Marcar mensagens como lidas quando o chat é aberto
      markMessagesAsRead();
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe?.();
        } finally {
          channelRef.current = null;
        }
      }
    };
  }, [isOpen, conversation?.id, user]);

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation?.id) return;
    
    setIsLoading(true);
    try {
      const conversationMessages = await chatService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversation?.id || !user) return;
    
    try {
      console.log('🔵 Marcando mensagens e notificações como lidas:', {
        conversationId: conversation.id,
        userId: user.id
      });
      
      // Marcar mensagens como lidas
      await chatService.markMessagesAsRead(conversation.id, { id: user.id } as any);
      
      // Marcar notificações relacionadas à conversa como lidas
      const notificationsMarked = await chatService.markConversationNotificationsAsRead(conversation.id, user.id);
      
      if (notificationsMarked) {
        console.log('✅ Notificações da conversa marcadas como lidas');
      } else {
        console.log('⚠️ Falha ao marcar notificações como lidas');
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!conversation?.id) return;

    channelRef.current = chatService.subscribeToConversation(
      conversation.id,
      (incoming: Message) => {
        // Guard extra: nunca renderizar mensagem de outra conversa (protege mesmo se o realtime vier “sujo”)
        if (incoming.conversation_id !== conversation.id) {
          console.warn('⚠️ Mensagem ignorada (conversation_id diferente):', {
            expected: conversation.id,
            received: incoming.conversation_id,
          });
          return;
        }

        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === incoming.id);
          if (messageExists) return prev;
          return [...prev, incoming];
        });

        if (incoming.sender_id !== user?.id) {
          markMessagesAsRead();
        }

        scrollToBottom();
      }
    );
  };

  const sendMessage = async () => {
    // Lock síncrono (evita “double tap”/Enter+click antes do setState surtir efeito)
    if (sendLockRef.current) return;

    if (!newMessage.trim() || !conversation?.id || !user) return;

    sendLockRef.current = true;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const senderType = isServiceProvider ? 'service_provider' : 'user';

      console.log('📤 Enviando mensagem:', {
        conversationId: conversation.id,
        userId: user.id,
        senderType,
        isServiceProvider
      });

      const sentMessage = await chatService.sendMessage(
        conversation.id,
        user.id,
        senderType,
        messageContent
      );

      if (sentMessage) {
        // Adicionar mensagem imediatamente ao estado local (evitar duplicatas)
        setMessages(prev => {
          const exists = prev.some(m => m.id === sentMessage.id);
          if (exists) return prev;
          return [...prev, sentMessage];
        });
        scrollToBottom();
      } else {
        console.error('❌ Mensagem retornou null');
        toast.error('Não foi possível enviar a mensagem. Tente novamente.');
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast.error('Erro de conexão. Verifique sua internet.');
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
      sendLockRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Agrupar mensagens por data
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (!isOpen) return null;

  const displayName = isServiceProvider 
    ? (conversation?.user?.name || 'Cliente') 
    : (serviceProviderName || conversation?.service_provider?.name || 'Prestador');
  
  const displayAvatar = serviceProviderAvatar || '/placeholder.svg';
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-black">{displayName}</h3>
              <p className="text-sm text-green-600">● Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(dayMessages[0].created_at)}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dayMessages.map((message) => {
                  const isOwnMessage = isServiceProvider 
                    ? message.sender_type === 'service_provider'
                    : message.sender_type === 'user';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-orange-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-black rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1`}>
                          <p className={`text-xs ${
                            isOwnMessage ? 'text-orange-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                          {isOwnMessage && (
                            <div className={`text-xs ${
                              message.is_read ? 'text-orange-200' : 'text-orange-300'
                            }`}>
                              {message.is_read ? '✓✓' : '✓'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">👋</p>
                <p className="text-sm">Inicie a conversa enviando uma mensagem!</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1 p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white resize-none min-h-[48px] max-h-[120px]"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '48px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;