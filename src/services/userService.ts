import { request } from '@/integrations/api/client';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'customer' | 'service_provider' | 'store_owner' | 'guest';
  avatar?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
}

export interface AdminUser extends UserProfile {
  stats: UserStats;
  status: 'active' | 'inactive' | 'banned';
}

/**
 * Busca todos os usuários do sistema da tabela user_profiles
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    console.log('🔍 Buscando usuários de user_profiles...');
    
    // Buscar usuários da tabela user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📊 Resultado da busca:', {
      profiles: profiles?.length || 0,
      error: profilesError
    });

    if (profilesError) {
      console.error('❌ Erro ao buscar usuários:', profilesError);
      console.error('Detalhes do erro:', JSON.stringify(profilesError, null, 2));
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.warn('⚠️ Nenhum usuário encontrado em user_profiles!');
      console.log('Isso pode significar que:');
      console.log('1. A tabela está vazia');
      console.log('2. As políticas RLS estão bloqueando o acesso');
      console.log('3. O script SQL não foi executado');
      return [];
    }

    console.log(`✅ ${profiles.length} usuários encontrados!`);

    // Converter perfis para AdminUser
    const usersWithStats: AdminUser[] = [];
    
    for (const profile of profiles) {
      // Determinar status baseado em is_verified
      let status: 'active' | 'inactive' | 'banned' = 'active';
      if (!profile.is_verified) {
        status = 'inactive';
      }
      
      // Buscar stats
      const stats = await getUserStats(profile.id);
      
      usersWithStats.push({
        id: profile.id,
        auth_id: profile.id,
        name: profile.full_name || profile.email?.split('@')[0] || 'Usuário',
        email: profile.email || '',
        phone: profile.phone || undefined,
        type: (profile.user_type || 'customer') as any,
        avatar: profile.avatar_url || undefined,
        is_verified: profile.is_verified || false,
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at,
        last_sign_in_at: profile.updated_at || undefined,
        stats,
        status
      });
    }

    return usersWithStats;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

/**
 * Busca estatísticas de pedidos de um usuário
 */
export async function getUserStats(authId: string): Promise<UserStats> {
  // Por enquanto, retornar estatísticas vazias para evitar problemas de tipo
  // TODO: Implementar busca real de estatísticas quando a tabela orders estiver configurada
  return {
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  };
}

/**
 * Atualiza informações de um usuário na tabela user_profiles
 */
export async function updateUser(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: updates.name,
        email: updates.email,
        phone: updates.phone,
        user_type: updates.type,
        is_verified: updates.is_verified,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

/** Exclui a conta pela rotina administrativa do Spring Boot. */
export async function deleteUser(userId: string): Promise<void> {
  await deleteUsers([userId]);
}

export async function deleteUsers(userIds: string[]): Promise<void> {
  if (!userIds.length) return;
  await request('/admin/users/delete', 'POST', { ids: [...new Set(userIds)] });
}

/**
 * Busca um usuário específico por ID
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    const stats = await getUserStats(profile.id);
    
    let status: 'active' | 'inactive' | 'banned' = 'active';
    if (!profile.is_verified) {
      status = 'inactive';
    }

    return {
      id: profile.id,
      auth_id: profile.id,
      name: profile.full_name || profile.email?.split('@')[0] || 'Usuário',
      email: profile.email || '',
      phone: profile.phone || undefined,
      type: (profile.user_type || 'customer') as any,
      avatar: profile.avatar_url || undefined,
      is_verified: profile.is_verified || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at || profile.created_at,
      last_sign_in_at: profile.updated_at || undefined,
      stats,
      status
    } as AdminUser;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
