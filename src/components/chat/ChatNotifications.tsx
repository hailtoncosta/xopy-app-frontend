import { usePendingProviders } from '@/hooks/usePendingProviders';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, ChevronRight, Sparkles } from 'lucide-react';
import { chatService, ChatNotification } from '@/services/chatService';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';
import { usePendingRentals } from '@/hooks/usePendingRentals';
import xopyLogo from '@/assets/xopy-logo.png';
interface ChatNotificationsProps {
  className?: string;
  showBadge?: boolean;
}
const ChatNotifications: React.FC<ChatNotificationsProps> = ({
  className = '',
  showBadge = true
}) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const pendingRentals = usePendingRentals();
  const pendingProviders = usePendingProviders();

  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const badgeCount = unreadCount + pendingRentals + pendingProviders;
  useEffect(() => {
    if (!user) return;

    loadNotifications();
    const channel = subscribeToNotifications();

    const handleConversationRead = () => {
      console.log('🔄 Conversa lida, recarregando notificações...');
      loadNotifications();
    };

    window.addEventListener('conversationRead', handleConversationRead);

    return () => {
      window.removeEventListener('conversationRead', handleConversationRead);
      // IMPORTANT: evitar canais duplicados (isso causava eventos duplicados)
      channel?.unsubscribe?.();
    };
  }, [user]);
  const loadNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userNotifications = await chatService.getUserNotifications({
        id: user.id
      } as any);
      const chatNotifications = userNotifications.filter(n => n.type === 'new_message' || n.type === 'conversation_started');
      console.log('📬 Notificações carregadas:', {
        total: userNotifications.length,
        chat: chatNotifications.length,
        unread: chatNotifications.filter(n => !n.is_read).length
      });
      setNotifications(chatNotifications);
      const unread = chatNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const subscribeToNotifications = () => {
    if (!user) return null;

    const channel = chatService.subscribeToNotifications(user.id, (notification: ChatNotification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (notification.type === 'new_message') {
        toast.success(notification.title, {
          description: notification.message,
          action: {
            label: "Ver",
            onClick: () => {
              navigate('/conversas');
              setShowNotifications(false);
            }
          }
        });
      }
    });

    return channel;
  };
  const markAsRead = async (notificationId: string) => {
    try {
      await chatService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? {
        ...n,
        is_read: true
      } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };
  const handleNotificationClick = async (notification: ChatNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigate(notification.type === 'rental_request_approved' ? '/solicitacoes-aluguel?view=sent' : '/conversas');
    setShowNotifications(false);
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffInMinutes < 1) {
      return 'Agora';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };
  if (!user) return null;
  return <div className={`relative ${className}`} style={{
    overflow: 'visible'
  }}>
      {/* Notification Button */}
      <button onClick={() => setShowNotifications(!showNotifications)} aria-label={`Mensagens e avisos: ${pendingProviders} prestadores e ${pendingRentals} equipamentos aguardando aprovação`} aria-expanded={showNotifications} className="relative p-2 hover:bg-orange-700 rounded-full transition-colors">
        <MessageCircle className="h-6 w-6 text-white" />
        {showBadge && badgeCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold animate-pulse">
            {badgeCount > 99 ? '99+' : badgeCount}
          </div>}
      </button>

      {/* Notifications Modal */}
      {showNotifications && <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:bg-transparent sm:backdrop-blur-none" onClick={() => setShowNotifications(false)} />
          
          {/* Modal */}
          <div className="fixed sm:absolute inset-x-4 top-16 bottom-auto sm:top-full sm:right-0 sm:left-auto sm:inset-x-auto sm:mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col max-h-[75vh] sm:max-h-[500px] overflow-hidden animate-scale-in">
            
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 relative overflow-hidden py-[28px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <img src={xopyLogo} alt="Xopy" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Mensagens</h3>
                    {unreadCount > 0 && <p className="text-orange-100 text-xs">
                        {unreadCount} {unreadCount === 1 ? 'nova mensagem' : 'novas mensagens'}
                      </p>}
                  </div>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {pendingProviders > 0 && <button onClick={() => {navigate('/admin/service-providers?status=pending');setShowNotifications(false);}} className="flex w-full items-center gap-3 border-b border-orange-200 bg-orange-50 p-4 text-left hover:bg-orange-100"><Sparkles className="h-6 w-6 shrink-0 text-orange-600"/><div className="flex-1"><p className="font-semibold text-orange-900">Prestadores de serviços para aprovação</p><p className="text-sm text-orange-800">{pendingProviders} {pendingProviders===1?'prestador aguardando aprovação':'prestadores aguardando aprovação'}</p></div><ChevronRight className="h-5 w-5 text-orange-600"/></button>}
            {pendingRentals > 0 && <button onClick={() => { navigate('/admin/rental-equipment'); setShowNotifications(false); }} className="flex w-full items-center gap-3 border-b border-orange-200 bg-orange-50 p-4 text-left hover:bg-orange-100">
              <Sparkles className="h-6 w-6 shrink-0 text-orange-600" />
              <div className="flex-1"><p className="font-semibold text-orange-900">Equipamentos para alugar</p><p className="text-sm text-orange-800">{pendingRentals} {pendingRentals === 1 ? 'equipamento aguardando aprovação' : 'equipamentos aguardando aprovação'}</p></div>
              <ChevronRight className="h-5 w-5 text-orange-600" />
            </button>}
            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent"></div>
                  </div>
                  <p className="text-gray-500 text-sm">Carregando...</p>
                </div> : notifications.length === 0 ? <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <MessageCircle className="h-10 w-10 text-orange-400" />
                  </div>
                  <h4 className="text-gray-800 font-semibold mb-1">Nenhuma mensagem</h4>
                  <p className="text-gray-500 text-sm text-center">
                    Suas conversas aparecerão aqui
                  </p>
                </div> : <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => <div key={notification.id} onClick={() => handleNotificationClick(notification)} className={`p-4 cursor-pointer transition-all duration-200 hover:bg-orange-50/50 group ${!notification.is_read ? 'bg-gradient-to-r from-orange-50/80 to-transparent' : ''}`} style={{
              animationDelay: `${index * 50}ms`
            }}>
                      <div className="flex items-start gap-3">
                        {/* Avatar/Icon */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${notification.type === 'new_message' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                            <img src={xopyLogo} alt="" className="w-7 h-7 object-contain brightness-0 invert" />
                          </div>
                          {!notification.is_read && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Sparkles className="w-2 h-2 text-white" />
                            </div>}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm line-clamp-2 ${!notification.is_read ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                            {notification.message}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>)}
                </div>}
            </div>

            {/* Footer */}
            {notifications.length > 0 && <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <button onClick={() => {
            navigate('/conversas');
            setShowNotifications(false);
          }} className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Ver todas as conversas
                </button>
              </div>}
          </div>
        </>}
    </div>;
};
export default ChatNotifications;