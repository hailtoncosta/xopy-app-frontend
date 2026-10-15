import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageCircle, User, Trash2, Check, CheckCheck } from 'lucide-react';
import { chatService, ChatNotification } from '@/services/chatService';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Subscribe to real-time notifications
      const notificationChannel = chatService.subscribeToNotifications(user.id, (newNotification) => {
        console.log('Nova notificação recebida:', newNotification);
        setNotifications(prev => {
          // Verificar se a notificação já existe
          const exists = prev.some(notif => notif.id === newNotification.id);
          if (exists) {
            return prev;
          }
          return [newNotification, ...prev];
        });
      });
      
      return () => {
        if (notificationChannel) {
          notificationChannel.unsubscribe();
        }
      };
    }
  }, [user]);
  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userNotifications = await chatService.getUserNotifications({ id: user.id } as any);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await chatService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) return;

    setIsMarkingAllRead(true);
    try {
      // Marcar todas as notificações não lidas como lidas
      await Promise.all(
        unreadNotifications.map(n => chatService.markNotificationAsRead(n.id))
      );
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar todas como lidas');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleNotificationClick = async (notification: ChatNotification) => {
    // Marcar como lida se não estiver lida
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.type === 'rental_request_approved') navigate('/solicitacoes-aluguel?view=sent');

    // Navegar para a conversa se for notificação de chat
    if (notification.type === 'new_message' || notification.type === 'conversation_started') {
      navigate('/conversas');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} min atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return days === 1 ? 'Ontem' : `${days} dias atrás`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return MessageCircle;
      case 'conversation_started':
        return User;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_message':
        return 'bg-orange-100 text-orange-600';
      case 'conversation_started':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center pr-6">
          <h2 className="text-black text-lg font-bold">Notificações</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} não lida{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="bg-white border-b border-gray-200 p-4">
          <button
            onClick={markAllAsRead}
            disabled={isMarkingAllRead}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
          >
            {isMarkingAllRead ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                Marcando...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-500 text-sm">
              Quando houver atividade em suas conversas, você verá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'border-l-4 border-l-orange-500 bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          !notification.is_read ? 'text-gray-900 font-semibold' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm truncate ${
                        !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            <Check className="h-3 w-3" />
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      {!user && (
        <div className="mt-6 mx-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium text-sm">Faça login</p>
              <p className="text-blue-700 text-sm">
                Para ver suas notificações, faça login em sua conta.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="mt-2 text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Notifications;