import { supabase } from '@/integrations/supabase/client';

export interface VideoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class VideoUploadService {
  private readonly BUCKET_NAME = 'clips-videos';
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

  /**
   * Valida se o arquivo de vídeo é válido para upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'Nenhum arquivo selecionado' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 50MB permitido.' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido. Use MP4, WebM, MOV ou AVI.' };
    }

    return { valid: true };
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `clip_${timestamp}_${random}.${extension}`;
  }

  /**
   * Faz upload de um vídeo
   */
  async uploadVideo(
    file: File,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResult> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Gerar nome do arquivo
      const fileName = this.generateFileName(file);
      const filePath = `clips/${fileName}`;

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
          }, 200);
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

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Upload de vídeo concluído:', {
        filePath,
        url: urlData.publicUrl
      });

      return {
        success: true,
        url: urlData.publicUrl
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
   * Remove um vídeo
   */
  async deleteVideo(url: string): Promise<boolean> {
    try {
      console.log('Tentando deletar vídeo:', url);
      
      // Extrair o caminho do arquivo da URL
      let filePath = '';
      
      if (url.includes('/api/files/public/')) {
        const parts = url.split('/api/files/public/' + this.BUCKET_NAME + '/');
        if (parts.length > 1) {
          filePath = parts[1];
        }
      }
      
      if (!filePath) {
        console.error('Não foi possível extrair o caminho do arquivo da URL:', url);
        return false;
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar vídeo:', error);
        return false;
      }

      console.log('Vídeo deletado com sucesso:', filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      return false;
    }
  }

  /**
   * Valida URL de vídeo
   */
  validateVideoUrl(url: string): boolean {
    try {
      const validUrl = new URL(url);
      // Aceitar URLs de vídeo comuns
      const validDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'cloudflare.com',
        'supabase.co'
      ];
      
      return validDomains.some(domain => validUrl.hostname.includes(domain)) ||
             url.includes('/api/files/public/');
    } catch {
      return false;
    }
  }
}

const videoUploadService = new VideoUploadService();
export default videoUploadService;
