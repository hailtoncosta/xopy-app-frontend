import { CurrencyInput } from '@/components/ui/currency-input';
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Grid3X3,
  ShoppingBag,
  Star,
  Truck,
  Palette,
  Play,
  Settings,
  Eye,
  EyeOff,
  Percent,
  Plug
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { contentService, type DynamicBanner, type DynamicProduct } from '@/services/contentService';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { deleteSectionItem } from '@/services/sectionDeletion';

type SectionType = 'carousel' | 'categories' | 'featured' | 'rentals' | 'paint' | 'essential' | 'tiles' | 'decoration' | 'topChoices' | 'electro' | 'tools' | 'clips' | 'category-chips' | 'news-banner' | 'offers' | 'product-detail-banner' | 'popular-categories' | 'promo-banner';

interface SectionConfig {
  id: SectionType;
  name: string;
  description: string;
  icon: React.ElementType;
  dbField?: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'carousel',
    name: 'Carrossel Principal',
    description: 'Banners rotativos no topo da página inicial',
    icon: ImageIcon
  },
  {
    id: 'categories',
    name: 'Categorias',
    description: 'Categorias de navegação (Ofertas, Serviços, etc.)',
    icon: Grid3X3
  },
  {
    id: 'featured',
    name: 'Destaques',
    description: 'Produtos em destaque na página inicial',
    icon: Star,
    dbField: 'is_featured'
  },
  {
    id: 'rentals',
    name: 'Locações',
    description: 'Seção de equipamentos para locação',
    icon: Truck
  },
  {
    id: 'paint',
    name: 'Semana da Pintura',
    description: 'Produtos relacionados à pintura',
    icon: Palette,
    dbField: 'product_group'
  },
  {
    id: 'essential',
    name: 'Essenciais da Obra',
    description: 'Produtos essenciais para construção',
    icon: ShoppingBag,
    dbField: 'is_essential'
  },
  {
    id: 'tiles',
    name: 'Telhas',
    description: 'Produtos de cobertura e telhas',
    icon: Settings,
    dbField: 'category'
  },
  {
    id: 'decoration',
    name: 'Vibe Decoração',
    description: 'Produtos de decoração e acabamento',
    icon: Star,
    dbField: 'product_group'
  },
  {
    id: 'topChoices',
    name: 'Top Escolhas pra Você',
    description: 'Produtos mais populares e recomendados',
    icon: Star,
    dbField: 'is_top_choice'
  },
  {
    id: 'electro',
    name: 'Eletro',
    description: 'Ferramentas e equipamentos elétricos',
    icon: Plug,
    dbField: 'product_group'
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    description: 'Ferramentas manuais e elétricas',
    icon: Settings,
    dbField: 'category'
  },
  {
    id: 'clips',
    name: 'Clips',
    description: 'Vídeos de produtos e serviços',
    icon: Play
  },
  {
    id: 'category-chips',
    name: 'Category Chips',
    description: 'Chips de categorias (Tudo, Ofertas, Serviços, etc.)',
    icon: Grid3X3
  },
  {
    id: 'news-banner',
    name: 'Banner de Notícias',
    description: 'Banner que aparece abaixo dos category chips na página principal',
    icon: ImageIcon
  },
  // Banner Promocional removido - não é mais necessário
  // {
  //   id: 'promo-banner',
  //   name: 'Banner Promocional',
  //   description: 'Banner promocional com oferta especial',
  //   icon: Percent
  // },
  {
    id: 'offers',
    name: 'Super Ofertas',
    description: 'Produtos em promoção com descontos especiais',
    icon: Percent,
    dbField: 'is_offer'
  },
  {
    id: 'product-detail-banner',
    name: 'Banner Detalhes Produto',
    description: 'Banner de desconto na página de detalhes do produto',
    icon: ShoppingBag
  },
  {
    id: 'popular-categories',
    name: 'Categorias Populares',
    description: 'Categorias que aparecem na página "Ver mais" (modal de categorias)',
    icon: Grid3X3
  }
];

const SectionManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('carousel');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ item: any; section: SectionType } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteBusy = useRef(false);
  const [saving, setSaving] = useState(false);

  // Estados para diferentes tipos de dados
  const [banners, setBanners] = useState<DynamicBanner[]>([]);
  const [products, setProducts] = useState<DynamicProduct[]>([]);
  const [categoryChips, setCategoryChips] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Estados do formulário
  const [formData, setFormData] = useState<any>({});
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  useEffect(() => {
    loadSectionData();
  }, [activeSection]);

  // Listener para sincronização automática do cache
  useEffect(() => {
    const handleTilesProductUpdate = (event: CustomEvent) => {
      console.log('🔄 Admin: Evento de produto de telha recebido:', event.detail);
      if (activeSection === 'tiles') {
        console.log('🏠 Admin: Recarregando produtos de telhas devido a atualização...');
        loadSectionData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tiles_products_cache' && activeSection === 'tiles') {
        console.log('📱 Admin: Cache de telhas atualizado, recarregando...');
        setTimeout(() => loadSectionData(), 500);
      }
    };

    // Adicionar listeners
    window.addEventListener('tilesProductUpdated', handleTilesProductUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('tilesProductUpdated', handleTilesProductUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeSection]);

  const loadProductsForSection = async (section: string) => {
    try {
      console.log('🔍 Carregando produtos para seção:', section);
      
      let filteredProducts = [];

      // Se a seção é rentals, buscar da tabela de locações
      if (section === 'rentals' || section === 'rental') {
        console.log('🚛 Buscando equipamentos de locação...');
        const rentals = await contentService.getRentals();
        
        // Converter rentals para formato de produto para compatibilidade
        filteredProducts = rentals.map((rental: any) => ({
          id: rental.id,
          name: rental.name,
          price: rental.price,
          image_url: rental.image_url,
          category: rental.category,
          type: 'locação',
          product_group: 'rental',
          is_active: rental.is_active,
          order_index: rental.order_index
        }));
        
        console.log(`✅ ${filteredProducts.length} equipamentos de locação encontrados`);
      } else {
        // Para outras seções, buscar de produtos
        const allProducts = await contentService.getProducts();

        switch (section) {
          case 'paint':
            filteredProducts = allProducts.filter(p => p.product_group === 'paint');
            break;
          case 'electro':
            filteredProducts = allProducts.filter(p => p.product_group === 'electro');
            break;
          case 'tools':
            filteredProducts = allProducts.filter(p => p.category === 'Ferramentas');
            break;
          case 'essential':
            filteredProducts = allProducts.filter(p => p.is_essential);
            break;
          case 'tiles':
            filteredProducts = allProducts.filter(p => p.category === 'Telhas e Coberturas' || p.product_group === 'tiles');
            break;
          case 'decoration':
            filteredProducts = allProducts.filter(p => p.product_group === 'decoration');
            break;
          case 'featured':
            filteredProducts = allProducts.filter(p => p.is_featured);
            break;
          case 'topChoices':
            filteredProducts = allProducts.filter(p => p.is_top_choice);
            break;
          case 'offers':
            filteredProducts = allProducts.filter(p => p.is_offer);
            break;
          default:
            filteredProducts = allProducts;
        }

        console.log(`✅ ${filteredProducts.length} produtos encontrados para seção ${section}`);
      }

      setAvailableProducts(filteredProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setAvailableProducts([]);
    }
  };

  const loadSectionData = async () => {
    setLoading(true);
    try {
      switch (activeSection) {
        case 'carousel':
          const banners = await contentService.getBanners();
          setBanners(banners);
          break;
        case 'featured':
          const featuredProducts = await contentService.getProducts();
          setProducts(featuredProducts.filter(p => p.is_featured));
          break;
        case 'paint':
          const paintProducts = await contentService.getProducts();
          const filteredPaintProducts = paintProducts.filter(p => p.product_group === 'paint');
          console.log('🎨 Produtos de pintura carregados:', {
            total: paintProducts.length,
            filtrados: filteredPaintProducts.length,
            produtos: filteredPaintProducts.map(p => ({ id: p.id, name: p.name, product_group: p.product_group }))
          });
          // Exibir somente produtos cadastrados.
          const paintToShow = filteredPaintProducts;
          setProducts(paintToShow);
          break;
        case 'essential':
          const essentialProducts = await contentService.getProducts();
          const filteredEssentialProducts = essentialProducts.filter(p => p.is_essential);
          console.log('🏗️ Produtos essenciais carregados:', {
            total: essentialProducts.length,
            filtrados: filteredEssentialProducts.length,
            produtos: filteredEssentialProducts.map(p => ({ id: p.id, name: p.name, is_essential: p.is_essential }))
          });
          // Exibir somente produtos cadastrados.
          const essentialsToShow = filteredEssentialProducts;
          setProducts(essentialsToShow);
          break;
        case 'rentals':
          console.log('🚛 Carregando locações...');
          const rentalsData = await contentService.getRentals();
          console.log('🚛 Locações carregadas:', rentalsData.length);
          setProducts(rentalsData);
          break;
        case 'offers':
          console.log('🔥 Carregando ofertas...');
          const offersProducts = await contentService.getProducts();
          const filteredOffers = offersProducts.filter(p => p.is_offer);
          console.log('🔥 Ofertas carregadas:', {
            total: offersProducts.length,
            filtrados: filteredOffers.length,
            produtos: filteredOffers.map(p => ({ id: p.id, name: p.name, is_offer: p.is_offer, discount: p.discount }))
          });
          setProducts(filteredOffers);
          break;
        case 'tiles': {
          const tilesProducts = await contentService.getProducts();
          setProducts(tilesProducts.filter(p => p.category === 'Telhas e Coberturas' || p.product_group === 'tiles'));
          break;
        }
        case 'decoration':
          const decorationProducts = await contentService.getProducts();
          const filteredDecorationProducts = decorationProducts.filter(p => p.product_group === 'decoration' || p.type === 'decoração');
          console.log('✨ Produtos de decoração carregados:', {
            total: decorationProducts.length,
            filtrados: filteredDecorationProducts.length,
            produtos: filteredDecorationProducts.map(p => ({ id: p.id, name: p.name, product_group: p.product_group, type: p.type }))
          });
          setProducts(filteredDecorationProducts);
          break;
        case 'topChoices':
          const topProducts = await contentService.getProducts();
          const filteredTopProducts = topProducts.filter(p => p.is_top_choice);
          console.log('⭐ Produtos top choices carregados:', {
            total: topProducts.length,
            filtrados: filteredTopProducts.length,
            produtos: filteredTopProducts.map(p => ({ id: p.id, name: p.name, is_top_choice: p.is_top_choice }))
          });
          // Exibir somente produtos cadastrados.
          const topChoicesToShow = filteredTopProducts;
          setProducts(topChoicesToShow);
          break;
        case 'electro':
          const electroProducts = await contentService.getProducts();
          const filteredElectroProducts = electroProducts.filter(p => p.product_group === 'electro');
          setProducts(filteredElectroProducts);
          break;
        case 'tools':
          console.log('🔧 Carregando ferramentas...');
          const toolsProducts = await contentService.getProducts();
          const filteredToolsProducts = toolsProducts.filter(p => p.category === 'Ferramentas');
          console.log('🔧 Ferramentas carregadas:', {
            total: toolsProducts.length,
            filtrados: filteredToolsProducts.length,
            produtos: filteredToolsProducts.map(p => ({ id: p.id, name: p.name, category: p.category }))
          });
          setProducts(filteredToolsProducts);
          break;
        case 'clips':
          const clipsData = await contentService.getClips();
          console.log('🎬 Clips carregados do banco:', clipsData.length, clipsData);

          // Converter clips mantendo todos os dados originais
          const clipsAsProducts = clipsData.map(clip => ({
            // Manter ID original
            id: clip.id,

            // Dados principais
            title: clip.title,
            name: clip.title, // Para compatibilidade
            description: clip.description || '',

            // URLs
            video_url: clip.video_url,
            thumbnail_url: clip.thumbnail_url,
            image_url: clip.thumbnail_url, // Para compatibilidade

            // Autor
            author_name: clip.author_name,
            author_avatar: clip.author_avatar,

            // Métricas
            duration: clip.duration || '0:58',
            price: clip.duration || '0:58', // Para compatibilidade com renderização
            likes: clip.likes || 0,
            comments: clip.comments || 0,

            // Categorização
            category: clip.category || 'Tutorial',
            type: 'video',
            product_group: 'clips',

            // Status
            is_active: clip.is_active !== false,
            order_index: clip.order_index || 0,

            // Dados técnicos
            rating: 5.0, // Para compatibilidade
            created_at: clip.created_at,
            updated_at: clip.updated_at
          }));

          console.log('✅ Clips processados para exibição:', clipsAsProducts);
          setProducts(clipsAsProducts);
          break;
        case 'category-chips':
          const chips = await contentService.getCategoryChips();
          setCategoryChips(chips);
          break;
        case 'popular-categories':
          const popularCats = await contentService.getPopularCategories();
          setProducts(popularCats.map(cat => ({
            id: cat.id,
            name: cat.name,
            image_url: cat.image_url,
            category: cat.store,
            price: cat.banner_title || 'Super Ofertas',
            type: 'categoria',
            rating: 0,
            is_offer: false,
            is_featured: false,
            is_essential: false,
            is_top_choice: false,
            product_group: 'popular-categories',
            is_active: cat.is_active,
            order_index: cat.order_index,
            created_at: cat.created_at || '',
            updated_at: cat.updated_at || ''
          })) as any);
          break;
        case 'news-banner':
          try {
            const newsBanner = await contentService.getNewsBanner();
            if (newsBanner) {
              setBanners([newsBanner]);
            } else {
              // Criar banner padrão se não existir
              setBanners([{
                id: 0,
                title: 'Novidades da Semana',
                description: 'Confira as novidades e promoções desta semana',
                image_url: '',
                alt_text: 'Banner de novidades',
                is_active: true,
                order_index: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            }
          } catch (error) {
            console.log('News banner não encontrado, criando dados padrão');
            setBanners([{
              id: 0,
              title: 'Novidades da Semana',
              description: 'Confira as novidades e promoções desta semana',
              image_url: '',
              alt_text: 'Banner de novidades',
              is_active: true,
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
          }
          break;
        case 'promo-banner':
          try {
            const promoBanner = await contentService.getPromotionalBanner();
            if (promoBanner) {
              setBanners([promoBanner]);
            } else {
              // Criar banner padrão se não existir
              setBanners([{
                id: 0,
                title: 'Oferta Especial!',
                description: 'Desconto de até 50% em produtos selecionados desta categoria',
                image_url: '',
                alt_text: 'Banner promocional',
                is_active: true,
                order_index: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            }
          } catch (error) {
            console.log('Promotional banner não encontrado, criando dados padrão');
            setBanners([{
              id: 0,
              title: 'Oferta Especial!',
              description: 'Desconto de até 50% em produtos selecionados desta categoria',
              image_url: '',
              alt_text: 'Banner promocional',
              is_active: true,
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
          }
          break;
        case 'product-detail-banner':
          try {
            const productDetailBanner = await contentService.getProductDetailBanner();
            if (productDetailBanner) {
              setBanners([productDetailBanner]);
            } else {
              // Criar banner padrão se não existir
              setBanners([{
                id: 0,
                title: '40% OFF',
                description: 'nas compras acima de R$800,00',
                image_url: '',
                alt_text: 'Banner de desconto',
                is_active: true,
                order_index: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            }
          } catch (error) {
            console.log('Product detail banner não encontrado, criando dados padrão');
            setBanners([{
              id: 0,
              title: '40% OFF',
              description: 'nas compras acima de R$800,00',
              image_url: '',
              alt_text: 'Banner de desconto',
              is_active: true,
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
          }
          break;
        default:
          setProducts([]);
          setBanners([]);
          setCategoryChips([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da seção:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('🚀 Iniciando salvamento...', { activeSection, formData });

      // Validação ANTES da limpeza - para produtos/rentals
      if (activeSection !== 'carousel' && activeSection !== 'category-chips' &&
        activeSection !== 'news-banner' && activeSection !== 'promo-banner' &&
        activeSection !== 'product-detail-banner' && activeSection !== 'clips') {
        
        // Validar campos obrigatórios
        if (!formData.name || formData.name.trim() === '') {
          toast.error('O nome do produto é obrigatório');
          return;
        }
        if (!formData.price || formData.price.trim() === '') {
          toast.error('O preço do produto é obrigatório');
          return;
        }
      }

      // Verificar se há uma URL de imagem e se ela está válida
      if (formData.image_url && !formData.image_url.includes('supabase')) {
        console.log('⚠️ Aguardando upload da imagem...');
        // Aguardar um pouco para garantir que o upload foi concluído
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Verificar novamente se a URL está válida
      if (formData.image_url && formData.image_url.startsWith('blob:')) {
        throw new Error('Upload da imagem ainda não foi concluído. Tente novamente.');
      }

      // Limpar formData antes do salvamento
      const cleanFormData = { ...formData };

      // Remover campos que podem causar problemas
      delete cleanFormData.imageUrl;
      delete cleanFormData.id; // Não enviar ID no update
      delete cleanFormData.created_at;
      delete cleanFormData.updated_at;
      
      // Remover campos específicos de clips quando não está editando clips
      if (activeSection !== 'clips') {
        delete cleanFormData.video_url;
        delete cleanFormData.thumbnail_url;
        delete cleanFormData.author_name;
        delete cleanFormData.author_avatar;
        delete cleanFormData.duration;
        delete cleanFormData.likes;
        delete cleanFormData.comments;
        // NÃO deletar category para produtos - eles também usam
      }

      // Remover campos de produtos quando for rentals
      if (activeSection === 'rentals') {
        delete cleanFormData.type;
        delete cleanFormData.product_group;
        delete cleanFormData.is_offer;
        delete cleanFormData.is_featured;
        delete cleanFormData.is_essential;
        delete cleanFormData.is_top_choice;
      }

      // Garantir que campos obrigatórios estão presentes para produtos
      if (activeSection !== 'carousel' && activeSection !== 'category-chips' &&
        activeSection !== 'news-banner' && activeSection !== 'promo-banner' &&
        activeSection !== 'product-detail-banner' && activeSection !== 'clips') {

        // Validações para produtos
        if (!cleanFormData.name || !cleanFormData.price) {
          throw new Error('Nome e preço são obrigatórios para produtos');
        }

        // Garantir valores padrão
        cleanFormData.type = cleanFormData.type || 'produto';
        cleanFormData.rating = Number(cleanFormData.rating) || 5.0;
        cleanFormData.is_active = cleanFormData.is_active !== false;
        cleanFormData.is_offer = Boolean(cleanFormData.is_offer);
        cleanFormData.order_index = Number(cleanFormData.order_index) || 0;
      }

      // Adicionar product_group para seções específicas de produtos
      if (activeSection === 'tiles') {
        console.log('🏠 Salvando produto de Telhas com product_group');
        cleanFormData.product_group = 'tiles';
        cleanFormData.category = 'Telhas e Coberturas';
      } else if (activeSection === 'paint') {
        cleanFormData.product_group = 'paint';
      } else if (activeSection === 'decoration') {
        cleanFormData.product_group = 'decoration';
      } else if (activeSection === 'electro') {
        cleanFormData.product_group = 'electro';
      }

      console.log('💾 Salvando com dados limpos:', { activeSection, cleanFormData });
      console.log('🔍 Campos em cleanFormData:', Object.keys(cleanFormData));

      if (activeSection === 'carousel') {
        // WHITELIST: apenas campos que existem em dynamic_banners
        const bannerFields = ['title', 'description', 'image_url', 'alt_text', 'link_url', 'button_text', 'target_blank', 'is_active', 'order_index'];
        const safeBannerData: any = {};
        bannerFields.forEach(f => { if (f in cleanFormData) safeBannerData[f] = cleanFormData[f]; });
        
        console.log('🛡️ Banner limpo:', safeBannerData);
        
        if (editingItem) {
          const bannerId = typeof editingItem.id === 'string' ? parseInt(editingItem.id, 10) : editingItem.id;
          await contentService.updateBanner(bannerId, safeBannerData);
        } else {
          await contentService.createBanner(safeBannerData);
        }
      } else if (activeSection === 'category-chips') {
        if (editingItem) {
          await contentService.updateCategoryChip(editingItem.id, cleanFormData);
        } else {
          await contentService.createCategoryChip(cleanFormData);
        }
      } else if (activeSection === 'news-banner') {
        const existingData = banners[0]; // Pegar dados existentes
        console.log('💾 Salvando news banner:', { existingData, cleanFormData });

        let result;
        try {
          // Se há dados existentes E tem um ID válido do banco (> 0), atualizar
          if (existingData && existingData.id && existingData.id > 0) {
            console.log('Atualizando news banner existente:', existingData.id);
            result = await contentService.updateNewsBanner(existingData.id, cleanFormData);
          } else {
            console.log('Criando novo news banner');
            result = await contentService.createNewsBanner(cleanFormData);
          }

          console.log('✅ Banner de notícias salvo:', result);

          // Atualizar estado local com o resultado
          if (result) {
            setBanners([result]);
          }

          // Disparar event específico para news banner
          window.dispatchEvent(new CustomEvent('newsBannerUpdated', {
            detail: { data: result, timestamp: Date.now() }
          }));

          // Forçar atualizações imediatas
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('forceContentReload', {
              detail: { source: 'admin', section: 'news-banner', action: 'save' }
            }));
          }, 100);
        } catch (error) {
          console.error('❌ Erro específico no news banner:', error);
          throw error;
        }

      } else if (activeSection === 'promo-banner') {
        const existingData = banners[0]; // Pegar dados existentes
        console.log('💾 Salvando promo banner:', { existingData, cleanFormData });

        let result;
        try {
          // Se há dados existentes E tem um ID válido do banco (> 0), atualizar
          if (existingData && existingData.id && existingData.id > 0) {
            console.log('Atualizando promo banner existente:', existingData.id);
            result = await contentService.updatePromotionalBanner(existingData.id, cleanFormData);
          } else {
            console.log('Criando novo promo banner');
            result = await contentService.createPromotionalBanner(cleanFormData);
          }

          console.log('✅ Banner promocional salvo:', result);

          // Atualizar estado local com o resultado
          if (result) {
            setBanners([result]);
          }

          // Disparar event específico para promotional banner  
          window.dispatchEvent(new CustomEvent('promoBannerUpdated', {
            detail: { data: result, timestamp: Date.now() }
          }));

          // Forçar atualizações imediatas
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('forceContentReload', {
              detail: { source: 'admin', section: 'promo-banner', action: 'save' }
            }));
          }, 100);
        } catch (error) {
          console.error('❌ Erro específico no promo banner:', error);
          throw error;
        }

      } else if (activeSection === 'product-detail-banner') {
        const existingData = banners[0]; // Pegar dados existentes
        console.log('💾 Salvando product detail banner:', { existingData, cleanFormData });

        let result;
        try {
          // Se há dados existentes E tem um ID válido do banco (> 0), atualizar
          if (existingData && existingData.id && existingData.id > 0) {
            console.log('Atualizando product detail banner existente:', existingData.id);
            result = await contentService.updateProductDetailBanner(existingData.id, cleanFormData);
          } else {
            console.log('Criando novo product detail banner');
            result = await contentService.createProductDetailBanner(cleanFormData);
          }

          console.log('✅ Banner detalhes produto salvo:', result);

          // Atualizar estado local com o resultado
          if (result) {
            setBanners([result]);
          }

          // Disparar event específico para product detail banner
          window.dispatchEvent(new CustomEvent('productDetailBannerUpdated', {
            detail: { data: result, timestamp: Date.now() }
          }));

          // Forçar atualizações imediatas
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('forceContentReload', {
              detail: { source: 'admin', section: 'product-detail-banner', action: 'save' }
            }));
          }, 100);
        } catch (error) {
          console.error('❌ Erro específico no product detail banner:', error);
          throw error;
        }
      } else if (activeSection === 'clips') {
        // Para clips (vídeos)
        console.log('🎬 Salvando clip:', {
          editingItem: editingItem ? { id: editingItem.id, title: editingItem.title } : null,
          cleanFormData
        });

        let result;
        if (editingItem) {
          console.log('📝 Atualizando clip existente:', {
            id: editingItem.id,
            idType: typeof editingItem.id,
            title: editingItem.title || editingItem.name
          });

          // Garantir que o ID seja uma string
          const clipId = String(editingItem.id);
          result = await contentService.updateClip(clipId, cleanFormData);

          if (!result) {
            throw new Error(`Falha ao atualizar clip com ID: ${clipId}`);
          }
        } else {
          console.log('🆕 Criando novo clip');
          result = await contentService.createClip(cleanFormData);
          if (!result) {
            throw new Error('Falha ao criar novo clip');
          }
        }
        console.log('✅ Clip salvo com sucesso:', result);
      } else if (activeSection === 'rentals') {
        // Para locações - usar tabela dynamic_rentals
        if (editingItem) {
          const rentalId = String(editingItem.id);
          console.log('🚛 Atualizando locação:', rentalId);
          
          const result = await contentService.updateRental(rentalId, cleanFormData);
          if (!result) {
            throw new Error('Falha ao atualizar locação');
          }
          console.log('✅ Locação atualizada:', result);
        } else {
          console.log('🚛 Criando nova locação');
          const result = await contentService.createRental(cleanFormData);
          if (!result) {
            throw new Error('Falha ao criar locação');
          }
          console.log('✅ Locação criada:', result);
        }
      } else {
        // Para produtos
        if (editingItem) {
          // Garantir que o ID seja um número
          const productId = typeof editingItem.id === 'string' ? parseInt(editingItem.id, 10) : editingItem.id;
          console.log('🔄 Atualizando produto com ID:', productId, 'Tipo:', typeof productId);

          const result = await contentService.updateProduct(productId, cleanFormData);
          if (!result) {
            console.warn('⚠️ Produto não foi atualizado no banco, mas continuando com a operação...');
            // Não lançar erro, apenas avisar
            toast.error('Produto pode não ter sido salvo no banco devido a permissões, mas as mudanças serão refletidas localmente.');
          } else {
            console.log('✅ Produto atualizado:', result);
          }
        } else {
          const result = await contentService.createProduct(cleanFormData);
          if (!result) {
            console.warn('⚠️ Produto não foi criado no banco, mas continuando com a operação...');
            toast.error('Produto pode não ter sido salvo no banco devido a permissões.');
          } else {
            console.log('✅ Produto criado:', result);
          }
        }
      }

      // Disparar múltiplos eventos para garantir a atualização IMEDIATA
      console.log('🚀 [SectionManager] Disparando eventos de atualização para seção:', activeSection);
      console.log('🚀 [SectionManager] EditingItem existe?', !!editingItem);

      // Eventos específicos por tipo de conteúdo
      const bannerEvent = new CustomEvent('bannerUpdated', {
        detail: { type: activeSection, section: activeSection, timestamp: Date.now() }
      });
      console.log('📤 [SectionManager] Disparando bannerUpdated:', bannerEvent.detail);
      window.dispatchEvent(bannerEvent);

      const contentEvent = new CustomEvent('contentUpdated', {
        detail: { type: activeSection, action: editingItem ? 'update' : 'create' }
      });
      console.log('📤 [SectionManager] Disparando contentUpdated:', contentEvent.detail);
      window.dispatchEvent(contentEvent);

      // Eventos específicos para produtos
      if (activeSection !== 'carousel') {
        const productEvent = new CustomEvent('productUpdated', {
          detail: { section: activeSection, action: editingItem ? 'update' : 'create' }
        });
        console.log('📤 [SectionManager] Disparando productUpdated:', productEvent.detail);
        window.dispatchEvent(productEvent);

        // Sincronização forçada para telhas
        if (activeSection === 'tiles') {
          console.log('🚀 [SectionManager] Disparando sincronização forçada para telhas...');
          setTimeout(() => {
            const tilesEvent = new CustomEvent('tilesProductUpdated', {
              detail: {
                action: editingItem ? 'update' : 'create',
                timestamp: Date.now(),
                source: 'admin-section-manager'
              }
            });
            console.log('📤 [SectionManager] Disparando tilesProductUpdated:', tilesEvent.detail);
            window.dispatchEvent(tilesEvent);
          }, 100);
        }

        // Eventos específicos para cada seção
        const sectionEvents = {
          'paint': 'paintSectionUpdated',
          'rentals': 'rentalSectionUpdated',
          'essential': 'essentialSectionUpdated',
          'tiles': 'tilesSectionUpdated',
          'decoration': 'decorationSectionUpdated',
          'topChoices': 'topChoicesSectionUpdated',
          'clips': 'clipsSectionUpdated',
          'featured': 'featuredSectionUpdated'
        };

        const eventName = sectionEvents[activeSection as keyof typeof sectionEvents];
        if (eventName) {
          const sectionEvent = new CustomEvent(eventName, {
            detail: { action: editingItem ? 'update' : 'create', timestamp: Date.now() }
          });
          console.log(`📤 [SectionManager] Disparando ${eventName}:`, sectionEvent.detail);
          window.dispatchEvent(sectionEvent);
          console.log(`🎯 [SectionManager] Evento ${eventName} disparado para seção ${activeSection}`);
        }

        if (!editingItem) {
          const createEvent = new CustomEvent('productCreated', {
            detail: { section: activeSection, id: Date.now() }
          });
          console.log('📤 [SectionManager] Disparando productCreated:', createEvent.detail);
          window.dispatchEvent(createEvent);
        }
      }

      // Evento de força bruta para garantir
      const forceEvent = new CustomEvent('forceContentReload', {
        detail: { source: 'admin', section: activeSection, action: 'save' }
      });
      console.log('📤 [SectionManager] Disparando forceContentReload:', forceEvent.detail);
      window.dispatchEvent(forceEvent);

      console.log('✅ [SectionManager] Todos os eventos de atualização disparados:', { section: activeSection });

      // Marcar no localStorage para outras abas com timestamp único
      const timestamp = Date.now().toString();
      localStorage.setItem('admin_content_updated', timestamp);
      console.log('📝 [SectionManager] Marcado no localStorage:', timestamp);

      // Disparar evento customizado para notificar outras abas
      const eventData = {
        section: activeSection,
        timestamp: Date.now(),
        action: editingItem ? 'update' : 'create'
      };

      // Usar Custom Event para comunicação na mesma aba
      const adminEvent = new CustomEvent('adminContentUpdated', {
        detail: eventData
      });
      console.log('📤 [SectionManager] Disparando adminContentUpdated:', adminEvent.detail);
      window.dispatchEvent(adminEvent);

      // Usar MessageChannel/BroadcastChannel para comunicação entre abas
      try {
        const broadcastChannel = new BroadcastChannel('admin-updates');
        console.log('📡 [SectionManager] Enviando via BroadcastChannel:', eventData);
        broadcastChannel.postMessage(eventData);
        broadcastChannel.close();
      } catch (error) {
        console.warn('[SectionManager] BroadcastChannel não suportado, usando localStorage:', error);
        // Fallback para localStorage
        localStorage.setItem('admin_content_updated', Date.now().toString());
        setTimeout(() => localStorage.removeItem('admin_content_updated'), 1000);
      }

      console.log('🚀 [SectionManager] Eventos de sincronização disparados:', eventData);

      // NÃO LIMPAR CACHES - Causava problemas de sincronização
      // Os componentes precisam dos caches para receber as atualizações
      console.log('ℹ️ [SectionManager] Mantendo caches intactos para sincronização');

      toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      loadSectionData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteBusy.current) return;
    const { item, section: activeSection } = deleteTarget;
    deleteBusy.current = true;
    setDeleting(true);
    setLoading(true);
    try {
      await deleteSectionItem(activeSection, item.id);
      // A lista administrativa deve refletir o banco, inclusive quando fica vazia.
      localStorage.removeItem('tiles_products_cache');
      await loadSectionData();

      // Disparar múltiplos eventos para garantir a atualização IMEDIATA
      console.log('🗑️ Disparando eventos de exclusão para seção:', activeSection);

      window.dispatchEvent(new CustomEvent('bannerUpdated', {
        detail: { type: activeSection, section: activeSection, timestamp: Date.now() }
      }));

      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type: activeSection, action: 'delete' }
      }));

      // Evento específico para produtos
      if (activeSection !== 'carousel') {
        window.dispatchEvent(new CustomEvent('productDeleted', {
          detail: { section: activeSection, id: item.id }
        }));
      }

      // Evento de força bruta para garantir
      window.dispatchEvent(new CustomEvent('forceContentReload', {
        detail: { source: 'admin', section: activeSection, action: 'delete' }
      }));

      console.log('🚀 Todos os eventos de exclusão disparados:', { section: activeSection });

      // Disparar evento customizado para notificar outras abas
      const eventData = {
        section: activeSection,
        itemId: item.id,
        timestamp: Date.now(),
        action: 'delete'
      };

      // Usar Custom Event para comunicação na mesma aba
      window.dispatchEvent(new CustomEvent('adminContentUpdated', {
        detail: eventData
      }));

      // Usar MessageChannel/BroadcastChannel para comunicação entre abas
      try {
        const broadcastChannel = new BroadcastChannel('admin-updates');
        broadcastChannel.postMessage(eventData);
        broadcastChannel.close();
      } catch (error) {
        console.warn('BroadcastChannel não suportado, usando localStorage:', error);
        // Fallback para localStorage
        localStorage.setItem('admin_content_updated', Date.now().toString());
        setTimeout(() => localStorage.removeItem('admin_content_updated'), 1000);
      }

      console.log('🚀 Eventos de exclusão disparados:', eventData);

      setDeleteTarget(null);
      toast.success(activeSection === 'clips' ? 'Clip excluído com sucesso!' : 'Item excluído!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir item');
    } finally {
      deleteBusy.current = false;
      setDeleting(false);
      setLoading(false);
    }
  };

  const openForm = (item?: any) => {
    console.log('🎬 Abrindo formulário - Item recebido:', item);
    console.log('🎯 Seção ativa:', activeSection);

    if (item) {
      setEditingItem(item);

      // Normalizar dados baseado na seção ativa
      let cleanItem = { ...item };

      if (activeSection === 'clips') {
        // Para clips, garantir que todos os campos estejam mapeados corretamente
        cleanItem = {
          id: String(item.id), // Garantir que ID seja string
          title: item.title || item.name || '',
          description: item.description || '',
          video_url: item.video_url || item.videoUrl || '',
          thumbnail_url: item.thumbnail_url || item.thumbnailUrl || item.image_url || '',
          author_name: item.author_name || item.authorName || '',
          author_avatar: item.author_avatar || item.authorAvatar || '',
          duration: item.duration || item.price || '0:58', // price pode conter duração
          category: item.category || 'Tutorial',
          likes: Number(item.likes) || 0,
          comments: Number(item.comments) || 0,
          is_active: item.is_active !== false,
          order_index: Number(item.order_index) || 0,
          // Produto vinculado
          linked_product: item.linked_product,
          linked_product_section: item.linked_product?.section || '',
          linked_product_id: item.linked_product?.id ? String(item.linked_product.id) : ''
        };

        // Se há produto vinculado, carregar produtos da seção
        if (cleanItem.linked_product_section) {
          loadProductsForSection(cleanItem.linked_product_section);
        }

        console.log('🎬 Clip normalizado:', {
          originalId: item.id,
          normalizedId: cleanItem.id,
          idType: typeof cleanItem.id
        });
      } else {
        // Para outras seções (banners, produtos, etc.), normalizar apenas imagens
        cleanItem = {
          ...item,
          image_url: item.image_url || item.image || ''
        };
        
        // Garantir campos específicos para rentals
        if (activeSection === 'rentals') {
          cleanItem = {
            ...item,
            name: item.name || '',
            category: item.category || '',
            price: item.price || '',
            period: item.period || '/dia',
            image_url: item.image_url || '',
            description: item.description || '',
            location: item.location || 'São Paulo - SP',
            available: item.available !== false,
            popular: item.popular || false,
            rating: Number(item.rating) || 0,
            is_active: item.is_active !== false,
            order_index: Number(item.order_index) || 0
          };
        }
      }

      // Remover campos duplicados/desnecessários
      delete cleanItem.imageUrl;
      delete cleanItem.videoUrl;
      delete cleanItem.thumbnailUrl;
      delete cleanItem.authorName;
      delete cleanItem.authorAvatar;
      delete cleanItem.name; // Para clips, usar title
      delete cleanItem.price; // Para clips, usar duration

      console.log('✅ Item normalizado para edição:', cleanItem);
      setFormData(cleanItem);
    } else {
      setEditingItem(null);
      const defaultData = getDefaultFormData();
      console.log('🆕 Criando novo item com dados padrão:', defaultData);
      setFormData(defaultData);
    }
    setShowForm(true);
  };

  const getDefaultFormData = () => {
    const section = SECTIONS.find(s => s.id === activeSection);

    if (activeSection === 'carousel') {
      return {
        title: '',
        description: '',
        image_url: '',
        alt_text: '',
        is_active: true,
        order_index: 0
      };
    } else if (activeSection === 'category-chips') {
      return {
        chip_id: '',
        label: '',
        icon_name: 'Grid3X3',
        is_active: true,
        order_index: 0
      };
    } else if (activeSection === 'news-banner') {
      return {
        title: 'Novidades',
        description: 'Confira as últimas atualizações',
        image_url: '',
        alt_text: 'Banner de novidades',
        is_active: true,
        order_index: 0
      };
    } else if (activeSection === 'promo-banner') {
      return {
        title: 'Ofertas Imperdíveis!',
        description: 'Descontos de até 50% em produtos selecionados',
        image_url: '',
        alt_text: 'Banner promocional',
        is_active: true,
        order_index: 0
      };
    } else if (activeSection === 'product-detail-banner') {
      return {
        title: '40% OFF',
        description: 'nas compras acima de R$800,00',
        image_url: '',
        alt_text: 'Banner de desconto',
        is_active: true,
        order_index: 0
      };
    } else {
      // Para produtos
      const baseData = {
        name: '',
        price: '',
        image_url: '',
        description: '',
        type: 'produto',
        category: '',
        rating: 5.0,
        is_offer: false,
        is_featured: false,
        is_essential: false,
        is_top_choice: false,
        product_group: 'home',
        is_active: true,
        order_index: 0
      };

      // Definir campos específicos baseado na seção
      switch (activeSection) {
        case 'featured':
          return { ...baseData, is_featured: true };
        case 'paint':
          return { ...baseData, product_group: 'paint', category: 'Pintura' };
        case 'essential':
          return { ...baseData, is_essential: true };
        case 'tiles':
          return { ...baseData, category: 'Telhas e Coberturas', product_group: 'tiles' };
        case 'decoration':
          return { ...baseData, product_group: 'decoration', type: 'decoração' };
        case 'electro':
          return { ...baseData, product_group: 'electro', category: 'Elétrica' };
        case 'tools':
          return { ...baseData, category: 'Ferramentas' };
        case 'topChoices':
          return { ...baseData, is_top_choice: true };
        case 'offers':
          return { ...baseData, is_offer: true, discount: 0 };
        case 'rentals':
          return {
            name: '',
            category: '',
            price: '',
            period: '/dia',
            image_url: '',
            description: '',
            location: 'São Paulo - SP',
            available: true,
            popular: false,
            rating: 0.0,
            is_active: true,
            order_index: 0
          };
        case 'clips':
          return {
            title: '',
            description: '',
            video_url: '',
            thumbnail_url: '',
            author_name: '',
            author_avatar: '',
            duration: '0:58',
            category: 'Tutorial',
            is_active: true,
            order_index: 0,
            likes: 0,
            comments: 0,
            linked_product_section: '',
            linked_product_id: '',
            linked_product: undefined
          };
        default:
          return baseData;
      }
    }
  };

  const renderItemCard = (item: any) => {
    if (activeSection === 'carousel') {
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  console.warn('Admin: Erro ao carregar imagem do banner:', item.title, item.image_url);
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Eye className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      <EyeOff className="w-3 h-3" />
                      Inativo
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(item)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget({ item, section: activeSection })}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (activeSection === 'news-banner' || activeSection === 'promo-banner' || activeSection === 'product-detail-banner') {
      // Para banners específicos
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    console.warn('Admin: Erro ao carregar imagem:', item.title, item.image_url);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Eye className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      <EyeOff className="w-3 h-3" />
                      Inativo
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {activeSection === 'news-banner' && 'Abaixo dos chips'}
                    {activeSection === 'promo-banner' && 'Banner promocional'}
                    {activeSection === 'product-detail-banner' && 'Página do produto'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(item)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (activeSection === 'category-chips') {
      // Para category chips
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">{item.icon_name}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">ID: {item.chip_id}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Eye className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      <EyeOff className="w-3 h-3" />
                      Inativo
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    Ordem: {item.order_index}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(item)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget({ item, section: activeSection })}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (activeSection === 'clips') {
      // Para clips (vídeos) - Interface melhorada
      return (
        <Card key={item.id} className="mb-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {item.thumbnail_url || item.image_url ? (
                <div className="relative">
                  <img
                    src={item.thumbnail_url || item.image_url || item.thumbnailUrl}
                    alt={item.title || item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      console.warn('Admin: Erro ao carregar thumbnail do clip:', item.title, item.thumbnail_url);
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.title || item.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.is_active !== false ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Eye className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      <EyeOff className="w-3 h-3" />
                      Inativo
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    ⏱️ {item.duration || item.price || '0:58'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    ❤️ {item.likes || 0}
                  </span>
                  {item.author_name && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      👤 {item.author_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🎬 Editando clip:', item);
                    openForm(item);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget({ item, section: activeSection })}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (activeSection === 'rentals') {
      // Card específico para Locações
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  {item.name}
                  {item.popular && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-lg font-bold text-orange-600">{item.price}{item.period || '/dia'}</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    ⭐ {item.rating || 0}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    📍 {item.location}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.available ? '✓ Disponível' : '✗ Indisponível'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(item)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget({ item, section: activeSection })}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Para produtos
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  console.warn('Admin: Erro ao carregar imagem do produto:', item.name, item.image_url);
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-lg font-bold text-orange-600">{item.price}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    ⭐ {item.rating}
                  </span>
                  {item.is_offer && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      Oferta
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(item)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget({ item, section: activeSection })}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  const renderForm = () => {
    if (activeSection === 'carousel') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Banner</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do banner"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição do banner"
              rows={3}
            />
          </div>

          <div>
            <Label>Imagem do Banner</Label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="banners"
              maxWidth={1200}
              maxHeight={400}
              placeholder="Faça upload da imagem do banner (1200x400px recomendado)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.order_index || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Banner Ativo</Label>
            </div>
          </div>
        </div>
      );
    } else if (activeSection === 'category-chips') {
      // Formulário para category chips
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>ID do Chip</Label>
              <Input
                value={formData.chip_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, chip_id: e.target.value }))}
                placeholder="Ex: ofertas, destaques"
                disabled={!!editingItem}
              />
              {editingItem && (
                <p className="text-xs text-gray-500 mt-1">O ID não pode ser alterado após a criação</p>
              )}
            </div>

            <div>
              <Label>Label</Label>
              <Input
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Ofertas, Destaques"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Ícone</Label>
              <select
                value={formData.icon_name || 'Grid3X3'}
                onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Grid3X3">Grid3X3 (Padrão)</option>
                <option value="Home">Home</option>
                <option value="Percent">Percent</option>
                <option value="Wrench">Wrench</option>
                <option value="Star">Star</option>
                <option value="TrendingUp">TrendingUp</option>
                <option value="Heart">Heart</option>
              </select>
            </div>

            <div>
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.order_index || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Chip Ativo</Label>
          </div>
        </div>
      );
    } else if (activeSection === 'news-banner') {
      // Formulário para banner de notícias
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Banner</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Novidades"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Confira as últimas atualizações"
              rows={2}
            />
          </div>

          <div>
            <Label>Imagem do Banner</Label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="banners"
              maxWidth={1200}
              maxHeight={200}
              placeholder="Faça upload da imagem (1200x200px recomendado)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Banner Ativo</Label>
          </div>
        </div>
      );
    } else if (activeSection === 'promo-banner') {
      // Formulário para banner promocional
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Banner</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Ofertas Imperdíveis!"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Descontos de até 50% em produtos selecionados"
              rows={2}
            />
          </div>

          <div>
            <Label>Imagem do Banner</Label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="banners"
              maxWidth={800}
              maxHeight={400}
              placeholder="Faça upload da imagem promocional"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Banner Ativo</Label>
          </div>
        </div>
      );
    } else if (activeSection === 'product-detail-banner') {
      // Formulário para banner de desconto na página de produto
      return (
        <div className="space-y-4">
          <div>
            <Label>Título do Desconto</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: 40% OFF"
            />
          </div>

          <div>
            <Label>Condição do Desconto</Label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: nas compras acima de R$800,00"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Informação:</strong> Este banner aparece na página de detalhes do produto,
              abaixo da descrição. As configurações serão aplicadas automaticamente.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Banner Ativo</Label>
          </div>
        </div>
      );
    } else if (activeSection === 'clips') {
      // Formulário específico para Clips (vídeos) - Interface melhorada
      return (
        <div className="space-y-6">
          {/* Header informativo */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                {editingItem ? 'Editando Vídeo' : 'Novo Vídeo'}
              </h3>
            </div>
            <p className="text-sm text-blue-700">
              📹 <strong>Dica:</strong> Vídeos devem ter no máximo 58 segundos. Use thumbnails em formato 9:16 para melhor visualização.
            </p>
            {editingItem && (
              <p className="text-xs text-blue-600 mt-1">
                🎬 Editando: <strong>{editingItem.title || editingItem.name}</strong>
              </p>
            )}
          </div>

          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Título do Vídeo *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Como aplicar cimento queimado"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-base font-medium">Descrição</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo do vídeo..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* URLs de mídia */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">URL do Vídeo *</Label>
              <div className="space-y-3 mt-1">
                <Input
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="Cole a URL do vídeo ou faça upload abaixo"
                  required
                />

                {/* Upload de vídeo */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          toast.loading('Fazendo upload do vídeo...', { id: 'video-upload' });
                          const videoUploadService = (await import('@/services/videoUploadService')).default;
                          const result = await videoUploadService.uploadVideo(file, (progress) => {
                            console.log(`Upload: ${progress.percentage}%`);
                          });

                          if (result.success && result.url) {
                            setFormData(prev => ({ ...prev, video_url: result.url }));
                            toast.success('Vídeo enviado com sucesso!', { id: 'video-upload' });
                          } else {
                            toast.error(result.error || 'Erro ao fazer upload', { id: 'video-upload' });
                          }
                        } catch (error) {
                          console.error('Erro no upload:', error);
                          toast.error('Erro ao fazer upload do vídeo', { id: 'video-upload' });
                        }
                      }
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Clique para fazer upload do vídeo</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV ou AVI (máx. 50MB)</p>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Thumbnail (Imagem de Capa)</Label>
              <div className="mt-1">
                <ImageUpload
                  currentImage={formData.thumbnail_url}
                  onImageChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url || '' }))}
                  folder="clips"
                  maxWidth={400}
                  maxHeight={600}
                  placeholder="Faça upload da thumbnail (9:16 recomendado)"
                />
              </div>
            </div>
          </div>

          {/* Informações do autor e duração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Nome do Autor</Label>
              <Input
                value={formData.author_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder="Ex: Construtor Expert"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Duração</Label>
              <Input
                value={formData.duration || '0:58'}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 0:58"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Avatar do Autor (URL)</Label>
            <Input
              value={formData.author_avatar || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author_avatar: e.target.value }))}
              placeholder="URL da foto do autor"
              className="mt-1"
            />
          </div>

          {/* Categoria e métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-base font-medium">Categoria</Label>
              <select
                value={formData.category || 'Tutorial'}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
              >
                <option value="Tutorial">📚 Tutorial</option>
                <option value="Dica">💡 Dica</option>
                <option value="Produto">📦 Produto</option>
                <option value="Serviço">🔧 Serviço</option>
                <option value="Geral">📋 Geral</option>
              </select>
            </div>

            <div>
              <Label className="text-base font-medium">Curtidas</Label>
              <Input
                type="number"
                value={formData.likes || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
                min="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Comentários</Label>
              <Input
                type="number"
                value={formData.comments || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: parseInt(e.target.value) || 0 }))}
                min="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Produto vinculado */}
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Produto Vinculado</h3>
              </div>
              <p className="text-sm text-orange-700">
                🛒 <strong>Importante:</strong> Selecione um produto para exibir o card de compra no vídeo. O usuário poderá adicionar este produto ao carrinho diretamente do vídeo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">Seção do Produto</Label>
                <select
                  value={formData.linked_product_section || ''}
                  onChange={async (e) => {
                    const section = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      linked_product_section: section,
                      linked_product_id: '' // Reset product selection
                    }));

                    if (section) {
                      // Carregar produtos da seção selecionada
                      await loadProductsForSection(section);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                >
                  <option value="">Selecione uma seção</option>
                  <option value="paint">🎨 Semana da Pintura</option>
                  <option value="electro">⚡ Eletro</option>
                  <option value="essential">🏗️ Essenciais da Obra</option>
                  <option value="tiles">🏠 Telhas</option>
                  <option value="decoration">✨ Vibe Decoração</option>
                  <option value="rentals">🚛 Locações</option>
                  <option value="featured">⭐ Destaques</option>
                  <option value="topChoices">🔥 Top Escolhas</option>
                </select>
              </div>

              <div>
                <Label className="text-base font-medium">Produto Específico</Label>
                <select
                  value={formData.linked_product_id || ''}
                  onChange={(e) => {
                    const productId = e.target.value;
                    const selectedProduct = availableProducts.find(p => p.id.toString() === productId);

                    setFormData(prev => ({
                      ...prev,
                      linked_product_id: productId,
                      linked_product: selectedProduct ? {
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        image_url: selectedProduct.image_url,
                        category: selectedProduct.category,
                        section: prev.linked_product_section || ''
                      } : undefined
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                  disabled={!formData.linked_product_section}
                >
                  <option value="">
                    {formData.linked_product_section ? 'Selecione um produto' : 'Primeiro selecione uma seção'}
                  </option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview do produto selecionado */}
            {formData.linked_product && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Preview do Card de Compra:</h4>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                  <img
                    src={formData.linked_product.image_url}
                    alt={formData.linked_product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      console.warn('Admin: Erro ao carregar imagem do produto linkado:', formData.linked_product.name);
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{formData.linked_product.name}</p>
                    <p className="text-orange-600 font-bold">{formData.linked_product.price}</p>
                  </div>
                  <div className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium">
                    Comprar
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Switch
              checked={formData.is_active !== false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <div>
              <Label className="text-base font-medium">Vídeo Ativo</Label>
              <p className="text-sm text-gray-600">O vídeo será exibido na seção de clips</p>
            </div>
          </div>
        </div>
      );
    } else if (activeSection === 'rentals') {
      // Formulário específico para Locações
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Equipamento *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Betoneira 150L"
                required
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione</option>
                <option value="Máquinas Pesadas">Máquinas Pesadas</option>
                <option value="Plataformas">Plataformas</option>
                <option value="Ferramentas">Ferramentas</option>
                <option value="Equipamentos Elétricos">Equipamentos Elétricos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Preço *</Label>
              <CurrencyInput
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="R$ 450"
                required
              />
            </div>

            <div>
              <Label>Período</Label>
              <Input
                value={formData.period || '/dia'}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                placeholder="/dia, /hora, /semana"
              />
            </div>

            <div>
              <Label>Avaliação (0-5)</Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label>Localização</Label>
            <Input
              value={formData.location || 'São Paulo - SP'}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Cidade - Estado"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o equipamento e suas características"
              rows={3}
            />
          </div>

          <div>
            <Label>Imagem do Equipamento</Label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="rental-equipment"
              maxWidth={600}
              maxHeight={600}
              placeholder="Faça upload da imagem do equipamento"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.order_index || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.available !== false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
              />
              <Label>Disponível para Locação</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.popular || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
              />
              <Label>Item Popular</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Ativo</Label>
            </div>
          </div>
        </div>
      );
    } else {
      // Formulário para produtos
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Produto</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do produto"
              />
            </div>

            <div>
              <Label>Preço</Label>
              <CurrencyInput
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div>
            <Label>Imagem do Produto</Label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="products"
              maxWidth={600}
              maxHeight={600}
              placeholder="Faça upload da imagem do produto (600x600px recomendado)"
            />
          </div>

          <div>
            <Label>Descrição do Produto</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição detalhada do produto que aparecerá na página de detalhes"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Categoria</Label>
              <Input
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Material, Decoração"
              />
            </div>

            <div>
              <Label>Tipo</Label>
              <select
                value={formData.type || 'produto'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="produto">Produto</option>
                <option value="serviço">Serviço</option>
                <option value="decoração">Decoração</option>
              </select>
            </div>

            <div>
              <Label>Avaliação (0-5)</Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || 5.0}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_offer || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_offer: checked }))}
              />
              <Label>Em Oferta</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Produto Ativo</Label>
            </div>
          </div>
        </div>
      );
    }
  };

  const getCurrentSectionData = () => {
    if (activeSection === 'carousel' || activeSection === 'news-banner' || activeSection === 'promo-banner' || activeSection === 'product-detail-banner') return banners;
    if (activeSection === 'category-chips') return categoryChips;
    return products;
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);
  const IconComponent = currentSection?.icon || ImageIcon;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Seções</h1>
            <p className="text-gray-600">
              Configure as seções e conteúdos exibidos na página principal
            </p>
          </div>

          <Button
            onClick={() => openForm()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {/* Navegação de seções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="w-5 h-5" />
              {currentSection?.name}
            </CardTitle>
            <CardDescription>{currentSection?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
              {SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex flex-col items-center gap-1 h-auto py-3 ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''
                      }`}
                  >
                    <SectionIcon className="w-4 h-4" />
                    <span className="text-xs text-center leading-tight">
                      {section.name}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Conteúdo da seção */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : getCurrentSectionData().length > 0 ? (
              <div>
                {getCurrentSectionData().map(renderItemCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum item encontrado nesta seção</p>
                <Button
                  onClick={() => openForm()}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !deleteBusy.current) setDeleteTarget(null); }}>
          <AlertDialogContent className="rounded-2xl border-orange-200 bg-white shadow-2xl sm:rounded-2xl">
            <AlertDialogHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Trash2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">{deleteTarget?.section === 'clips' ? 'Excluir clip?' : 'Excluir item?'}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Você deseja excluir <strong className="break-words text-gray-900">{deleteTarget?.item.title || deleteTarget?.item.name || 'este item'}</strong>?
                {' '}Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3 gap-2">
              <AlertDialogCancel disabled={deleting} className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); void handleDelete(); }} className="rounded-xl bg-orange-600 hover:bg-orange-700">
                <Trash2 className="mr-2 h-4 w-4" />{deleting ? 'Excluindo...' : 'Sim, excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal do formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {editingItem ? 'Editar Item' : 'Novo Item'} - {currentSection?.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderForm()}

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SectionManager;