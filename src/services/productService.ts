import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  user_id: string;
  seller_type: 'individual' | 'company';
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_cpf?: string;
  seller_cnpj?: string;
  seller_company_name?: string;
  material_type: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_unit: string;
  product_condition: 'new' | 'used' | 'refurbished';
  product_location: string;
  product_images: string[];
  status: 'active' | 'sold' | 'inactive';
  created_at: string;
  updated_at: string;
}
import { generateUUID } from '@/utils/uuid';

export interface CreateProductData {
  seller_type: 'individual' | 'company';
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_cpf?: string;
  seller_cnpj?: string;
  seller_company_name?: string;
  material_type: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_unit: string;
  product_condition: 'new' | 'used' | 'refurbished';
  product_location: string;
  product_images: File[];
}

export interface CreateProductRequest {
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  seller_type: 'individual' | 'business';
  product_type: 'new' | 'leftover';
  manufacturing_date?: string | null;
  seller_info: Record<string, any>;
}

export class ProductService {
  // Função para upload de imagem
  static async uploadImage(file: File, productId: string, imageOrder: number): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${imageOrder}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return null;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      return null;
    }
  }

  // Nova função para criar produto com estrutura da tabela
  static async createProductFromModal(userId: string, productData: CreateProductRequest, imageFiles: File[]): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
      // Verificar autenticação do Supabase para obter auth.uid()
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado no Supabase' };
      }
      
      // Verificar se o perfil do usuário existe na tabela user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // Se o perfil não existir, criar um básico usando upsert
      if (profileError && profileError.code === 'PGRST116') {
        const { error: upsertProfileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            user_type: 'customer'
          }, {
            onConflict: 'id'
          });
        
        if (upsertProfileError) {
          console.error('Erro ao criar/atualizar perfil:', upsertProfileError);
          return { success: false, error: 'Erro ao criar perfil do usuário' };
        }
      }
      
      // Gerar ID único para o produto
      const productId = generateUUID();

      // Preparar dados do produto para inserção
      const productToInsert = {
        id: productId,
        user_id: user.id, // Usar auth.uid() do Supabase
        title: productData.title,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        quantity: productData.quantity,
        seller_type: productData.seller_type,
        product_type: productData.product_type,
        manufacturing_date: productData.manufacturing_date,
        seller_info: productData.seller_info,
        status: 'active'
      };

      // Inserir produto no banco de dados
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single();

      if (productError) {
        console.error('Erro ao inserir produto:', productError);
        return { success: false, error: `Erro ao inserir produto: ${productError.message}` };
      }

      // Upload das imagens se houver
      if (imageFiles && imageFiles.length > 0) {
        const imageUrls: string[] = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
          const imageUrl = await this.uploadImage(imageFiles[i], productId, i + 1);
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        }

        // Atualizar produto com URLs das imagens
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ images: imageUrls })
            .eq('id', productId);

          if (updateError) {
            console.error('Erro ao atualizar imagens do produto:', updateError);
          }
        }
      }

      return { success: true, product };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return { success: false, error: `Erro ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  }

  // Função original para criar produto
  static async createProduct(userId: string, productData: CreateProductData): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      // Gerar ID único para o produto
      const productId = generateUUID();

      // Preparar dados do produto para inserção
      const productToInsert = {
        id: productId,
        user_id: userId,
        title: productData.product_name,
        description: productData.product_description,
        category: productData.material_type,
        price: productData.product_price,
        quantity: productData.product_quantity,
        unit: productData.product_unit,
        condition: productData.product_condition,
        location: productData.product_location,
        seller_type: productData.seller_type,
        product_type: 'material', // Adicionar product_type
        seller_info: {
          name: productData.seller_name,
          email: productData.seller_email,
          phone: productData.seller_phone,
          cpf: productData.seller_cpf,
          cnpj: productData.seller_cnpj,
          company_name: productData.seller_company_name
        },
        status: 'active'
      };

      // Inserir produto no banco de dados
      // @ts-ignore
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single();

      if (productError) {
        console.error('Erro ao inserir produto:', productError);
        return { success: false, error: `Erro ao inserir produto: ${productError.message}` };
      }

      // Upload das imagens
      if (productData.product_images && productData.product_images.length > 0) {
        const imageUrls: string[] = [];
        
        for (let i = 0; i < productData.product_images.length; i++) {
          const imageUrl = await this.uploadImage(productData.product_images[i], productId, i + 1);
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        }

        // Atualizar produto com URLs das imagens
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ images: imageUrls })
            .eq('id', productId);

          if (updateError) {
            console.error('Erro ao atualizar imagens do produto:', updateError);
          }
        }
      }

      // @ts-ignore - Type mismatch with Product interface
      return { success: true, product: product as Product };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return { success: false, error: `Erro ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  }

  // Buscar produtos do usuário
  static async getUserProducts(userId: string): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos do usuário:', error);
        return [];
      }

      // @ts-ignore - Type mismatch with Product type
      return products || [];
    } catch (error) {
      console.error('Erro ao buscar produtos do usuário:', error);
      return [];
    }
  }

  // Buscar produtos ativos (usando view segura que mascara dados sensíveis do vendedor)
  static async getActiveProducts(): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('products_public_safe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos ativos:', error);
        return [];
      }

      // @ts-ignore - Type mismatch with Product type
      return products || [];
    } catch (error) {
      console.error('Erro ao buscar produtos ativos:', error);
      return [];
    }
  }

  // Atualizar status do produto
  static async updateProductStatus(productId: string, status: 'active' | 'sold' | 'inactive'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao atualizar status do produto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      return false;
    }
  }

  // Atualizar produto
  static async updateProduct(productId: string, productData: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return false;
    }
  }

  // Deletar produto
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Erro ao deletar produto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }
  }
}