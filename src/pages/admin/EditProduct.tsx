import { CurrencyInput } from '@/components/ui/currency-input';
import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Package, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { contentService, type DynamicProduct } from '@/services/contentService';
import { useToast } from '@/hooks/use-toast';

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
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
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoadingProduct(true);
      const products = await contentService.getProducts();
      const product = products.find(p => p.id === parseInt(id));
      
      if (product) {
        setFormData({
          name: product.name,
          price: product.price,
          type: product.type,
          category: product.category,
          image_url: product.image_url,
          product_group: product.product_group || 'home',
          is_featured: product.is_featured || false,
          is_essential: product.is_essential || false,
          is_top_choice: product.is_top_choice || false,
          is_offer: product.is_offer || false,
          rating: product.rating || 5.0,
          is_active: product.is_active !== false
        });
      } else {
        toast({
          title: "Erro",
          description: "Produto não encontrado.",
          variant: "destructive"
        });
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produto.",
        variant: "destructive"
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({ ...prev, image_url: url || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    setLoading(true);
    
    try {
      const updatedProduct = {
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
        is_active: formData.is_active
      };

      await contentService.updateProduct(parseInt(id), updatedProduct);
      
      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso."
      });

      // Disparar evento para atualizar página principal
      window.dispatchEvent(new CustomEvent('productUpdated'));
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !(await appConfirm('Tem certeza que deseja excluir este produto?'))) return;

    setLoading(true);
    
    try {
      await contentService.deleteProduct(parseInt(id));
      
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso."
      });

      // Disparar evento para atualizar página principal
      window.dispatchEvent(new CustomEvent('productDeleted'));
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <AdminLayout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Carregando produto...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editar Produto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Produto</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                title="Excluir produto"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/admin/products')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
              </div>

              {/* Imagem e Configurações */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagem do Produto
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
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                      Produto Ativo
                    </label>
                  </div>

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
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;