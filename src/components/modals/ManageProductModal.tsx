import { CurrencyInput } from '@/components/ui/currency-input';
import { appNotify } from '@/lib/feedback';
import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Plus,
  Save,
  Package,
  DollarSign,
  FileText,
  Tag,
  Store
} from 'lucide-react';
import { generateUUID } from '@/utils/uuid';

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  type: 'produto' | 'serviço' | 'locação';
  category: string;
  storeName: string;
  images: string[];
  isActive: boolean;
}

interface ManageProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
  storeName: string;
}

const ManageProductModal: React.FC<ManageProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  storeName
}) => {
  const [formData, setFormData] = useState<Product>({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    type: product?.type || 'produto',
    category: product?.category || '',
    storeName: product?.storeName || storeName,
    images: product?.images || [],
    isActive: product?.isActive ?? true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = {
    produto: [
      'Cimento e Argamassa',
      'Tijolos e Blocos',
      'Telhas e Coberturas',
      'Pisos e Revestimentos',
      'Tintas e Vernizes',
      'Ferragens',
      'Tubos e Conexões',
      'Madeiras',
      'Metais',
      'Isolamento',
      'Ferramentas',
      'Outros'
    ],
    serviço: [
      'Pedreiro',
      'Pintor',
      'Eletricista',
      'Encanador',
      'Marceneiro',
      'Jardineiro',
      'Engenheiro',
      'Arquiteto'
    ],
    locação: [
      'Máquinas Pesadas',
      'Plataformas Elevatórias',
      'Ferramentas Elétricas',
      'Equipamentos de Segurança',
      'Andaimes e Escadas',
      'Compressores e Geradores'
    ]
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && formData.images.length < 5) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/') && formData.images.length < 5) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, imageUrl]
            }));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim() || formData.price <= 0) {
      appNotify('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const productToSave: Product = {
      ...formData,
      id: product?.id || generateUUID()
    };

    onSave(productToSave);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      type: 'produto',
      category: '',
      storeName: storeName,
      images: [],
      isActive: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-black">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Imagens do Produto (até 5)
            </label>
            
            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Produto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Add Image Button */}
              {formData.images.length < 5 && (
                <button
                  onClick={handleImageUpload}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors"
                >
                  <Plus className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Adicionar</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Produto *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Cimento Portland 50kg"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.type}
                onChange={(e) => {
                  handleInputChange('type', e.target.value);
                  handleInputChange('category', ''); // Reset category when type changes
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="produto">Produto</option>
                <option value="serviço">Serviço</option>
                <option value="locação">Locação</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories[formData.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço (R$) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <CurrencyInput
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Loja
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="Nome da sua loja"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o produto, suas características, especificações técnicas..."
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Produto ativo (visível para compradores)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {product ? 'Salvar Alterações' : 'Adicionar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageProductModal;