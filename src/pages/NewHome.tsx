import { buildHomeProductSections } from '@/lib/homeProductSections';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Percent, Wrench, Star, TrendingUp, Heart, Paintbrush, Grid3X3, Home, Palette, Settings, Lightbulb, Plug, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/layout";
import { LocationSection, BannerCarousel, ServiceCategories, ProductSection, ServiceCategory, ClipsSection, RentalSection } from "@/components/home";
import CategoryChips from "@/components/home/CategoryChips";
import { MoreModal, CategoriesModal } from "@/components/modals";
import type { Product } from "@/types";
import { useBannerSync, useCart } from "@/hooks";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { serviceCategories } from "@/data/serviceCategories";
import { contentService } from "@/services/contentService";
import settingsService, { getPromoImageSettings, type PromoImageSettings } from "@/services/settingsService";

import { supabase } from "@/integrations/supabase/client";
const NewHome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hook para atualizações em tempo real
  useRealtimeUpdates();

  // Sistema unificado de sincronização com admin (incluindo comunicação entre abas)
  useEffect(() => {
    let reloadTimeout: ReturnType<typeof setTimeout>;
    const handleAdminUpdate = (event: any) => {
      console.log('🔄 Atualização do admin detectada:', event.type, event.detail);

      // Limpar timeout anterior
      if (reloadTimeout) clearTimeout(reloadTimeout);

      // Aguardar para garantir que o banco foi atualizado
      reloadTimeout = setTimeout(() => {
        console.log('🔄 Recarregando página após update do admin...');
        window.location.reload();
      }, 1500);
    };

    // Comunicação entre abas via BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      console.log('📡 Mensagem recebida de outra aba:', event.data);
      handleAdminUpdate({
        type: 'broadcast',
        detail: event.data
      });
    };
    const handleStorageUpdate = () => {
      const timestamp = localStorage.getItem('admin_content_updated');
      if (timestamp) {
        const now = Date.now();
        const updateTime = parseInt(timestamp);

        // Se a atualização foi nos últimos 5 segundos
        if (now - updateTime < 5000) {
          console.log('🔄 Mudança recente detectada no localStorage');
          handleAdminUpdate({
            type: 'storage',
            detail: {
              timestamp
            }
          });
        }
      }
    };

    // Configurar BroadcastChannel para comunicação entre abas
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('admin-updates');
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
      console.log('📡 BroadcastChannel configurado para comunicação entre abas');
    } catch (error) {
      console.warn('BroadcastChannel não suportado, usando apenas localStorage');
    }

    // Escutar eventos personalizados
    window.addEventListener('adminContentUpdated', handleAdminUpdate);

    // Verificar localStorage periodicamente como fallback
    const pollInterval = setInterval(handleStorageUpdate, 2000);
    console.log('👂 Sistema unificado de sincronização ativo (incluindo entre abas)');
    return () => {
      if (reloadTimeout) clearTimeout(reloadTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('adminContentUpdated', handleAdminUpdate);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
        broadcastChannel.close();
      }
      console.log('🧹 Sistema de sincronização limpo');
    };
  }, []);
  const { cartItemCount, addToCart } = useCart();
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("tudo");
  const [promoSettings, setPromoSettings] = useState({
    freeShippingTitle: "Frete grátis em produtos selecionados",
    freeShippingSubtext: "Válido para compras acima de R$ 200"
  });
  const [promoImageSettings, setPromoImageSettings] = useState<PromoImageSettings>({
    imageUrl: "",
    altText: "Banner promocional",
    enabled: false
  });

  // Carregar configurações de imagem promocional
  useEffect(() => {
    const loadPromoImageSettings = async () => {
      try {
        const settings = await getPromoImageSettings();
        if (settings) {
          setPromoImageSettings(settings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de imagem promocional:', error);
      }
    };
    loadPromoImageSettings();
  }, []);

  // Use new banner sync system
  const {
    banners,
    newsBanner,
    promotionalBanner,
    isLoading: bannersLoading,
    refreshBanners
  } = useBannerSync();

  // Dynamic product state
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [essentialProducts, setEssentialProducts] = useState<Product[]>([]);
  const [topChoicesProducts, setTopChoicesProducts] = useState<Product[]>([]);
  const [tilesProducts, setTilesProducts] = useState<Product[]>([]);
  const [paintProducts, setPaintProducts] = useState<Product[]>([]);
  const [decorationProducts, setDecorationProducts] = useState<Product[]>([]);
  const [electroProducts, setElectroProducts] = useState<Product[]>([]);
  const [toolsProducts, setToolsProducts] = useState<Product[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const [productLoadError,setProductLoadError]=useState('');
  const [productReload,setProductReload]=useState(0);
  useEffect(()=>{
    let active=true;
    const clear=()=>{setFeaturedProducts([]);setEssentialProducts([]);setTopChoicesProducts([]);setTilesProducts([]);setPaintProducts([]);setDecorationProducts([]);setElectroProducts([]);setToolsProducts([]);};
    const load=async()=>{
      setContentLoading(true);setProductLoadError('');
      try {
        const readAll=async(table:string)=>{
          const rows:any[]=[];
          for(let page=0;;page++){
            let query=supabase.from(table).select('*');
            query=table==='products'?query.eq('status','active').eq('approval_status','approved').order('created_at',{ascending:false}):query.eq('is_active',true).order('order_index',{ascending:true}).order('created_at',{ascending:false});
            const result=await query.order('id',{ascending:true}).range(page*500,page*500+499);
            if(result.error)throw new Error(result.error.message);
            const batch=Array.isArray(result.data)?result.data:[];rows.push(...batch);
            if(!active || batch.length<500 || rows.length>=Number(result.count))break;
          }
          return rows;
        };
        const [dynamic,originals]=await Promise.all([readAll('dynamic_products'),readAll('products')]);
        if(!active)return;
        const sections=buildHomeProductSections(dynamic,originals);
        setFeaturedProducts(sections.featured);setEssentialProducts(sections.essential);setTopChoicesProducts(sections.top);setTilesProducts(sections.tiles);setPaintProducts(sections.paint);setDecorationProducts(sections.decoration);setElectroProducts(sections.electro);setToolsProducts(sections.tools);
      } catch(error){if(active){clear();setProductLoadError('Não foi possível carregar os produtos. Tente novamente.');}}
      finally {if(active)setContentLoading(false);}
    };
    void load();
    const refresh=()=>setProductReload(value=>value+1);
    window.addEventListener('contentUpdated',refresh);
    return()=>{active=false;window.removeEventListener('contentUpdated',refresh);};
  },[productReload]);

  // Carregar category chips dinamicamente do banco de dados
  const [chipCategories, setChipCategories] = useState([{
    id: 'tudo',
    label: 'Tudo',
    icon: Grid3X3
  }, {
    id: 'ofertas',
    label: 'Ofertas',
    icon: Percent
  }, {
    id: 'servicos',
    label: 'Serviços',
    icon: Wrench
  }, {
    id: 'destaques',
    label: 'Destaques',
    icon: Star
  }, {
    id: 'mais-vendidos',
    label: 'Mais vendidos',
    icon: TrendingUp
  }, {
    id: 'queridinhos',
    label: 'Queridinhos',
    icon: Heart
  }]);

  // Função para inicializar categorias padrão no banco se não existirem
  const initializeDefaultCategories = async () => {
    const defaultCategories = [{
      chip_id: 'tudo',
      label: 'Tudo',
      icon_name: 'Grid3X3',
      order_index: 0
    }, {
      chip_id: 'ofertas',
      label: 'Ofertas',
      icon_name: 'Percent',
      order_index: 1
    }, {
      chip_id: 'servicos',
      label: 'Serviços',
      icon_name: 'Wrench',
      order_index: 2
    }, {
      chip_id: 'destaques',
      label: 'Destaques',
      icon_name: 'Star',
      order_index: 3
    }, {
      chip_id: 'mais-vendidos',
      label: 'Mais vendidos',
      icon_name: 'TrendingUp',
      order_index: 4
    }, {
      chip_id: 'queridinhos',
      label: 'Queridinhos',
      icon_name: 'Heart',
      order_index: 5
    }];
    try {
      const existingChips = await contentService.getCategoryChips();

      // Verificar quais categorias padrão não existem no banco
      for (const defaultCat of defaultCategories) {
        const exists = existingChips.find(chip => chip.chip_id === defaultCat.chip_id);
        if (!exists) {
          console.log(`🔧 Criando categoria padrão: ${defaultCat.label}`);
          await contentService.createCategoryChip({
            chip_id: defaultCat.chip_id,
            label: defaultCat.label,
            icon_name: defaultCat.icon_name,
            is_active: true,
            order_index: defaultCat.order_index
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar categorias padrão:', error);
    }
  };

  // Função para carregar category chips do banco de dados
  const loadCategoryChips = async () => {
    try {
      console.log('🔄 Carregando category chips...');

      // Primeiro, garantir que as categorias padrão existam
      await initializeDefaultCategories();

      // Depois, carregar todas as categorias do banco
      const dynamicCategoryChips = await contentService.getCategoryChips();
      console.log('📊 Category chips do banco:', dynamicCategoryChips);
      const iconMap: any = {
        'Home': Home,
        'Grid3X3': Grid3X3,
        'Percent': Percent,
        'Wrench': Wrench,
        'Star': Star,
        'TrendingUp': TrendingUp,
        'Heart': Heart
      };
      if (dynamicCategoryChips.length > 0) {
        // Usar as categorias do banco (que agora incluem as padrão + atualizações do admin)
        const mappedChips = dynamicCategoryChips.filter(chip => chip.is_active).sort((a, b) => a.order_index - b.order_index) // Ordenar por order_index
          .map(chip => ({
            id: chip.chip_id,
            label: chip.label,
            // Usar o label atualizado do banco
            icon: iconMap[chip.icon_name] || Grid3X3
          }));
        console.log('✅ Category chips carregados do banco:', mappedChips);
        setChipCategories(mappedChips);
      } else {
        // Fallback para categorias padrão (não deveria acontecer após inicialização)
        console.log('📋 Usando categorias padrão (fallback)');
        setChipCategories([{
          id: 'tudo',
          label: 'Tudo',
          icon: Grid3X3
        }, {
          id: 'ofertas',
          label: 'Ofertas',
          icon: Percent
        }, {
          id: 'servicos',
          label: 'Serviços',
          icon: Wrench
        }, {
          id: 'destaques',
          label: 'Destaques',
          icon: Star
        }, {
          id: 'mais-vendidos',
          label: 'Mais vendidos',
          icon: TrendingUp
        }, {
          id: 'queridinhos',
          label: 'Queridinhos',
          icon: Heart
        }]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar category chips:', error);
      // Fallback para categorias padrão em caso de erro
      setChipCategories([{
        id: 'tudo',
        label: 'Tudo',
        icon: Grid3X3
      }, {
        id: 'ofertas',
        label: 'Ofertas',
        icon: Percent
      }, {
        id: 'servicos',
        label: 'Serviços',
        icon: Wrench
      }, {
        id: 'destaques',
        label: 'Destaques',
        icon: Star
      }, {
        id: 'mais-vendidos',
        label: 'Mais vendidos',
        icon: TrendingUp
      }, {
        id: 'queridinhos',
        label: 'Queridinhos',
        icon: Heart
      }]);
    }
  };

  // Função para carregar configurações promocionais
  const loadPromoSettings = async () => {
    try {
      const settings = await settingsService.getSettings('promo');
      if (settings) {
        setPromoSettings({
          freeShippingTitle: "Frete grátis em produtos selecionados",
          freeShippingSubtext: "Válido para compras acima de R$ 200"
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações promocionais:', error);
    }
  };

  // Função para carregar configurações da imagem promocional
  const loadPromoImageSettings = async () => {
    try {
      const settings = await getPromoImageSettings();
      if (settings) {
        setPromoImageSettings(settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da imagem promocional:', error);
    }
  };

  // Effect para carregar category chips inicialmente
  useEffect(() => {
    loadCategoryChips();
    loadPromoSettings();
    loadPromoImageSettings();
  }, []);
  const handleLocationConfirm = (cep: string) => {
    console.log("CEP confirmado:", cep);
  };
  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    console.log("Produto adicionado ao carrinho:", product);
  };

  // Funções de navegação para categorias
  const handleViewMoreEssentials = () => {
    navigate('/categoria/essenciais');
  };
  const handleViewMoreTiles = () => {
    navigate('/categoria/telhas');
  };
  const handleViewMorePaint = () => {
    navigate('/categoria/pintura');
  };
  const handleViewMoreDecoration = () => {
    navigate('/categoria/decoracao');
  };
  const handleViewMoreTopChoices = () => {
    navigate('/categoria/top-escolhas');
  };
  const handleServiceCategoryClick = (category: ServiceCategory) => {
    console.log("Categoria de serviço clicada:", category);
    navigate(`/servicos/${category.id}`);
  };
  const handleViewMoreCategories = () => {
    setIsCategoriesModalOpen(true);
  };
  const handleCategoryClick = (categoryName: string) => {
    // Mapear categorias para as páginas existentes
    const categoryMapping = {
      'Construir': 'essenciais',
      'Decorar': 'decoracao',
      'Reformar': 'top-escolhas',
      'Pinturas': 'pintura',
      'Iluminação': 'eletro',
      'Eletro': 'eletro'
    };
    const targetCategory = categoryMapping[categoryName as keyof typeof categoryMapping];
    if (targetCategory) {
      navigate(`/categoria/${targetCategory}`);
    }
  };
  const handleViewMoreElectro = () => {
    navigate('/categoria/eletro');
  };
  const handleViewMoreTools = () => {
    navigate('/categoria/ferramentas');
  };
  const handleViewMoreRentals = () => {
    navigate('/categoria/locacoes');
  };
  const handleRentalItemClick = (item: any) => {
    console.log("Item de locação clicado:", item);
    navigate(`/locacao/${item.id}`);
  };

  // Função para renderizar seções baseadas na categoria ativa
  const renderSectionsByCategory = () => {
    switch (activeCategory) {
      case 'tudo':
        return <>
          {/* Produtos em Destaque */}
          <ProductSection title="Destaque" products={featuredProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} horizontal={true} />

          {/* Prestadores de Serviços */}
          <ServiceCategories categories={serviceCategories} onCategoryClick={handleServiceCategoryClick} />

          {/* Seção de Locações - Nova categoria especial */}
          <RentalSection onViewMore={handleViewMoreRentals} onItemClick={handleRentalItemClick} />

          {/* Banner Super Ofertas */}
          <div className="mb-6">
            <button onClick={() => navigate('/ofertas')} className="w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden shadow-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              {/* Layout Mobile */}
              <div className="sm:hidden p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                    <Percent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-lg mb-1">Super Ofertas</h3>
                    <p className="text-orange-100 text-xs leading-relaxed">
                      Até 50% OFF em materiais selecionados
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-orange-200 text-[10px] leading-tight">Economia de até</p>
                    <p className="text-white font-bold text-2xl leading-none">50%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-white/90 text-[10px] bg-white/10 rounded-full px-2 py-1">
                    <Truck className="h-3 w-3 flex-shrink-0" />
                    <span className="leading-tight">Frete Grátis</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-[10px] bg-white/10 rounded-full px-2 py-1">
                    <Star className="h-3 w-3 flex-shrink-0" />
                    <span className="leading-tight">Com garantia</span>
                  </div>
                </div>

                <div className="bg-white text-orange-600 font-bold py-2.5 rounded-full hover:bg-orange-50 transition-colors text-sm text-center">
                  Ver Ofertas
                </div>
              </div>

              {/* Layout Desktop */}
              <div className="hidden sm:flex items-center justify-between p-6">
                <div className="flex items-center flex-1">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Percent className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-2">Super Ofertas</h3>
                    <p className="text-orange-100 text-sm mb-3">
                      Até 50% OFF em materiais selecionados
                    </p>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <span className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Frete Grátis acima de R$ 200
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Produtos com garantia
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center flex-shrink-0 ml-6">
                  <div className="mb-3">
                    <p className="text-orange-200 text-sm">Economia de até</p>
                    <p className="text-white font-bold text-3xl">50%</p>
                  </div>
                  <div className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors text-sm inline-block">
                    Ver Ofertas
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Semana da pintura */}
          <ProductSection title="Semana da pintura" products={paintProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMorePaint} />

          {/* Essenciais da Obra */}
          <ProductSection title="Essenciais da obra" products={essentialProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreEssentials} />

          {/* Top escolhas pra você */}
          <ProductSection title="Top escolhas pra você" products={topChoicesProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTopChoices} />

          {/* Telhas */}
          <ProductSection title="Telhas" products={tilesProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTiles} />

          {/* Vibe Decoração */}
          <ProductSection title="Vibe Decoração" products={decorationProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreDecoration} />

          {/* Clips */}
          <ClipsSection />

          {/* Seção Eletro */}
          <ProductSection title="Eletro" products={electroProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreElectro} />

          {/* Seção Ferramentas */}
          <ProductSection title="Ferramentas" products={toolsProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTools} />

          {/* Seção Categorias */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Categorias</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {/* Primeira linha */}
              <button onClick={() => handleCategoryClick('Construir')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Home className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Construir</span>
              </button>

              <button onClick={() => handleCategoryClick('Decorar')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Palette className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Decorar</span>
              </button>

              <button onClick={() => handleCategoryClick('Reformar')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Settings className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Reformar</span>
              </button>

              {/* Segunda linha */}
              <button onClick={() => handleCategoryClick('Pinturas')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Paintbrush className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Pinturas</span>
              </button>

              <button onClick={() => handleCategoryClick('Iluminação')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Lightbulb className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Iluminação</span>
              </button>

              <button onClick={() => handleCategoryClick('Eletro')} className="bg-gradient-to-br from-gray-100 to-white rounded-lg p-4 flex flex-col items-center justify-center min-h-24 hover:shadow-md transition-shadow border border-gray-200">
                <Plug className="h-6 w-6 text-gray-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Eletro</span>
              </button>
            </div>

            {/* Botão Ver mais na parte de baixo */}
            <div className="flex justify-between items-center">
              <button onClick={handleViewMoreCategories} className="flex items-center text-orange-600 hover:text-orange-700 transition-colors">
                <span className="text-sm font-medium">Ver mais</span>
              </button>
              <ChevronRight className="h-4 w-4 text-orange-600" />
            </div>
          </div>

          {/* Textos de Termos e Saiba mais */}
          <div className="mb-6 text-center">
            <div className="flex justify-center items-center gap-4">
              <button onClick={() => navigate('/termos')} className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Termos e condições
              </button>
              <span className="text-gray-400">•</span>
              <button onClick={() => navigate('/saiba-mais')} className="text-sm text-orange-600 hover:text-orange-700 transition-colors font-medium">
                Saiba mais
              </button>
            </div>
          </div>
        </>;
      case 'ofertas':
        return <>
          {/* Semana da pintura - Ofertas especiais */}
          <ProductSection title="🔥 Semana da pintura - Ofertas especiais" products={paintProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMorePaint} />

          {/* Essenciais da Obra - Preços promocionais */}
          <ProductSection title="💰 Essenciais da obra - Preços promocionais" products={essentialProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreEssentials} />

          {/* Banner promocional específico para ofertas */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center">
              <Percent className="h-6 w-6 mr-3" />
              <div>
                <h3 className="font-bold text-lg">Ofertas Imperdíveis!</h3>
                <p className="text-sm opacity-90">Descontos de até 50% em produtos selecionados</p>
              </div>
            </div>
          </div>
        </>;
      case 'servicos':
        return <>
          {/* Prestadores de Serviços */}
          <ServiceCategories categories={serviceCategories} onCategoryClick={handleServiceCategoryClick} />

          {/* Seção de Locações - Integrada aos Serviços */}
          <RentalSection onViewMore={handleViewMoreRentals} onItemClick={handleRentalItemClick} />

          {/* Banner informativo sobre serviços */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Wrench className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800">Profissionais Qualificados</h3>
                <p className="text-blue-600 text-sm">Todos os prestadores são verificados e avaliados</p>
              </div>
            </div>
          </div>

          {/* Banner adicional para locações */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center">
              <Truck className="h-6 w-6 mr-3" />
              <div>
                <h3 className="font-bold text-lg">Locação de Equipamentos</h3>
                <p className="text-sm opacity-90">Máquinas e ferramentas profissionais para sua obra</p>
              </div>
            </div>
          </div>
        </>;
      case 'destaques':
        return <>
          {/* Produtos em Destaque */}
          <ProductSection title="⭐ Produtos em Destaque" products={featuredProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} horizontal={true} />

          {/* Top escolhas pra você */}
          <ProductSection title="🏆 Top escolhas pra você" products={topChoicesProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTopChoices} />

          {/* Clips */}
          <ClipsSection />
        </>;
      case 'mais-vendidos':
        return <>
          {/* Top escolhas pra você */}
          <ProductSection title="🔥 Mais vendidos da semana" products={topChoicesProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTopChoices} />

          {/* Telhas */}
          <ProductSection title="📈 Telhas mais procuradas" products={tilesProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreTiles} />

          {/* Banner de mais vendidos */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-3" />
              <div>
                <h3 className="font-bold text-lg">Produtos Mais Vendidos</h3>
                <p className="text-sm opacity-90">Escolha dos nossos clientes</p>
              </div>
            </div>
          </div>
        </>;
      case 'queridinhos':
        return <>
          {/* Vibe Decoração */}
          <ProductSection title="💖 Vibe Decoração - Favoritos dos clientes" products={decorationProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onViewMore={handleViewMoreDecoration} />

          {/* Clips */}
          <ClipsSection />

          {/* Banner de queridinhos */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center">
              <Heart className="h-6 w-6 mr-3" />
              <div>
                <h3 className="font-bold text-lg">Queridinhos da Comunidade</h3>
                <p className="text-sm opacity-90">Os produtos mais amados pelos nossos clientes</p>
              </div>
            </div>
          </div>
        </>;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-white">
    {/* CSS para esconder scrollbar */}
    <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

    <Header cartItemCount={cartItemCount} onMenuClick={() => {
      // Evitar loop infinito - só navegar se não estiver na página de perfil
      if (location.pathname !== '/profile') {
        navigate('/profile');
      }
    }} onCartClick={() => navigate('/carrinho')} />

    {/* Conteúdo Principal */}
    <main className="pt-[104px] sm:pt-20 max-w-6xl mx-auto px-1">
      <LocationSection onLocationConfirm={handleLocationConfirm} />

      {/* Carrossel de Banners */}
      {productLoadError && <div role="alert" className="m-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">{productLoadError}<button type="button" onClick={()=>setProductReload(value=>value+1)} className="ml-3 font-semibold underline">Tentar novamente</button></div>}
      <BannerCarousel banners={banners} isLoading={bannersLoading} onBannerClick={banner => console.log("Banner clicado:", banner)} />

      {/* Destaque Promocional */}
      <div className="bg-green-100 rounded-lg p-2 mb-2 flex items-center">
        <div className="bg-green-200 p-2 rounded-full mr-3">
          <Truck className="h-4 w-4 text-green-700" />
        </div>
        <div>
          <h3 className="font-medium text-green-800 text-sm">{promoSettings.freeShippingTitle}</h3>
          <p className="text-green-600 text-xs">{promoSettings.freeShippingSubtext}</p>
        </div>
      </div>

      {/* Category Chips */}
      <CategoryChips categories={chipCategories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} className="mb-3" />

      {/* News Banner - Banner de Notícias do Admin */}
      {newsBanner && newsBanner.image_url && <div className="mb-3">
        <div className="rounded-lg overflow-hidden shadow-sm">
          <img key={`news-${newsBanner.id}-${Date.now()}`} src={newsBanner.image_url} alt={newsBanner.alt_text || newsBanner.title} className="w-full h-24 object-cover" />
        </div>
      </div>}

      {/* Promotional Banner - REMOVIDO - Não é mais necessário */}
      {/* {promotionalBanner && promotionalBanner.image_url && (() => {
        console.log('🎯 Renderizando banner promocional:', {
          id: promotionalBanner.id,
          url: promotionalBanner.image_url,
          title: promotionalBanner.title,
          timestamp: Date.now()
        });
        return (
          <div className="mb-3">
            <div className="rounded-lg overflow-hidden shadow-sm">
              <img 
                key={`promo-${promotionalBanner.id}-${Date.now()}`} 
                src={promotionalBanner.image_url} 
                alt={promotionalBanner.alt_text || promotionalBanner.title} 
                className="w-full h-32 object-cover"
                onLoad={() => console.log('✅ Banner promocional carregado com sucesso')}
                onError={(e) => console.error('❌ Erro ao carregar banner promocional:', e)}
              />
            </div>
          </div>
        );
      })()} */}

      {/* Banner Adicional (Legacy - manter por compatibilidade) */}
      {promoImageSettings.enabled && <div className="bg-gray-50 rounded-lg mb-2 overflow-hidden">
        <div className="h-40 rounded-lg overflow-hidden">
          <img src={promoImageSettings.imageUrl} alt={promoImageSettings.altText} className="w-full h-full object-cover" />
        </div>
      </div>}

      {/* Conteúdo baseado na categoria selecionada */}
      {renderSectionsByCategory()}
    </main>

    {/* Espaçamento para sidebar */}
    <div className="h-20"></div>

    <BottomNavigation cartItemCount={cartItemCount} onHomeClick={() => console.log("Home clicked")} onFavoritesClick={() => navigate('/favoritos')} onCartClick={() => navigate('/carrinho')} onClipsClick={() => navigate('/clips')} onMoreClick={() => setIsMoreModalOpen(true)} />

    {/* More Modal */}
    <MoreModal isOpen={isMoreModalOpen} onClose={() => setIsMoreModalOpen(false)} />

    {/* Categories Modal */}
    <CategoriesModal isOpen={isCategoriesModalOpen} onClose={() => setIsCategoriesModalOpen(false)} />
  </div>;
};
export default NewHome;