import { CurrencyInput } from '@/components/ui/currency-input';
import { appNotify } from '@/lib/feedback';
import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Save,
  Package,
  DollarSign,
  FileText,
  Tag,
  MapPin,
  Hash,
  Ruler,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ProductService } from '@/services/productService';

interface StoreProduct {
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

interface ManageUserProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: StoreProduct | null;
  onSave: (product: StoreProduct) => void;
}

const ManageUserProductModal: React.FC<ManageUserProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<StoreProduct>>({
    product_name: product?.product_name || '',
    product_description: product?.product_description || '',
    product_price: product?.product_price || 0,
    product_quantity: product?.product_quantity || 1,
    product_unit: product?.product_unit || 'unidade',
    product_condition: product?.product_condition || 'new',
    product_location: product?.product_location || '',
    material_type: product?.material_type || '',
    product_images: product?.product_images || [],
    status: product?.status || 'active'
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materialTypes = [
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
  ];

  const units = [
    'unidade',
    'kg',
    'g',
    'litro',
    'ml',
    'm²',
    'm³',
    'metro',
    'cm',
    'saco',
    'caixa',
    'pacote'
  ];

  const conditions = [
    { value: 'new', label: 'Novo' },
    { value: 'used', label: 'Usado' },
    { value: 'refurbished', label: 'Reformado' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Ativo', icon: CheckCircle, color: 'text-green-600' },
    { value: 'inactive', label: 'Inativo', icon: Clock, color: 'text-gray-400' },
    { value: 'sold', label: 'Vendido', icon: DollarSign, color: 'text-blue-600' }
  ];

  const handleInputChange = (field: keyof StoreProduct, value: any) => {
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
    if (files && formData.product_images && formData.product_images.length < 5) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/') && formData.product_images!.length < 5) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            setFormData(prev => ({
              ...prev,
              product_images: [...(prev.product_images || []), imageUrl]
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
      product_images: prev.product_images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    if (!formData.product_name?.trim() || !formData.product_description?.trim() || !formData.product_price || formData.product_price <= 0) {
      appNotify('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const productToSave: StoreProduct = {
        ...product,
        ...formData,
        id: product?.id || '',
        user_id: product?.user_id || '',
        seller_type: product?.seller_type || 'individual',
        seller_name: product?.seller_name || '',
        seller_email: product?.seller_email || '',
        seller_phone: product?.seller_phone || '',
        created_at: product?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as StoreProduct;

      // Se é um produto existente, atualizar no banco
      if (product?.id) {
        await ProductService.updateProduct(product.id, productToSave);
      }

      onSave(productToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      appNotify('Erro ao salvar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product_name: '',
      product_description: '',
      product_price: 0,
      product_quantity: 1,
      product_unit: 'unidade',
      product_condition: 'new',
      product_location: '',
      material_type: '',
      product_images: [],
      status: 'active'
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
            {product ? 'Editar Anúncio' : 'Novo Anúncio'}
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
              {formData.product_images?.map((image, index) => (
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
              {(!formData.product_images || formData.product_images.length < 5) && (
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

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.product_name || ''}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="Ex: Cimento Portland 50kg"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.material_type || ''}
                onChange={(e) => handleInputChange('material_type', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecione uma categoria</option>
                {materialTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <CurrencyInput
                  type="number"
                  value={formData.product_price || 0}
                  onChange={(e) => handleInputChange('product_price', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.product_quantity || 1}
                  onChange={(e) => handleInputChange('product_quantity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Unit and Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.product_unit || 'unidade'}
                  onChange={(e) => handleInputChange('product_unit', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condição
              </label>
              <select
                value={formData.product_condition || 'new'}
                onChange={(e) => handleInputChange('product_condition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localização
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.product_location || ''}
                onChange={(e) => handleInputChange('product_location', e.target.value)}
                placeholder="Ex: São Paulo, SP"
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
                value={formData.product_description || ''}
                onChange={(e) => handleInputChange('product_description', e.target.value)}
                placeholder="Descreva detalhadamente o produto, suas características, especificações técnicas..."
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Anúncio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statusOptions.map((status) => {
                const IconComponent = status.icon;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleInputChange('status', status.value)}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      formData.status === status.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${status.color}`} />
                    <span className="text-sm font-medium text-gray-700">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Salvando...' : (product ? 'Salvar Alterações' : 'Criar Anúncio')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUserProductModal;