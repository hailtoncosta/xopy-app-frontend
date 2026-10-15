import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import uploadService, { UploadProgress } from '@/services/uploadService';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string | null) => void;
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  folder = 'general',
  maxWidth = 800,
  maxHeight = 600,
  className = '',
  placeholder = 'Clique para fazer upload de uma imagem',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled) return;
    
    setError(null);
    setIsUploading(true);
    setUploadProgress(null);

    try {
      // Redimensionar imagem se necessário
      const resizedFile = await uploadService.resizeImage(file, maxWidth, maxHeight);
      
      // Fazer upload
      const result = await uploadService.uploadImage(
        resizedFile,
        folder,
        (progress) => setUploadProgress(progress)
      );

      if (result.success && result.url) {
        onImageChange(result.url);
        setUploadProgress(null);
      } else {
        setError(result.error || 'Erro no upload');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = async () => {
    if (disabled) return;
    
    if (currentImage) {
      // Tentar deletar do storage
      await uploadService.deleteImage(currentImage);
    }
    onImageChange(null);
    setError(null);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {currentImage ? (
        <div className="relative group">
          <img
            src={currentImage}
            alt="Upload preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
          />
          
          {/* Overlay com botões */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
            <button
              onClick={openFileDialog}
              disabled={disabled || isUploading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Indicador de upload */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">
                  {uploadProgress ? `${uploadProgress.percentage}%` : 'Fazendo upload...'}
                </p>
                {uploadProgress && (
                  <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            flex flex-col items-center justify-center space-y-2
            ${dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress ? `${uploadProgress.percentage}%` : 'Fazendo upload...'}
              </p>
              {uploadProgress && (
                <div className="w-32 bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Ou arraste e solte aqui
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                JPEG, PNG, WebP ou SVG (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;