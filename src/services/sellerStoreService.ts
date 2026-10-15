import { supabase } from '@/integrations/supabase/client';

// Interfaces
export interface SellerStore {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerStats {
  totalProducts: number;
  totalSales: number;
  avgRating: number;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: 'active' | 'inactive';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Service para gerenciamento de lojas de vendedores
 */
export const sellerStoreService = {
  /**
   * Buscar configuração da loja do vendedor
   */
  async getStoreConfig(userId: string): Promise<SellerStore | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('seller_stores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar configuração da loja:', error);
        throw error;
      }

      return data as SellerStore | null;
    } catch (error) {
      console.error('Erro no getStoreConfig:', error);
      throw error;
    }
  },

  /**
   * Criar ou atualizar loja (upsert)
   */
  async upsertStore(storeData: Partial<SellerStore>): Promise<SellerStore> {
    try {
      // Validações
      if (!storeData.user_id) {
        throw new Error('user_id é obrigatório');
      }

      if (!storeData.business_name || storeData.business_name.trim().length < 3) {
        throw new Error('Nome da empresa deve ter no mínimo 3 caracteres');
      }

      if (storeData.business_name.length > 255) {
        throw new Error('Nome da empresa deve ter no máximo 255 caracteres');
      }

      if (storeData.description && storeData.description.length > 500) {
        throw new Error('Descrição deve ter no máximo 500 caracteres');
      }

      const { data, error } = await (supabase as any)
        .from('seller_stores')
        .upsert(storeData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar loja:', error);
        throw error;
      }

      return data as SellerStore;
    } catch (error) {
      console.error('Erro no upsertStore:', error);
      throw error;
    }
  },

  /**
   * Upload de logo da loja
   */
  async uploadLogo(file: File, userId: string): Promise<string> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato inválido. Use PNG, JPG ou JPEG');
      }

      // Validar tamanho (máx 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB em bytes
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 2MB');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `store-logos/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no uploadLogo:', error);
      throw error;
    }
  },

  /**
   * Deletar logo antigo (opcional, para economizar storage)
   */
  async deleteLogo(logoUrl: string): Promise<void> {
    try {
      // Extrair o path do logo da URL
      const urlParts = logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `store-logos/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar logo:', error);
        // Não lançar erro, apenas logar
      }
    } catch (error) {
      console.error('Erro no deleteLogo:', error);
      // Não lançar erro, apenas logar
    }
  },

  /**
   * Buscar produtos do vendedor
   */
  async getSellerProducts(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      return (data || []) as Product[];
    } catch (error) {
      console.error('Erro no getSellerProducts:', error);
      throw error;
    }
  },

  /**
   * Atualizar status do produto (ativar/desativar)
   */
  async toggleProductStatus(
    productId: string,
    newStatus: 'active' | 'inactive'
  ): Promise<void> {
    try {
      // Verificar se produto tem pedidos pendentes antes de desativar
      if (newStatus === 'inactive') {
        const { data: orders } = await (supabase as any)
          .from('orders')
          .select('id')
          .eq('product_id', productId)
          .in('status', ['pending', 'processing']);

        if (orders && orders.length > 0) {
          throw new Error(
            'Não é possível desativar produto com pedidos pendentes'
          );
        }
      }

      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no toggleProductStatus:', error);
      throw error;
    }
  },

  /**
   * Atualizar produto
   */
  async updateProduct(
    productId: string,
    productData: Partial<Product>
  ): Promise<Product> {
    try {
      // Validações básicas
      if (productData.title && productData.title.trim().length < 3) {
        throw new Error('Título deve ter no mínimo 3 caracteres');
      }

      if (productData.price && productData.price <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error('Erro no updateProduct:', error);
      throw error;
    }
  },

  /**
   * Buscar estatísticas do vendedor
   */
  async getSellerStats(userId: string): Promise<SellerStats> {
    try {
      // Total de produtos ativos
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      // Total de vendas completadas
      const { count: salesCount } = await (supabase as any)
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .in('status', ['completed', 'shipped', 'delivered']);

      // Avaliação média (placeholder - implementar quando houver sistema de reviews)
      const avgRating = 4.8;

      return {
        totalProducts: productsCount || 0,
        totalSales: salesCount || 0,
        avgRating
      };
    } catch (error) {
      console.error('Erro no getSellerStats:', error);
      // Retornar valores zerados em caso de erro
      return {
        totalProducts: 0,
        totalSales: 0,
        avgRating: 0
      };
    }
  },

  /**
   * Verificar se usuário tem loja configurada
   */
  async hasStore(userId: string): Promise<boolean> {
    try {
      const { count } = await (supabase as any)
        .from('seller_stores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return (count || 0) > 0;
    } catch (error) {
      console.error('Erro no hasStore:', error);
      return false;
    }
  }
};
