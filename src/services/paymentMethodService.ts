import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  user_id: string;
  payment_type: 'credit_card' | 'debit_card' | 'pix';
  card_brand?: string;
  card_last_four?: string;
  card_holder_name?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  mp_card_token?: string;
  mp_customer_id?: string;
  pix_key?: string;
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  payment_type: 'credit_card' | 'debit_card' | 'pix';
  card_brand?: string;
  card_last_four?: string;
  card_holder_name?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  mp_card_token?: string;
  mp_customer_id?: string;
  pix_key?: string;
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  is_default?: boolean;
}

export interface UpdatePaymentMethodData {
  card_holder_name?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  is_default?: boolean;
  is_active?: boolean;
}

class PaymentMethodService {
  /**
   * Busca todos os métodos de pagamento do usuário
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar métodos de pagamento:', error);
        throw error;
      }

      return (data as any) || [];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      throw error;
    }
  }

  /**
   * Busca o método de pagamento padrão do usuário
   */
  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar método de pagamento padrão:', error);
        throw error;
      }

      return (data as any) || null;
    } catch (error) {
      console.error('Erro ao buscar método de pagamento padrão:', error);
      return null;
    }
  }

  /**
   * Busca um método de pagamento específico
   */
  async getPaymentMethod(id: string): Promise<PaymentMethod | null> {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar método de pagamento:', error);
        throw error;
      }

      return data as any;
    } catch (error) {
      console.error('Erro ao buscar método de pagamento:', error);
      return null;
    }
  }

  /**
   * Cria um novo método de pagamento
   */
  async createPaymentMethod(
    userId: string,
    data: CreatePaymentMethodData
  ): Promise<PaymentMethod> {
    try {
      // Se este for o primeiro método ou estiver marcado como padrão
      const existingMethods = await this.getUserPaymentMethods(userId);
      const isFirstMethod = existingMethods.length === 0;
      const shouldBeDefault = data.is_default || isFirstMethod;

      const { data: newMethod, error } = await supabase
        .from('user_payment_methods' as any)
        .insert({
          user_id: userId,
          ...data,
          is_default: shouldBeDefault,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar método de pagamento:', error);
        throw error;
      }

      return newMethod as any;
    } catch (error) {
      console.error('Erro ao criar método de pagamento:', error);
      throw error;
    }
  }

  /**
   * Atualiza um método de pagamento
   */
  async updatePaymentMethod(
    id: string,
    data: UpdatePaymentMethodData
  ): Promise<PaymentMethod> {
    try {
      const { data: updatedMethod, error } = await supabase
        .from('user_payment_methods' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar método de pagamento:', error);
        throw error;
      }

      return updatedMethod as any;
    } catch (error) {
      console.error('Erro ao atualizar método de pagamento:', error);
      throw error;
    }
  }

  /**
   * Define um método de pagamento como padrão
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      return await this.updatePaymentMethod(id, { is_default: true });
    } catch (error) {
      console.error('Erro ao definir método de pagamento padrão:', error);
      throw error;
    }
  }

  /**
   * Desativa um método de pagamento (soft delete)
   */
  async deletePaymentMethod(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_payment_methods' as any)
        .update({ is_active: false, is_default: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar método de pagamento:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar método de pagamento:', error);
      throw error;
    }
  }

  /**
   * Remove permanentemente um método de pagamento
   */
  async permanentlyDeletePaymentMethod(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_payment_methods' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar permanentemente método de pagamento:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar permanentemente método de pagamento:', error);
      throw error;
    }
  }

  /**
   * Valida número de cartão usando algoritmo de Luhn
   */
  validateCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Identifica a bandeira do cartão
   */
  getCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(digits)) {
      return 'visa';
    }
    
    // Mastercard
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
      return 'mastercard';
    }
    
    // Elo
    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(digits)) {
      return 'elo';
    }
    
    // American Express
    if (/^3[47]/.test(digits)) {
      return 'amex';
    }
    
    // Hipercard
    if (/^(38|60)/.test(digits)) {
      return 'hipercard';
    }
    
    return 'unknown';
  }

  /**
   * Formata número de cartão
   */
  formatCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }

  /**
   * Mascara número de cartão (mostra apenas últimos 4 dígitos)
   */
  maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    const lastFour = digits.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
