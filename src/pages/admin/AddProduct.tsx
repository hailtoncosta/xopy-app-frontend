import { CurrencyInput } from '@/components/ui/currency-input';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Package, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { contentService } from '@/services/contentService';
import { useToast } from '@/hooks/use-toast';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'produto',
    category: '',
    image_url: '',
    product_group: 'home',
    is_featured: false,
    is_essential: false,
    is_top_choice: false,
    is_offer: false,
    rating: 5.0,
    advertiser_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({ ...prev, image_url: url || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast({
        title: "Erro",
        description: "Por favor, adicione uma imagem para o produto.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        type: formData.type,
        image_url: formData.image_url,
        product_group: formData.product_group,
        is_featured: formData.is_featured,
        is_essential: formData.is_essential,
        is_top_choice: formData.is_top_choice,
        is_offer: formData.is_offer,
        rating: formData.rating,
        is_active: true,
        order_index: 0
      };

      await contentService.createProduct(productData);
      
      toast({
        title: "Sucesso!",
        description: "Produto adicionado com sucesso."
      });

      // Disparar evento para atualizar página principal
      window.dispatchEvent(new CustomEvent('productCreated'));
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Adicionar Produto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Novo Produto</h1>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Digite o nome do produto"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preço *
                  </label>
                  <CurrencyInput
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="produto">Produto</option>
                    <option value="serviço">Serviço</option>
                    <option value="locação">Locação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <optgroup label="Produtos">
                      <option value="Cimento e Argamassa">Cimento e Argamassa</option>
                      <option value="Tijolos e Blocos">Tijolos e Blocos</option>
                      <option value="Telhas e Coberturas">Telhas e Coberturas</option>
                      <option value="Pisos e Revestimentos">Pisos e Revestimentos</option>
                      <option value="Tintas e Vernizes">Tintas e Vernizes</option>
                      <option value="Ferragens">Ferragens</option>
                      <option value="Tubos e Conexões">Tubos e Conexões</option>
                      <option value="Madeiras">Madeiras</option>
                      <option value="Metais">Metais</option>
                      <option value="Isolamento">Isolamento</option>
                      <option value="Ferramentas">Ferramentas</option>
                    </optgroup>
                    <optgroup label="Serviços">
                      <option value="Pedreiro">Pedreiro</option>
                      <option value="Pintor">Pintor</option>
                      <option value="Eletricista">Eletricista</option>
                      <option value="Encanador">Encanador</option>
                      <option value="Marceneiro">Marceneiro</option>
                      <option value="Jardineiro">Jardineiro</option>
                      <option value="Engenheiro">Engenheiro</option>
                      <option value="Arquiteto">Arquiteto</option>
                    </optgroup>
                    <optgroup label="Locações">
                      <option value="Máquinas Pesadas">Máquinas Pesadas</option>
                      <option value="Plataformas Elevatórias">Plataformas Elevatórias</option>
                      <option value="Ferramentas Elétricas">Ferramentas Elétricas</option>
                      <option value="Equipamentos de Segurança">Equipamentos de Segurança</option>
                      <option value="Andaimes e Escadas">Andaimes e Escadas</option>
                      <option value="Compressores e Geradores">Compressores e Geradores</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Anunciante
                  </label>
                  <input
                    type="text"
                    value={formData.advertiser_name}
                    onChange={(e) => setFormData({...formData, advertiser_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Nome do anunciante/vendedor"
                  />
                </div>
              </div>

              {/* Imagem e Configurações */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagem do Produto *
                  </label>
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={handleImageChange}
                    folder="products"
                    placeholder="Clique para fazer upload da imagem do produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seção da Página Principal
                  </label>
                  <select
                    value={formData.product_group}
                    onChange={(e) => setFormData({...formData, product_group: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="home">Página Principal</option>
                    <option value="featured">Destaque</option>
                    <option value="essentials">Essenciais</option>
                    <option value="top_choices">Melhores Escolhas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avaliação
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={5.0}>⭐⭐⭐⭐⭐ (5.0)</option>
                    <option value={4.5}>⭐⭐⭐⭐⭐ (4.5)</option>
                    <option value={4.0}>⭐⭐⭐⭐ (4.0)</option>
                    <option value={3.5}>⭐⭐⭐⭐ (3.5)</option>
                    <option value={3.0}>⭐⭐⭐ (3.0)</option>
                  </select>
                </div>

                {/* Flags */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Configurações de Exibição</h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">
                      Produto em Destaque
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_essential"
                      checked={formData.is_essential}
                      onChange={(e) => setFormData({...formData, is_essential: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_essential" className="text-sm text-gray-700 dark:text-gray-300">
                      Produto Essencial
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_top_choice"
                      checked={formData.is_top_choice}
                      onChange={(e) => setFormData({...formData, is_top_choice: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_top_choice" className="text-sm text-gray-700 dark:text-gray-300">
                      Melhor Escolha
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_offer"
                      checked={formData.is_offer}
                      onChange={(e) => setFormData({...formData, is_offer: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_offer" className="text-sm text-gray-700 dark:text-gray-300">
                      Em Oferta
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Produto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;