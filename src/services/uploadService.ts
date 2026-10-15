import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UploadService {
  private readonly BUCKET_NAME = 'product-images';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Valida se o arquivo é válido para upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'Nenhum arquivo selecionado' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 5MB permitido.' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' };
    }

    return { valid: true };
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateFileName(file: File, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const prefixPart = prefix ? `${prefix}_` : '';
    return `${prefixPart}${timestamp}_${random}.${extension}`;
  }

  /**
   * Faz upload de uma imagem
   */
  async uploadImage(
    file: File, 
    folder: string = 'general',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Gerar nome do arquivo
      const fileName = this.generateFileName(file, folder);
      const filePath = `${folder}/${fileName}`;

      // Simular progresso (Supabase não fornece progresso real)
      if (onProgress) {
        const simulateProgress = () => {
          let loaded = 0;
          const total = file.size;
          const interval = setInterval(() => {
            loaded += total / 10;
            if (loaded >= total) {
              loaded = total;
              clearInterval(interval);
            }
            onProgress({
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            });
          }, 100);
        };
        simulateProgress();
      }

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Obter URL pública com cache-busting
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Adicionar timestamp para evitar cache
      const urlWithCacheBusting = `${urlData.publicUrl}?t=${Date.now()}`;
      
      console.log('Upload concluído:', {
        filePath,
        originalUrl: urlData.publicUrl,
        urlWithCacheBusting
      });

      return {
        success: true,
        url: urlWithCacheBusting
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove uma imagem
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      console.log('Tentando deletar imagem:', url);
      
      // Extrair o caminho do arquivo da URL
      let filePath = '';
      
      if (url.includes('/storage/v1/object/public/')) {
        // URL do Supabase Storage
        const parts = url.split('/storage/v1/object/public/' + this.BUCKET_NAME + '/');
        if (parts.length > 1) {
          filePath = parts[1].split('?')[0]; // Remove query parameters como ?t=timestamp
        }
      } else {
        // Fallback: extrair das últimas partes da URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query parameters
        const folder = urlParts[urlParts.length - 2];
        filePath = `${folder}/${fileName}`;
      }
      
      console.log('Caminho do arquivo para deletar:', filePath);
      
      if (!filePath) {
        console.error('Não foi possível extrair o caminho do arquivo da URL:', url);
        return false;
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        return false;
      }

      console.log('Arquivo deletado com sucesso:', filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Lista arquivos em uma pasta
   */
  async listFiles(folder: string = ''): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder);

      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return [];
      }

      return data?.map(file => {
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${folder}/${file.name}`);
        return urlData.publicUrl;
      }) || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Redimensiona uma imagem (usando canvas)
   */
  async resizeImage(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob e depois para File
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Retorna arquivo original se falhar
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

const uploadService = new UploadService();
export default uploadService;