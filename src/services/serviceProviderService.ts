import { supabase } from '@/integrations/supabase/client';
import { User } from '@/integrations/api/client';

export interface ServiceProviderData {
  name: string;
  phone: string;
  email: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  experience: string;
  dailyRate: string;
  specialties?: string;
  description?: string;
  category: string;
  documents?: File[];
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  experience: string;
  daily_rate: number;
  specialties?: string;
  description?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  created_at: string;
  updated_at: string;
}

export const serviceProviderService = {
  async createServiceProvider(data: ServiceProviderData, user: User): Promise<ServiceProvider> {
    try {
      // Converter dailyRate para número
      const dailyRateNumber = parseFloat(data.dailyRate.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      if (isNaN(dailyRateNumber)) {
        throw new Error('Valor da diária inválido');
      }

      // Preparar dados para inserção
      const serviceProviderData = {
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        experience: data.experience,
        daily_rate: dailyRateNumber,
        specialties: data.specialties || null,
        description: data.description || null,
        category: data.category,
        status: 'pending' as const,
        documents: JSON.stringify([]) // Por enquanto, documentos serão implementados posteriormente
      };

      const { data: serviceProvider, error } = await supabase
        .from('service_providers')
        .insert([serviceProviderData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar prestador de serviço:', error);
        throw new Error('Erro ao salvar cadastro de prestador de serviço');
      }

      return serviceProvider as ServiceProvider;
    } catch (error) {
      console.error('Erro no serviceProviderService.createServiceProvider:', error);
      throw error;
    }
  },

  async getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    try {
      let query = supabase
        .from('service_providers_public')
        .select('id, name, category, city, neighborhood, experience, daily_rate, description, specialties, status, created_at')
        .order('created_at', { ascending: false });

      // Se uma categoria específica for fornecida, filtrar por ela
      if (category && category !== '') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar prestadores de serviço:', error);
        throw new Error('Erro ao carregar prestadores de serviço');
      }

      // Map para o formato ServiceProvider (sem dados de contato sensíveis)
      return (data || []).map(provider => ({
        ...provider,
        user_id: '', // Ocultar user_id em listagem pública
        phone: '', // Será revelado após iniciar conversa
        email: '', // Será revelado após iniciar conversa
        address: '', // Ocultar endereço completo
        documents: []
      })) as ServiceProvider[];
    } catch (error) {
      console.error('Erro no serviceProviderService.getServiceProvidersByCategory:', error);
      throw error;
    }
  },

  async getAllApprovedServiceProviders(): Promise<ServiceProvider[]> {
    try {
      const { data, error } = await supabase
        .from('service_providers_public')
        .select('id, name, category, city, neighborhood, experience, daily_rate, description, specialties, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar prestadores de serviço aprovados:', error);
        throw new Error('Erro ao carregar prestadores de serviço');
      }

      // Map para o formato ServiceProvider (sem dados de contato sensíveis)
      return (data || []).map(provider => ({
        ...provider,
        user_id: '', // Ocultar user_id em listagem pública
        phone: '', // Será revelado após iniciar conversa
        email: '', // Será revelado após iniciar conversa
        address: '', // Ocultar endereço completo
        documents: [],
        updated_at: provider.created_at
      })) as ServiceProvider[];
    } catch (error) {
      console.error('Erro no serviceProviderService.getAllApprovedServiceProviders:', error);
      throw error;
    }
  },

  async getUserServiceProvider(userId: string): Promise<ServiceProvider | null> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar prestador de serviço do usuário:', error);
        throw new Error('Erro ao carregar dados do prestador de serviço');
      }

      return (data || null) as ServiceProvider | null;
    } catch (error) {
      console.error('Erro no serviceProviderService.getUserServiceProvider:', error);
      throw error;
    }
  },

  async updateServiceProvider(id: string, data: Partial<ServiceProviderData>): Promise<ServiceProvider> {
    try {
      const updateData: any = { ...data };
      
      // Converter dailyRate se fornecido
      if (data.dailyRate) {
        const dailyRateNumber = parseFloat(data.dailyRate.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (isNaN(dailyRateNumber)) {
          throw new Error('Valor da diária inválido');
        }
        updateData.daily_rate = dailyRateNumber;
        delete updateData.dailyRate;
      }

      const { data: serviceProvider, error } = await supabase
        .from('service_providers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar prestador de serviço:', error);
        throw new Error('Erro ao atualizar cadastro de prestador de serviço');
      }

      return serviceProvider as ServiceProvider;
    } catch (error) {
      console.error('Erro no serviceProviderService.updateServiceProvider:', error);
      throw error;
    }
  }
};