import { useState, useRef } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { sellerStoreService } from '@/services/sellerStoreService';

interface LogoUploadProps {
  currentLogoUrl?: string;
  userId: string;
  onUploadComplete: (logoUrl: string) => void;
}

export const LogoUpload = ({ currentLogoUrl, userId, onUploadComplete }: LogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, JPG ou JPEG');
      return;
    }

    // Validar tamanho (máx 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 2MB');
      return;
    }

    try {
      setIsUploading(true);

      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para Supabase
      const logoUrl = await sellerStoreService.uploadLogo(file, userId);
      
      onUploadComplete(logoUrl);
      toast.success('Logo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao enviar logo');
      setPreview(currentLogoUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo da Loja
      </label>
      
      <div className="flex items-start gap-4">
        {/* Preview/Upload Area */}
        <div
          onClick={!isUploading ? handleClick : undefined}
          className={`relative w-32 h-32 rounded-lg border-2 border-dashed ${
            preview ? 'border-gray-300' : 'border-gray-400'
          } flex items-center justify-center overflow-hidden ${
            !isUploading ? 'cursor-pointer hover:border-orange-500' : 'cursor-not-allowed'
          } transition-colors bg-gray-50`}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          ) : preview ? (
            <>
              <img
                src={preview}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLogo();
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Clique para enviar</p>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            <Upload className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 font-medium">
                Envie o logo da sua loja
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: PNG, JPG, JPEG
              </p>
              <p className="text-xs text-gray-500">
                Tamanho máximo: 2MB
              </p>
              <p className="text-xs text-gray-500">
                Recomendado: 400x400px
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
