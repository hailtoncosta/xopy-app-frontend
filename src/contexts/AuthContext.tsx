import type { ProfileDetails } from '@/lib/profileDetails';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/authService';
import { request } from '@/integrations/api/client';
import { supabase } from '@/integrations/supabase/client';

export type UserType = 'customer' | 'admin' | 'provider' | 'service_provider';

export interface User {
  id: string;
  email: string;
  name: string;
  profileCompleted?: boolean;
  profileDetails?: ProfileDetails;
  phone?: string;
  type: UserType;
  avatar_url?: string;
  avatar?: string;
  isVerified?: boolean;
  created_at?: string;
  createdAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, type: UserType) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  requireAuth: () => boolean;
  refreshUser: () => Promise<void>;
  completeProfile: (details: ProfileDetails) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  type: UserType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

function toUser(account: any, profile: any): User {
  return { id: account.id, email: account.email, name: profile?.full_name || account.user_metadata?.full_name || account.email,
    phone: profile?.phone, type: account.role === 'ADMIN' ? 'admin' : profile?.user_type || 'customer',
    avatar_url: profile?.avatar_url || undefined, avatar: profile?.avatar_url || undefined, isVerified: !!profile?.is_verified, created_at: profile?.created_at };
}
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const load = async () => {
    const result = await supabase.auth.getUser();
    if (!result.data.user || result.error) { setUser(null); return; }
    const profile = await supabase.from('user_profiles').select('*').eq('id', result.data.user.id).single();
    if (profile.error) { setUser(null); return; }
    const account = toUser(result.data.user, profile.data);
    try { const details = await request('/profile-details'); account.profileCompleted = details.completed; account.profileDetails = details.details; }
    catch { account.profileCompleted = false; }
    setUser(account);
  };
  useEffect(() => {
    localStorage.removeItem('xopy_fallback_users'); localStorage.removeItem('xopy_fallback_session');
    localStorage.removeItem('xopy_user');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setIsLoading(false); return; }
      setIsLoading(true); load().catch(() => setUser(null)).finally(() => setIsLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);
  const login = async (email: string, password: string, _type: UserType) => {
    setIsLoading(true);
    try { const r = await supabase.auth.signInWithPassword({ email, password }); if (r.error) return { success: false, error: r.error.message }; await load(); setIsGuest(false); return { success: true }; }
    catch { return { success: false, error: 'Não foi possível acessar o servidor' }; }
    finally { setIsLoading(false); }
  };
  const register = async (data: RegisterData) => {
    const r = await supabase.auth.signUp({ email: data.email, password: data.password, options: { data: { full_name: data.name, phone: data.phone, user_type: data.type === 'provider' ? 'service_provider' : data.type } } });
    if (r.error) return { success: false, message: r.error.message };
    await load(); setIsGuest(false); return { success: true, message: 'Conta criada' };
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setIsGuest(false); };
  const updateUser = async (updates: Partial<User>) => {
    if (!user) throw new Error('Faça login');
    const values: Record<string, unknown> = {};
    if (updates.name !== undefined) values.full_name = updates.name;
    if (updates.phone !== undefined) values.phone = updates.phone;
    if ('avatar' in updates || 'avatar_url' in updates) values.avatar_url = updates.avatar_url ?? updates.avatar ?? null;
    const r = await supabase.from('user_profiles').update(values).eq('id', user.id);
    if (r.error) throw new Error(r.error.message);
    setUser(current => {
      if (!current || current.id !== user.id) return current;
      const next = { ...current, ...updates };
      if ('avatar_url' in values) {
        next.avatar_url = (values.avatar_url as string) || undefined;
        next.avatar = next.avatar_url;
      }
      return next;
    });
  };
  const completeProfile = async (details: ProfileDetails) => {
    if (!user) throw new Error('Faça login');
    const result = await request('/profile-details', 'PUT', details);
    setUser(current => current?.id === user.id ? {...current, name: result.details.name, phone: result.details.phone, profileCompleted: result.completed, profileDetails: result.details} : current);
  };
  const pending = async () => ({ success: false, error: 'Funcionalidade ainda não convertida. Para trocar sua senha, acesse Alterar senha no perfil.' });
  return <AuthContext.Provider value={{ user, isGuest, isLoading, isAuthenticated: !!user,
    login, register, logout, updateUser, refreshUser: load, completeProfile, loginWithGoogle: pending, resetPassword: async (email: string) => {
      try { const result = await request('/auth/forgot-password', 'POST', {email}); return {success: true, message: result.message}; }
      catch (e) { return {success: false, error: e instanceof Error ? e.message : 'Erro ao enviar recuperação'}; }
    }, updatePassword: pending,
    loginAsGuest: () => { setIsGuest(true); }, requireAuth: () => !!user,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
 const value = useContext(AuthContext);
 if (!value) throw new Error('useAuth requer AuthProvider');
 return value;
};
