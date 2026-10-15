import { useEffect, useRef } from 'react';
import { X, Check, Trash2, Loader2, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { markAsRead, markAllAsRead, deleteNotification } from '@/services/notificationService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList = ({ onClose }: NotificationListProps) => {
  const { notifications, loading, refresh } = useNotifications();
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Update otimista - atualizar UI imediatamente
      const notificationToUpdate = notifications.find(n => n.id === notificationId);
      if (notificationToUpdate && !notificationToUpdate.is_read) {
        // Atualizar localmente antes da chamada do servidor
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        // Forçar re-render com nova referência
        refresh();
      }
      
      await markAsRead(notificationId);
      refresh();
    } catch (error) {
      toast.error('Erro ao marcar como lida');
      refresh(); // Reverter em caso de erro
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Update otimista
      refresh();
      
      await markAllAsRead();
      toast.success('Todas marcadas como lidas');
      refresh();
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas');
      refresh();
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      refresh();
      toast.success('Notificação removida');
    } catch (error) {
      toast.error('Erro ao remover notificação');
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
      case 'payment_approved':
        return '💰';
      case 'product_sold':
        return '🎉';
      case 'product_purchased':
        return '🛍️';
      case 'order_created':
        return '📦';
      case 'payment_rejected':
        return '❌';
      case 'order_cancelled':
        return '🚫';
      case 'order_refunded':
        return '🔄';
      default:
        return '🔔';
    }
  };

  return (
    <div
      ref={listRef}
      className="absolute right-0 top-12 w-96 max-w-[calc(100vw-1rem)] max-h-[min(600px,75dvh)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-orange-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="h-2 w-2 bg-orange-600 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              navigate('/notificacoes');
              onClose();
            }}
            className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Ver todas as notificações
          </button>
        </div>
      )}
    </div>
  );
};
