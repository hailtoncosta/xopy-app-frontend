import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getNotifications, getUnreadCount, Notification } from '@/services/notificationService';

// Função para tocar som de notificação - "ding" curto e sutil
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Primeiro tom (principal) - nota mais alta
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 1200; // Frequência do "ding"
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.25, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.4);

    // Segundo tom (harmônico) - leve reverberação
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1800; // Harmônico superior
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
    osc2.start(audioContext.currentTime);
    osc2.stop(audioContext.currentTime + 0.25);
  } catch (error) {
    console.error('Erro ao tocar som de notificação:', error);
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado, pulando subscription');
        return;
      }

      console.log('🔔 Configurando subscription de notificações para usuário:', user.id);

      // Realtime subscription - escutar apenas notificações do usuário atual
      channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 Nova notificação recebida:', payload.new);
            // Tocar som de notificação
            playNotificationSound();
            // Adicionar nova notificação ao estado
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 Notificação atualizada:', payload.new);
            const updated = payload.new as Notification;
            
            // Atualizar notificação no estado
            setNotifications(prev => 
              prev.map(n => n.id === updated.id ? updated : n)
            );
            
            // Atualizar contador se foi marcada como lida
            if (updated.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 Notificação deletada:', payload.old);
            const deleted = payload.old as Notification;
            
            // Remover do estado
            setNotifications(prev => prev.filter(n => n.id !== deleted.id));
            
            // Atualizar contador se estava não lida
            if (!deleted.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Status da subscription de notificações:', status);
        });
    };

    loadNotifications();
    loadUnreadCount();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      // Filtrar apenas notificações recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentNotifications = data.filter(notification => {
        const notificationDate = new Date(notification.created_at);
        return notificationDate > thirtyDaysAgo;
      });
      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contador:', error);
    }
  };

  const refresh = () => {
    loadNotifications();
    loadUnreadCount();
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
  };
};
