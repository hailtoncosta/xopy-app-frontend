import { supabase } from '@/integrations/supabase/client';
import { User } from '@/integrations/api/client';

export interface ServiceProviderAuthData {
  name: string;
  email: string;
  phone: string;
  category: string;
  experience: string;
  daily_rate: number;
  city: string;
  neighborhood: string;
  address: string;
  description?: string;
  specialties?: string;
  documents?: any[];
  password?: string;
}

class ServiceProviderAuthService {
  // Cadastrar prestador de serviços com criação/login automático
  async registerServiceProviderWithAuth(data: ServiceProviderAuthData): Promise<{ 
    user: User | null; 
    serviceProvider: any; 
    error: string | null; 
  }> {
    try {
      let user: User | null = null;
      let authError: string | null = null;

      // Verificar se o usuário já está logado
      const { data: existingUser } = await supabase.auth.getUser();
      
      if (existingUser.user) {
        // Se o usuário já está logado, verificar se o email coincide
        if (existingUser.user.email === data.email) {
          // Email coincide, usar o usuário logado
          user = existingUser.user;
        } else {
          // Email diferente, fazer logout primeiro e depois tentar login/cadastro
          try {
            await supabase.auth.signOut();
            // Aguardar um pouco para garantir que o logout foi processado
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (logoutError) {
            console.warn('Erro no logout (ignorado):', logoutError);
            // Continuar mesmo se o logout falhar
          }
          
          // Tentar fazer login com as novas credenciais
          if (data.password) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password
            });

            if (!signInError && signInData.user) {
              user = signInData.user;
            } else {
              // Se não conseguiu fazer login, criar nova conta
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                  emailRedirectTo: `${window.location.origin}/`,
                  data: {
                    full_name: data.name,
                    user_type: 'service_provider'
                  }
                }
              });

              if (signUpError) {
                authError = signUpError.message;
              } else {
                user = signUpData.user;
              }
            }
          } else {
            authError = 'Senha é obrigatória para o cadastro';
          }
        }
      } else {
        // Tentar fazer login primeiro (caso o usuário já tenha cadastro)
        if (data.password) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

          if (!signInError && signInData.user) {
            user = signInData.user;
          } else {
            // Se não conseguiu fazer login, criar nova conta
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: {
                  full_name: data.name,
                  user_type: 'service_provider'
                }
              }
            });

            if (signUpError) {
              authError = signUpError.message;
            } else {
              user = signUpData.user;
            }
          }
        } else {
          authError = 'Senha é obrigatória para o cadastro';
        }
      }

      if (!user || authError) {
        return {
          user: null,
          serviceProvider: null,
          error: authError || 'Erro na autenticação'
        };
      }

      // Criar/atualizar perfil do usuário
      await this.ensureUserProfile(user, data);

      // Verificar se já existe cadastro como prestador
      const { data: existingProvider } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      let serviceProvider;

      if (existingProvider) {
        // Atualizar cadastro existente
        const { data: updatedProvider, error: updateError } = await supabase
          .from('service_providers')
          .update({
            name: data.name,
            email: data.email,
            phone: data.phone,
            category: data.category,
            experience: data.experience,
            daily_rate: data.daily_rate,
            city: data.city,
            neighborhood: data.neighborhood,
            address: data.address,
            description: data.description,
            specialties: data.specialties,
            documents: data.documents || [],
            // Approval state is controlled by the server.
          })
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (updateError) {
          return {
            user: null,
            serviceProvider: null,
            error: 'Erro ao atualizar cadastro de prestador'
          };
        }

        serviceProvider = updatedProvider;
      } else {
        // Criar novo cadastro de prestador
        const { data: newProvider, error: createError } = await supabase
          .from('service_providers')
          .insert({
            user_id: user.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            category: data.category,
            experience: data.experience,
            daily_rate: data.daily_rate,
            city: data.city,
            neighborhood: data.neighborhood,
            address: data.address,
            description: data.description,
            specialties: data.specialties,
            documents: data.documents || [],
            // Approval state is controlled by the server.
          })
          .select('*')
          .single();

        if (createError) {
          return {
            user: null,
            serviceProvider: null,
            error: 'Erro ao criar cadastro de prestador'
          };
        }

        serviceProvider = newProvider;
      }

      return {
        user,
        serviceProvider,
        error: null
      };

    } catch (error) {
      console.error('Erro no cadastro de prestador:', error);
      return {
        user: null,
        serviceProvider: null,
        error: 'Erro interno no sistema'
      };
    }
  }

  // Garantir que o perfil do usuário existe e está atualizado
  private async ensureUserProfile(user: User, data: ServiceProviderAuthData): Promise<void> {
    try {
      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Atualizar perfil existente
        await supabase
          .from('user_profiles')
          .update({
            full_name: data.name,
            phone: data.phone,
            user_type: 'service_provider',
            is_verified: false // Será verificado após aprovação
          })
          .eq('id', user.id);
      } else {
        // Criar novo perfil
        await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || data.email,
            full_name: data.name,
            phone: data.phone,
            user_type: 'service_provider',
            is_verified: false
          });
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar perfil:', error);
    }
  }

  // Verificar se usuário logado é prestador de serviços aprovado
  async isApprovedServiceProvider(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'approved');

      return !error && !!data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Obter dados do prestador pelo user_id
  async getServiceProviderByUserId(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  // Verificar se há conflito de email com usuário logado
  async checkEmailConflict(email: string): Promise<{
    hasConflict: boolean;
    currentUserEmail: string | null;
    message: string | null;
  }> {
    try {
      const { data: existingUser } = await supabase.auth.getUser();
      
      if (existingUser.user && existingUser.user.email !== email) {
        return {
          hasConflict: true,
          currentUserEmail: existingUser.user.email,
          message: `Você está logado com ${existingUser.user.email}, mas está tentando cadastrar com ${email}. Você será deslogado da conta atual para criar/acessar a conta com o novo email.`
        };
      }
      
      return {
        hasConflict: false,
        currentUserEmail: existingUser.user?.email || null,
        message: null
      };
    } catch (error) {
      return {
        hasConflict: false,
        currentUserEmail: null,
        message: null
      };
    }
  }

  // Login simples verificando se é prestador
  async loginAndCheckProvider(email: string, password: string): Promise<{
    user: User | null;
    isServiceProvider: boolean;
    serviceProvider: any;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          user: null,
          isServiceProvider: false,
          serviceProvider: null,
          error: error.message
        };
      }

      if (!data.user) {
        return {
          user: null,
          isServiceProvider: false,
          serviceProvider: null,
          error: 'Usuário não encontrado'
        };
      }

      // Verificar se é prestador de serviços
      const serviceProvider = await this.getServiceProviderByUserId(data.user.id);
      const isServiceProvider = !!serviceProvider;

      return {
        user: data.user,
        isServiceProvider,
        serviceProvider,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        isServiceProvider: false,
        serviceProvider: null,
        error: 'Erro interno no login'
      };
    }
  }
}

export const serviceProviderAuthService = new ServiceProviderAuthService();