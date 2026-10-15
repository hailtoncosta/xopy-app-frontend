import { supabase } from '@/integrations/supabase/client';

// Interfaces
export interface Address {
  id: string;
  user_id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Service para gerenciamento de endereços de usuários
 */
export const addressService = {
  /**
   * Buscar todos os endereços do usuário
   */
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar endereços:', error);
        throw error;
      }

      return (data || []) as Address[];
    } catch (error) {
      console.error('Erro no getUserAddresses:', error);
      throw error;
    }
  },

  /**
   * Buscar endereço padrão do usuário
   */
  async getDefaultAddress(userId: string): Promise<Address | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar endereço padrão:', error);
        throw error;
      }

      return data as Address | null;
    } catch (error) {
      console.error('Erro no getDefaultAddress:', error);
      throw error;
    }
  },

  /**
   * Criar novo endereço
   */
  async createAddress(addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> {
    try {
      // Validações
      if (!addressData.user_id) {
        throw new Error('user_id é obrigatório');
      }

      if (!addressData.label || addressData.label.trim().length < 2) {
        throw new Error('Label deve ter no mínimo 2 caracteres');
      }

      if (!addressData.street || !addressData.number || !addressData.neighborhood || 
          !addressData.city || !addressData.state || !addressData.zip_code) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Validar CEP
      const zipCodeRegex = /^\d{5}-?\d{3}$/;
      if (!zipCodeRegex.test(addressData.zip_code)) {
        throw new Error('CEP inválido');
      }

      const { data, error } = await (supabase as any)
        .from('user_addresses')
        .insert(addressData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar endereço:', error);
        throw error;
      }

      return data as Address;
    } catch (error) {
      console.error('Erro no createAddress:', error);
      throw error;
    }
  },

  /**
   * Atualizar endereço
   */
  async updateAddress(addressId: string, addressData: Partial<Address>): Promise<Address> {
    try {
      // Validações
      if (addressData.label && addressData.label.trim().length < 2) {
        throw new Error('Label deve ter no mínimo 2 caracteres');
      }

      if (addressData.zip_code) {
        const zipCodeRegex = /^\d{5}-?\d{3}$/;
        if (!zipCodeRegex.test(addressData.zip_code)) {
          throw new Error('CEP inválido');
        }
      }

      const { data, error } = await (supabase as any)
        .from('user_addresses')
        .update(addressData)
        .eq('id', addressId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar endereço:', error);
        throw error;
      }

      return data as Address;
    } catch (error) {
      console.error('Erro no updateAddress:', error);
      throw error;
    }
  },

  /**
   * Deletar endereço
   */
  async deleteAddress(addressId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('Erro ao deletar endereço:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no deleteAddress:', error);
      throw error;
    }
  },

  /**
   * Definir endereço como padrão
   */
  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    try {
      // O trigger do banco já cuida de desmarcar os outros
      const { error } = await (supabase as any)
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao definir endereço padrão:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no setDefaultAddress:', error);
      throw error;
    }
  },

  /**
   * Buscar endereço por CEP usando ViaCEP API
   */
  async searchByCEP(cep: string): Promise<ViaCEPResponse | null> {
    try {
      // Remover caracteres não numéricos
      const cleanCEP = cep.replace(/\D/g, '');

      if (cleanCEP.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  },

  /**
   * Verificar se endereço já existe (similar)
   */
  async checkDuplicateAddress(
    userId: string,
    street: string,
    number: string,
    city: string
  ): Promise<Address | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('street', street)
        .eq('number', number)
        .eq('city', city)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar duplicata:', error);
        throw error;
      }

      return data as Address | null;
    } catch (error) {
      console.error('Erro no checkDuplicateAddress:', error);
      return null;
    }
  },

  /**
   * Formatar endereço para exibição
   */
  formatAddress(address: Address): string {
    const complement = address.complement ? `, ${address.complement}` : '';
    return `${address.street}, ${address.number}${complement}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zip_code}`;
  },

  /**
   * Formatar CEP (adicionar hífen)
   */
  formatZipCode(zipCode: string): string {
    const clean = zipCode.replace(/\D/g, '');
    if (clean.length === 8) {
      return `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    return zipCode;
  }
};
