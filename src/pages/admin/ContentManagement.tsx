import { CurrencyInput } from '@/components/ui/currency-input';
import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Heart, MessageCircle, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { contentService, type DynamicBanner, type DynamicCategory, type DynamicProduct, type DynamicClip } from '@/services/contentService';
import videoUploadService from '@/services/videoUploadService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ContentType = 'banners' | 'categories' | 'products' | 'clips' | 'news' | 'promotional' | 'store';

interface BannerFormData {
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  is_active: boolean;
  order_index: number;
}

interface CategoryFormData {
  id: string;
  label: string;
  icon_name: string;
  is_active: boolean;
  order_index: number;
}

interface ProductFormData {
  name: string;
  price: string;
  image_url: string;
  type: 'produto' | 'serviço' | 'decoração';
  category: string;
  rating: number;
  is_offer: boolean;
  is_featured: boolean;
  is_essential: boolean;
  is_top_choice: boolean;
  product_group: string;
  is_active: boolean;
  order_index: number;
}

function ContentManagement() {
  const [activeTab, setActiveTab] = useState<ContentType>('banners');
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<DynamicBanner[]>([]);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [products, setProducts] = useState<DynamicProduct[]>([]);
  const [clips, setClips] = useState<DynamicClip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const tabs = [
    { id: 'banners', label: 'Banners Principais' },
    { id: 'categories', label: 'Categorias' },
    { id: 'products', label: 'Produtos' },
    { id: 'clips', label: 'Clips (Vídeos)' },
    { id: 'news', label: 'Banner de Notícias' },
    { id: 'promotional', label: 'Banner Promocional' },
    { id: 'store', label: 'Dados da Loja' }
  ];

  const iconOptions = [
    'Tag', 'Wrench', 'Star', 'TrendingUp', 'Heart', 'Home', 'ShoppingCart', 'Package', 'Truck'
  ];

  const productGroups = [
    'home', 'featured', 'essential', 'tiles', 'paint', 'decoration', 'topChoices'
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'banners':
          const banners = await contentService.getBanners();
          setBanners(banners);
          break;
        case 'categories':
          const categories = await contentService.getCategories();
          setCategories(categories);
          break;
        case 'products':
          const products = await contentService.getProducts();
          setProducts(products);
          break;
        case 'clips':
          const clips = await contentService.getClips();
          setClips(clips);
          break;
        case 'news':
          // Carregar banner de notícias
          break;
        case 'promotional':
          // Carregar banner promocional
          break;
        case 'store':
          // Carregar dados da loja
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Salvando item...', { activeTab, isEditing: !!editingItem, formData });

      if (!formData.title && activeTab === 'clips') {
        toast.error('O título do vídeo é obrigatório');
        return;
      }

      if (!formData.video_url && activeTab === 'clips') {
        toast.error('É necessário adicionar um vídeo (faça upload ou cole uma URL)');
        return;
      }

      if (editingItem) {
        // Atualizar item existente
        console.log('🔄 Atualizando item existente...', editingItem.id);
        let result;
        switch (activeTab) {
          case 'banners':
            result = await contentService.updateBanner(editingItem.id, formData);
            break;
          case 'categories':
            result = await contentService.updateCategory(editingItem.id, formData);
            break;
          case 'products':
            result = await contentService.updateProduct(editingItem.id, formData);
            break;
          case 'clips':
            result = await contentService.updateClip(editingItem.id, formData);
            break;
        }
        console.log('✅ Item atualizado:', result);
        if (result) {
          toast.success('Item atualizado com sucesso!');
        } else {
          throw new Error('Falha ao atualizar item');
        }
      } else {
        // Criar novo item
        console.log('🆕 Criando novo item...');
        let result;
        switch (activeTab) {
          case 'banners':
            result = await contentService.createBanner(formData);
            break;
          case 'categories':
            result = await contentService.createCategory(formData);
            break;
          case 'products':
            result = await contentService.createProduct(formData);
            break;
          case 'clips':
            result = await contentService.createClip(formData);
            break;
        }
        console.log('✅ Item criado:', result);
        if (result) {
          toast.success('Item criado com sucesso!');
        } else {
          throw new Error('Falha ao criar item');
        }
      }
      
      // Disparar evento para atualizar página principal
      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type: activeTab, section: activeTab }
      }));
      window.dispatchEvent(new CustomEvent('clipsSectionUpdated'));
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      await loadData();
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!(await appConfirm('Tem certeza que deseja excluir este item?'))) return;
    
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'banners':
          await contentService.deleteBanner(id);
          break;
        case 'categories':
          await contentService.deleteCategory(id);
          break;
        case 'products':
          await contentService.deleteProduct(id);
          break;
        case 'clips':
          await contentService.deleteClip(id);
          break;
      }
      
      // Disparar evento para atualizar página principal
      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type: activeTab, section: activeTab }
      }));
      window.dispatchEvent(new CustomEvent('clipsSectionUpdated'));
      
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData(getDefaultFormData());
    }
    setShowForm(true);
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'banners':
        return {
          title: '',
          description: '',
          image_url: '',
          alt_text: '',
          is_active: true,
          order_index: 0
        };
      case 'categories':
        return {
          id: '',
          label: '',
          icon_name: 'Tag',
          is_active: true,
          order_index: 0
        };
      case 'products':
        return {
          name: '',
          price: '',
          image_url: '',
          type: 'produto' as const,
          category: '',
          rating: 0,
          is_offer: false,
          is_featured: false,
          is_essential: false,
          is_top_choice: false,
          product_group: 'home',
          is_active: true,
          order_index: 0
        };
      case 'clips':
        return {
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          author_name: 'Xopy',
          author_avatar: '',
          duration: '0:30',
          likes: 0,
          comments: 0,
          category: 'Construção',
          is_active: true,
          order_index: 0
        };
      default:
        return {};
    }
  };

  const renderBannerForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagem do Banner
        </label>
        <ImageUpload
          currentImage={formData.image_url}
          onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
          folder="banners"
          maxWidth={1200}
          maxHeight={400}
          placeholder="Faça upload da imagem do banner"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Texto Alternativo
        </label>
        <input
          type="text"
          value={formData.alt_text || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordem
          </label>
          <input
            type="number"
            value={formData.order_index || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ativo
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCategoryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ID da Categoria
        </label>
        <input
          type="text"
          value={formData.id || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
          disabled={editingItem}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome da Categoria
        </label>
        <input
          type="text"
          value={formData.label || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ícone
        </label>
        <select
          value={formData.icon_name || 'Tag'}
          onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          {iconOptions.map(icon => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordem
          </label>
          <input
            type="number"
            value={formData.order_index || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ativo
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome do Produto
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preço
          </label>
          <CurrencyInput
            type="text"
            value={formData.price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="R$ 0,00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagem do Produto
        </label>
        <ImageUpload
          currentImage={formData.image_url}
          onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
          folder="products"
          maxWidth={600}
          maxHeight={600}
          placeholder="Faça upload da imagem do produto"
          disabled={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo
          </label>
          <select
            value={formData.type || 'produto'}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="produto">Produto</option>
            <option value="serviço">Serviço</option>
            <option value="decoração">Decoração</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avaliação
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Grupo do Produto
        </label>
        <select
          value={formData.product_group || 'home'}
          onChange={(e) => setFormData(prev => ({ ...prev, product_group: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          {productGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_offer || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_offer: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Em Oferta</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_featured || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Destaque</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_essential || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_essential: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Essencial</span>
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_top_choice || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_top_choice: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Choice</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativo</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ordem
            </label>
            <input
              type="number"
              value={formData.order_index || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderClipsForm = () => {
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingVideo(true);
      setUploadProgress(0);

      try {
        const result = await videoUploadService.uploadVideo(file, (progress) => {
          setUploadProgress(progress.percentage);
        });

        if (result.success && result.url) {
          setFormData(prev => ({ ...prev, video_url: result.url }));
          toast.success('Vídeo enviado com sucesso!');
        } else {
          toast.error(result.error || 'Erro ao enviar vídeo');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar vídeo');
      } finally {
        setUploadingVideo(false);
        setUploadProgress(0);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título do Vídeo
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Ex: Como aplicar cimento queimado"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Descrição opcional do vídeo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vídeo
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {uploadingVideo ? 'Enviando...' : 'Fazer Upload'}
              </label>
              <span className="text-sm text-gray-500">
                MP4, WebM ou MOV (máx. 50MB)
              </span>
            </div>
            
            {uploadingVideo && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div className="text-center text-sm text-gray-500 my-2">ou</div>
            
            <input
              type="url"
              value={formData.video_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Cole a URL do vídeo"
              disabled={uploadingVideo}
            />
          </div>
          {formData.video_url && (
            <p className="text-xs text-green-600 mt-1">✓ Vídeo selecionado</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail (Capa)
          </label>
          <ImageUpload
            currentImage={formData.thumbnail_url}
            onImageChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url || '' }))}
            folder="clips"
            maxWidth={800}
            maxHeight={1200}
            placeholder="Faça upload da capa do vídeo"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Autor
            </label>
            <input
              type="text"
              value={formData.author_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Nome do autor"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duração
            </label>
            <input
              type="text"
              value={formData.duration || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: 1:30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avatar do Autor (URL)
          </label>
          <input
            type="url"
            value={formData.author_avatar || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, author_avatar: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Tutorial"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordem
            </label>
            <input
              type="number"
              value={formData.order_index || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativo</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'banners':
        return renderBannerForm();
      case 'categories':
        return renderCategoryForm();
      case 'products':
        return renderProductForm();
      case 'clips':
        return renderClipsForm();
      default:
        return <div>Formulário não implementado para esta seção</div>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Conteúdo
          </h1>
          
          {activeTab !== 'news' && activeTab !== 'promotional' && activeTab !== 'store' && (
            <Button
              onClick={() => openForm()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar {activeTab === 'banners' ? 'Banner' : activeTab === 'categories' ? 'Categoria' : activeTab === 'clips' ? 'Clip' : 'Produto'}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ContentType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                {activeTab === 'banners' && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Lista de banners será implementada aqui
                  </div>
                )}
                
                {activeTab === 'categories' && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Lista de categorias será implementada aqui
                  </div>
                )}
                
                {activeTab === 'products' && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Lista de produtos será implementada aqui
                  </div>
                )}
                
                {activeTab === 'clips' && (
                  <div className="space-y-4">
                    {clips.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Nenhum clip cadastrado. Clique em "Adicionar Clip" para começar.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clips.map((clip) => (
                          <div key={clip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                              {clip.thumbnail_url ? (
                                <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  Sem thumbnail
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {clip.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <Heart className="w-4 h-4" />
                              {clip.likes || 0}
                              <MessageCircle className="w-4 h-4 ml-2" />
                              {clip.comments || 0}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => openForm(clip)}
                                size="sm"
                                variant="outline"
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDelete(clip.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {(activeTab === 'news' || activeTab === 'promotional' || activeTab === 'store') && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Editor para {activeTab} será implementado aqui
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal do Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'banners' ? 'Banner' : activeTab === 'categories' ? 'Categoria' : 'Produto'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                
                {renderForm()}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;