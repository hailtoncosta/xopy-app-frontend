import { supabase } from '@/integrations/supabase/client';
import { User } from '@/integrations/api/client';

export interface Conversation {
  id: string;
  user_id: string;
  service_provider_id: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  service_provider?: {
    id: string;
    name: string;
    avatar?: string;
    category: string;
  };
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  last_message?: {
    content: string;
    sender_type: 'user' | 'service_provider';
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'service_provider';
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

export interface ChatNotification {
  id: string;
  user_id: string;
  type: 'new_message' | 'conversation_started' | 'conversation_closed' | 'rental_request_approved';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  conversation_id?: string;
}

export const chatService = {
  // Verificar se o usuário é prestador de serviço
  async isServiceProvider(user: User): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar prestador de serviço:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro no isServiceProvider:', error);
      return false;
    }
  },

  // Criar ou buscar conversa existente
  async getOrCreateConversation(user: User, serviceProviderId: string): Promise<string | null> {
    try {
      // Primeiro verificar se já existe uma conversa
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_provider_id', serviceProviderId)
        .eq('status', 'active')
        .maybeSingle();

      if (searchError) {
        console.error('Erro ao buscar conversa existente:', searchError);
        return null;
      }

      if (existingConversation) {
        return existingConversation.id;
      }

      // Criar nova conversa
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          service_provider_id: serviceProviderId,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Erro ao criar conversa:', createError);
        return null;
      }

      return newConversation.id;
    } catch (error) {
      console.error('Erro no getOrCreateConversation:', error);
      return null;
    }
  },

  // Buscar conversas do usuário
  async getUserConversations(user: User): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user_id,
          service_provider_id,
          status,
          last_message_at,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversas do usuário:', error);
        return [];
      }

      // Buscar dados dos prestadores e mensagens separadamente
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          // Buscar dados do prestador
          const { data: serviceProvider } = await supabase
            .from('service_providers')
            .select(`
              id,
              user_profiles!service_providers_user_id_fkey(
                full_name,
                avatar_url
              ),
              category
            `)
            .eq('id', conv.service_provider_id)
            .single();

          // Buscar mensagens da conversa
          const { data: messages } = await supabase
            .from('messages')
            .select('content, sender_type, created_at, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false });

          return {
            ...conv,
            service_provider: serviceProvider,
            messages: messages || []
          };
        })
      );

      // Processar dados para incluir última mensagem e contagem de não lidas
      const processedConversations = conversationsWithDetails?.map(conv => {
        const messages = conv.messages || [];
        const sortedMessages = messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;
        const unreadCount = messages.filter(msg => 
          !msg.is_read && msg.sender_type === 'service_provider'
        ).length;

        return {
          ...conv,
          status: conv.status as 'active' | 'archived' | 'closed',
          service_provider: {
            id: conv.service_provider?.id,
            name: (conv.service_provider?.user_profiles as any)?.[0]?.full_name,
            avatar: (conv.service_provider?.user_profiles as any)?.[0]?.avatar_url,
            category: conv.service_provider?.category
          },
          last_message: lastMessage,
          unread_count: unreadCount
        };
      }) || [];

      return processedConversations as Conversation[];
    } catch (error) {
      console.error('Erro no getUserConversations:', error);
      return [];
    }
  },

  // Buscar conversas do prestador de serviço
  async getServiceProviderConversations(user: User): Promise<Conversation[]> {
    try {
      // Primeiro buscar o service_provider_id do usuário
      const { data: serviceProviders, error: spError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (spError || !serviceProviders || serviceProviders.length === 0) {
        console.error('Usuário não é prestador de serviço aprovado:', spError);
        return [];
      }

      const serviceProviderIds = serviceProviders.map(sp => sp.id);
      console.log('Service Provider IDs encontrados:', serviceProviderIds);

      // Buscar conversas para todos os service_provider_ids do usuário
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .in('service_provider_id', serviceProviderIds)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversas do prestador:', error);
        return [];
      }

      console.log('Conversas brutas encontradas para prestador:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('Nenhuma conversa encontrada');
        return [];
      }

      // Buscar dados dos usuários e mensagens separadamente
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          // Buscar dados do usuário
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', conv.user_id)
            .single();

          // Buscar mensagens da conversa
          const { data: messages } = await supabase
            .from('messages')
            .select('content, sender_type, created_at, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false });

          return {
            ...conv,
            user_profiles: userProfile,
            messages: messages || []
          };
        })
      );

      // Processar dados para incluir última mensagem e contagem de não lidas
      const processedConversations = conversationsWithDetails?.map(conv => {
        const messages = conv.messages || [];
        const sortedMessages = messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;
        const unreadCount = messages.filter(msg => 
          !msg.is_read && msg.sender_type === 'user'
        ).length;

        console.log(`Conversa ${conv.id}: ${messages.length} mensagens, ${unreadCount} não lidas`);

        return {
          ...conv,
          user: {
            id: conv.user_profiles?.id,
            name: conv.user_profiles?.full_name || 'Cliente',
            avatar: conv.user_profiles?.avatar_url
          },
          last_message: lastMessage,
          unread_count: unreadCount
        };
      }) || [];

      console.log('Conversas processadas:', processedConversations.length);

      return processedConversations.map(c => ({
        ...c,
        status: c.status as 'active' | 'archived' | 'closed'
      })) as Conversation[];
    } catch (error) {
      console.error('Erro no getServiceProviderConversations:', error);
      return [];
    }
  },

  // Buscar mensagens de uma conversa
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return [];
      }

      return (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'service_provider',
        message_type: msg.message_type as 'text'
      })) as Message[];
    } catch (error) {
      console.error('Erro no getConversationMessages:', error);
      return [];
    }
  },

  // Marcar conversa como lida
  async markConversationAsRead(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) {
        console.error('Erro ao marcar conversa como lida:', error);
        return false;
      }

      // Marcar todas as mensagens da conversa como lidas
      const { error: messagesError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId);

      if (messagesError) {
        console.error('Erro ao marcar mensagens como lidas:', messagesError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no markConversationAsRead:', error);
      return false;
    }
  },

  // Marcar mensagens específicas como lidas
  async markMessagesAsRead(conversationId: string, user: { id: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id); // Não marcar as próprias mensagens

      if (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no markMessagesAsRead:', error);
      return false;
    }
  },

  // Enviar mensagem
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'service_provider',
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<Message | null> {
    try {
      console.log('📨 Tentando enviar mensagem (via edge function):', {
        conversationId,
        senderId,
        senderType,
        contentLength: content.length,
      });

      // Preferência: server-side (evita RLS bloqueando lookup do prestador e garante push)
      const { data: fnData, error: fnError } = await supabase.functions.invoke('chat-send-message', {
        body: { conversationId, content, messageType },
      });

      if (!fnError && fnData?.message) {
        const msg = fnData.message as Message;
        return {
          ...msg,
          sender_type: msg.sender_type as 'user' | 'service_provider',
          message_type: (msg as any).message_type as any,
        } as Message;
      }

      if (fnError) {
        console.warn('⚠️ chat-send-message falhou, tentando fallback client-side:', {
          message: fnError.message,
          details: (fnError as any).details,
        });
      }

      // Fallback (mantém compatibilidade): fluxo antigo client-side
      console.log('📨 Fallback: enviando mensagem via insert direto');

      // Verificar se a conversa existe e está ativa
      const { data: conversationCheck, error: convCheckError } = await supabase
        .from('conversations')
        .select('id, user_id, service_provider_id, status')
        .eq('id', conversationId)
        .single();

      if (convCheckError || !conversationCheck) {
        console.error('❌ Conversa não encontrada:', convCheckError);
        return null;
      }

      // Inserir mensagem
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          content,
          message_type: messageType,
          is_read: false,
        })
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erro ao inserir mensagem:', error);
        return null;
      }

      // Atualizar timestamp da conversa (não bloquear se falhar)
      supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .then(({ error: updateError }) => {
          if (updateError) console.warn('⚠️ Erro ao atualizar timestamp da conversa:', updateError);
        });

      // Disparar push notification para o destinatário da conversa (não bloquear)
      this.sendPushNotification(conversationId, senderId, senderType, content).catch((err) => {
        console.error('❌ Erro ao enviar push:', err);
      });

      return {
        ...data,
        sender_type: data.sender_type as 'user' | 'service_provider',
        message_type: data.message_type as any,
      } as Message;
    } catch (error) {
      console.error('❌ Erro crítico no sendMessage:', error);
      return null;
    }
  },

  // Enviar push notification separadamente
  async sendPushNotification(
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'service_provider',
    content: string
  ): Promise<void> {
    try {
      console.log('🔔 Preparando push notification...');

      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('user_id, service_provider_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        console.warn('⚠️ Não foi possível obter dados da conversa para push');
        return;
      }

      // Regra robusta (não depender do senderType vindo da UI)
      // Se o senderId é o user_id da conversa, o destinatário é o prestador; caso contrário, o destinatário é o cliente.
      const senderIsConversationUser = senderId === (conv.user_id as string);

      let recipientUserId: string | null = null;

      if (senderIsConversationUser) {
        const { data: sp, error: spErr } = await supabase
          .from('service_providers')
          .select('user_id')
          .eq('id', conv.service_provider_id)
          .single();

        if (spErr) {
          console.warn('⚠️ Falha ao buscar user_id do prestador para push:', spErr);
          return;
        }

        recipientUserId = (sp as any)?.user_id as string;
      } else {
        recipientUserId = conv.user_id as string;
      }

      if (recipientUserId) {
        const payload = {
          title: 'Nova mensagem',
          body: content.length > 50 ? content.substring(0, 50) + '...' : content,
          // IMPORTANT: do not send a fixed `tag` here, otherwise Android may collapse/replace
          // the notification and it can look like it "didn't arrive".
          url: `/conversas`,
          conversationId,
        };

        const { data, error } = await supabase.functions.invoke('push-notify', {
          body: { recipientUserId, payload },
        });

        if (error) {
          console.error('❌ push-notify retornou erro:', {
            message: error.message,
            details: (error as any).details,
          });
        } else {
          console.log('✅ Push enviado (edge function ok):', data);
        }
      }
    } catch (err) {
      console.error('❌ Erro ao preparar push:', err);
    }
  },

  // Buscar notificações do usuário
  async getUserNotifications(user: User): Promise<ChatNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
      }

      return (data || []).map(notif => ({
        ...notif,
        type: notif.type as 'new_message' | 'conversation_started' | 'conversation_closed' | 'rental_request_approved'
      })) as ChatNotification[];
    } catch (error) {
      console.error('Erro no getUserNotifications:', error);
      return [];
    }
  },

  // Marcar notificação como lida
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no markNotificationAsRead:', error);
      return false;
    }
  },

  // Marcar todas as notificações de uma conversa como lidas
  async markConversationNotificationsAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Buscar notificações relacionadas a mensagens desta conversa
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .or(`type.eq.new_message,type.eq.conversation_started`)
        .contains('data', { conversation_id: conversationId });

      if (error) {
        console.error('Erro ao marcar notificações da conversa como lidas:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no markConversationNotificationsAsRead:', error);
      return false;
    }
  },

  // Subscrever a notificações em tempo real - canal único por usuário
  subscribeToNotifications(userId: string, callback: (notification: ChatNotification) => void) {
    try {
      // Usar canal único por usuário para evitar conflitos
      const channelName = `user-notifications-${userId}`;
      console.log('🔔 Inscrevendo no canal de notificações:', channelName);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('🔔 Nova notificação recebida:', payload.new);
            const notification = payload.new as ChatNotification;
            callback(notification);
          }
        )
        .subscribe((status) => {
          console.log('🔔 Status do canal de notificações:', status);
        });

      return channel;
    } catch (error) {
      console.error('Erro ao subscrever notificações:', error);
      return null;
    }
  },

  // Subscrever a mensagens de uma conversa em tempo real - canal único por conversa
  subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    try {
      // Usar canal único por conversa com identificador único
      const channelName = `chat-messages-${conversationId}`;
      console.log('💬 Inscrevendo no canal de conversa:', channelName);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            console.log('💬 Nova mensagem recebida via realtime:', payload.new);
            const message = payload.new as Message;
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('💬 Status do canal de conversa:', status);
        });

      return channel;
    } catch (error) {
      console.error('Erro ao subscrever conversa:', error);
      return null;
    }
  },

  // Buscar prestadores de serviço disponíveis para chat
  async getAvailableServiceProviders(user: User): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          id,
          user_profiles!service_providers_user_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          category,
          description
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved');


      if (error) {
        console.error('Erro ao buscar prestadores disponíveis:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getAvailableServiceProviders:', error);
      return [];
    }
  },

  // Buscar conversas não lidas
  async getUnreadConversationsCount(user: User): Promise<number> {
    try {
      const { data, error } = await (supabase as any)
        .from('messages')
        .select('conversation_id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Erro ao buscar conversas não lidas:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Erro no getUnreadConversationsCount:', error);
      return 0;
    }
  }
};