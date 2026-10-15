import { supabase } from '@/integrations/supabase/client';
import { User, UserType, RegisterData } from '@/contexts/AuthContext';
import { generateUUID } from '@/utils/uuid';

// Interface para dados do usuário no Supabase
interface SupabaseUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  user_type: UserType;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para resultado das operações de autenticação
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  // Registrar novo usuário no Supabase Auth
  static async register(userData: RegisterData): Promise<AuthResult> {
    try {
      // Registrar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            type: userData.type
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Falha ao criar usuário' };
      }

      // Se o usuário foi criado mas precisa confirmar email
      if (!authData.session) {
        return { 
          success: true, 
          error: 'Conta criada com sucesso! Verifique seu email para confirmar a conta antes de fazer login.' 
        };
      }

      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      let userProfile;
      
      if (existingProfile) {
        // Se o perfil já existe, usar o existente
        userProfile = existingProfile;
      } else {
        // Criar perfil do usuário na tabela user_profiles
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.name,
            phone: userData.phone,
            user_type: userData.type,
            avatar_url: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
            is_verified: false
          })
          .select()
          .single();

        if (profileError) {
          return { success: false, error: `Erro ao criar perfil: ${profileError.message}` };
        }
        
        userProfile = newProfile;
      }

      // Converter dados do Supabase para o formato User
      const user: User = this.mapSupabaseUserToUser(userProfile);

      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido no registro' 
      };
    }
  }

  // Login com Supabase Auth
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthService: Erro do Supabase auth:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('AuthService: Nenhum usuário retornado pelo Supabase');
        return { success: false, error: 'Falha no login' };
      }

      // Buscar dados do perfil do usuário na tabela user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error('AuthService: Erro ao buscar perfil do usuário:', profileError);
        // Fallback para dados básicos do auth
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email || email,
          phone: data.user.user_metadata?.phone,
          type: data.user.user_metadata?.type || 'customer',
          avatar: data.user.user_metadata?.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
          isVerified: data.user.email_confirmed_at !== null,
          createdAt: new Date(data.user.created_at)
        };
        return { success: true, user };
      }

      // Converter dados do Supabase para o formato User
      const user: User = this.mapSupabaseUserToUser({
        ...userProfile,
        user_type: userProfile.user_type as UserType
      });
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido no login' 
      };
    }
  }

  // Login com Google
  static async loginWithGoogle(): Promise<AuthResult> {
    try {
      console.log('🔐 Iniciando login com Google...');
      console.log('📍 URL atual:', window.location.href);
      
      // Usar o domínio do app a partir das variáveis de ambiente
      const appDomain = import.meta.env.VITE_APP_URL || window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appDomain,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        console.error('❌ Erro no login com Google:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Redirecionamento para Google iniciado com PKCE');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro inesperado no login com Google:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido no login com Google' 
      };
    }
  }

  // Logout
  static async logout(): Promise<{ success: boolean; error?: string }> {
    console.log('🚪 Iniciando logout offline do authService...');
    
    try {
      // Logout completamente offline - sem nenhuma requisição
      console.log('🔄 Fazendo logout offline (sem requisições)...');
      
      // Limpar todos os dados relacionados ao Supabase do storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ AuthService removeu: ${key}`);
      });
      
      console.log('✅ Logout offline realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.warn('⚠️ Erro no logout offline (ignorando):', error);
      return { success: true }; // Sempre retornar sucesso para não bloquear
    }
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<{ user: User | null }> {
    try {
      console.log('🔍 Obtendo usuário atual...');
      
      // Primeiro, verificar se há uma sessão ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        return { user: null };
      }
      
      if (!session) {
        console.log('ℹ️ Nenhuma sessão ativa encontrada');
        return { user: null };
      }
      
      console.log('✅ Sessão ativa encontrada para:', session.user.email);
      const authUser = session.user;
      
      if (!authUser) {
        return { user: null };
      }

      console.log('🔍 Buscando perfil para:', authUser.email);

      // Buscar dados do perfil do usuário na tabela users
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Se não encontrou o perfil, criar um novo (comum com login OAuth)
      if (profileError || !userProfile) {
        console.log('📝 Perfil não encontrado, criando novo perfil...');
        
        const newProfileData = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email!.split('@')[0],
          phone: authUser.user_metadata?.phone || null,
          user_type: (authUser.user_metadata?.type || 'customer') as UserType,
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          is_verified: authUser.email_confirmed_at !== null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfileData)
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError);
          // Retornar dados básicos como fallback
          const user: User = {
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || '',
            type: (authUser.user_metadata?.type || 'customer') as UserType,
            avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
            isVerified: authUser.email_confirmed_at !== null,
            createdAt: new Date(authUser.created_at)
          };
          console.log('✅ Usando dados básicos:', user.email);
          return { user };
        }

        console.log('✅ Perfil criado com sucesso:', createdProfile.email);
        const user: User = this.mapSupabaseUserToUser({
          ...createdProfile,
          user_type: createdProfile.user_type as UserType
        });
        return { user };
      }

      console.log('✅ Perfil encontrado:', userProfile.email);
      // Converter dados do Supabase para o formato User
      const user: User = this.mapSupabaseUserToUser({
        ...userProfile,
        user_type: userProfile.user_type as UserType
      });
      return { user };
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return { user: null };
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Preparar dados para atualização
      const updateData: Partial<SupabaseUser> = {};
      if (updates.name) updateData.full_name = updates.name;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.avatar) updateData.avatar_url = updates.avatar;
      if (updates.type) updateData.user_type = updates.type;
      if (updates.isVerified !== undefined) updateData.is_verified = updates.isVerified;

      // Atualizar perfil na tabela user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', authUser.id);

      if (error) {
        return { success: false, error: `Erro ao atualizar perfil: ${error.message}` };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil' 
      };
    }
  }

  // Verificar se o usuário está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Recuperação de senha
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('AuthService: Iniciando recuperação de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset_password=1`
      });

      if (error) {
        console.error('AuthService: Erro na recuperação de senha:', error.message);
        return { success: false, error: error.message };
      }

      console.log('AuthService: Email de recuperação enviado com sucesso');
      return { 
        success: true, 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
      };
    } catch (error) {
      console.error('AuthService: Erro inesperado na recuperação de senha:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao enviar email de recuperação' 
      };
    }
  }

  // Atualização de senha
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('AuthService: Iniciando atualização de senha');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('AuthService: Erro na atualização de senha:', error.message);
        return { success: false, error: error.message };
      }

      await supabase.auth.signOut({ scope: 'local' });

      console.log('AuthService: Senha atualizada com sucesso');
      return { 
        success: true, 
        message: 'Senha atualizada com sucesso!' 
      };
    } catch (error) {
      console.error('AuthService: Erro inesperado na atualização de senha:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar senha' 
      };
    }
  }

  // Método auxiliar para converter dados do Supabase para o formato User
  private static mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      name: supabaseUser.full_name || supabaseUser.email.split('@')[0],
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      type: supabaseUser.user_type,
      avatar: supabaseUser.avatar_url,
      isVerified: supabaseUser.is_verified,
      createdAt: new Date(supabaseUser.created_at)
    };
  }
}