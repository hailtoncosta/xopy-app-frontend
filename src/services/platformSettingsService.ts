import { supabase } from '@/integrations/supabase/client';

export interface PlatformSettings {
  id: string;
  commission_rate: number;
  updated_at: string;
  updated_by?: string;
  created_at: string;
}

class PlatformSettingsService {
  /**
   * Buscar configurações atuais da plataforma
   */
  async getSettings(): Promise<PlatformSettings | null> {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao buscar configurações da plataforma:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  }

  /**
   * Buscar apenas a taxa de comissão atual
   */
  async getCommissionRate(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('commission_rate')
        .single();

      if (error) {
        console.error('Erro ao buscar taxa de comissão:', error);
        return 5.0; // Valor padrão
      }

      return data?.commission_rate || 5.0;
    } catch (error) {
      console.error('Erro ao buscar taxa:', error);
      return 5.0;
    }
  }

  /**
   * Atualizar taxa de comissão (apenas admin)
   */
  async updateCommissionRate(newRate: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Validar taxa
      if (newRate < 0 || newRate > 100) {
        return {
          success: false,
          error: 'A taxa deve estar entre 0% e 100%'
        };
      }

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Buscar o ID da configuração existente
      const { data: existingSettings } = await supabase
        .from('platform_settings')
        .select('id')
        .single();

      if (!existingSettings) {
        return {
          success: false,
          error: 'Configurações da plataforma não encontradas'
        };
      }

      // Atualizar taxa
      const { error } = await supabase
        .from('platform_settings')
        .update({
          commission_rate: newRate,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);

      if (error) {
        console.error('Erro ao atualizar taxa:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar taxa:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcular valor da taxa baseado no total
   */
  calculateFee(totalAmount: number, commissionRate: number): number {
    return (totalAmount * commissionRate) / 100;
  }
}

export const platformSettingsService = new PlatformSettingsService();
export default platformSettingsService;
