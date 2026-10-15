import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  action_url?: string;
}

/**
 * Cria uma nova notificação
 */
export const createNotification = async (notificationData: CreateNotificationData) => {
  try {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

/**
 * Busca notificações do usuário
 */
export const getNotifications = async (limit: number = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }

    return data as Notification[];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};

/**
 * Busca quantidade de notificações não lidas
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao buscar contador:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erro ao buscar contador:', error);
    return 0;
  }
};

/**
 * Marca notificação como lida
 */
export const markAsRead = async (notificationId: string) => {
  try {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    throw error;
  }
};

/**
 * Marca todas as notificações como lidas
 */
export const markAllAsRead = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await (supabase as any)
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    throw error;
  }
};

/**
 * Deleta uma notificação
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    throw error;
  }
};
