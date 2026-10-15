import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Star, Percent, Palette, ShoppingBag, Settings, Plug, Play, Flame, Wrench } from 'lucide-react';
import { BottomNavigation } from '@/components/layout';
import { contentService } from '@/services/contentService';
import produtoCimento from '@/assets/produto-cimento.jpg';
interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  route: string;
  description: string;
  stores: string[];
}
interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const CategoriesModal = ({
  isOpen,
  onClose
}: CategoriesModalProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('todas');
  const [cartItemCount] = useState(3);
  const [availableStores, setAvailableStores] = useState<string[]>([]);

  // Categorias baseadas nas seções reais do projeto
  const categories: Category[] = [{
    id: 'featured',
    name: 'Destaque',
    icon: Star,
    route: '/categoria/destaques',
    description: 'Produtos em destaque',
    stores: []
  }, {
    id: 'offers',
    name: 'Super Ofertas',
    icon: Percent,
    route: '/ofertas',
    description: 'Até 50% OFF',
    stores: []
  }, {
    id: 'paint',
    name: 'Semana da pintura',
    icon: Palette,
    route: '/categoria/pintura',
    description: 'Tintas e acessórios',
    stores: []
  }, {
    id: 'essential',
    name: 'Essenciais da obra',
    icon: ShoppingBag,
    route: '/categoria/essenciais',
    description: 'Produtos essenciais',
    stores: []
  }, {
    id: 'topChoices',
    name: 'Top escolhas pra você',
    icon: Flame,
    route: '/categoria/top-escolhas',
    description: 'Mais populares',
    stores: []
  }, {
    id: 'tiles',
    name: 'Telhas',
    icon: Settings,
    route: '/categoria/telhas',
    description: 'Coberturas e telhas',
    stores: []
  }, {
    id: 'decoration',
    name: 'Vibe Decoração',
    icon: Star,
    route: '/categoria/decoracao',
    description: 'Decoração e acabamento',
    stores: []
  }, {
    id: 'clips',
    name: 'Clips',
    icon: Play,
    route: '/clips',
    description: 'Vídeos de produtos',
    stores: []
  }, {
    id: 'electro',
    name: 'Eletro',
    icon: Plug,
    route: '/categoria/eletro',
    description: 'Ferramentas elétricas',
    stores: []
  }, {
    id: 'tools',
    name: 'Ferramentas',
    icon: Wrench,
    route: '/categoria/ferramentas',
    description: 'Ferramentas manuais',
    stores: []
  }];

  // Carregar lojas disponíveis dos produtos
  useEffect(() => {
    const loadStores = async () => {
      try {
        const products = await contentService.getProducts();
        const stores = new Set<string>();
        products.forEach(product => {
          if (product.store) {
            stores.add(product.store);
          }
        });
        setAvailableStores(Array.from(stores));

        // Atualizar categorias com as lojas dos produtos
        categories.forEach(category => {
          const categoryProducts = products.filter(p => {
            switch (category.id) {
              case 'featured':
                return p.is_featured;
              case 'offers':
                return p.is_offer;
              case 'paint':
                return p.product_group === 'paint';
              case 'essential':
                return p.is_essential;
              case 'topChoices':
                return p.is_top_choice;
              case 'tiles':
                return p.category === 'Telhas e Coberturas';
              case 'decoration':
                return p.product_group === 'decoration';
              case 'electro':
                return p.product_group === 'electro';
              case 'tools':
                return p.category === 'Ferramentas';
              default:
                return false;
            }
          });
          const categoryStores = new Set<string>();
          categoryProducts.forEach(p => {
            if (p.store) categoryStores.add(p.store);
          });
          category.stores = Array.from(categoryStores);
        });
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      }
    };
    if (isOpen) {
      loadStores();
    }
  }, [isOpen]);
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) || category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === 'todas' || category.stores.includes(selectedStore);
    return matchesSearch && matchesStore;
  });
  const handleCategoryClick = (route: string) => {
    console.log('Navegando para:', route);
    navigate(route);
    onClose();
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset filters when modal closes
      setSearchQuery('');
      setSelectedStore('todas');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-end" onClick={handleBackdropClick}>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />
      
      {/* Modal Content */}
      <div className={`relative w-full h-full bg-white flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Header */}
        <div className="flex items-center bg-orange-500 p-4 pb-2 justify-between">
          <button onClick={onClose} className="text-white flex items-center">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-white text-lg font-bold flex-1 text-center pr-6">Categorias</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-20">
          {/* Search Bar */}
          <div className="px-4 py-3">
            <div className="flex w-full items-stretch rounded-lg h-12 border border-gray-200 bg-gray-50">
              <div className="text-gray-500 flex items-center justify-center pl-4 rounded-l-lg">
                <Search className="h-5 w-5" />
              </div>
              <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={handleSearch} className="flex w-full min-w-0 flex-1 bg-transparent focus:outline-none focus:ring-0 border-none h-full placeholder:text-gray-500 px-4 text-base font-normal" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-500 flex items-center justify-center pr-4">
                  <X className="h-5 w-5" />
                </button>}
            </div>
          </div>

          {/* Store Filter Chips */}
          {availableStores.length > 0 && <div className="px-4 py-3">
              <h3 className="text-gray-700 text-sm font-medium mb-3">Filtrar por loja:</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setSelectedStore('todas')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedStore === 'todas' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>
                  Todas
                </button>
                {availableStores.map(store => <button key={store} onClick={() => setSelectedStore(store)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedStore === store ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>
                    {store}
                  </button>)}
              </div>
            </div>}

          {/* Popular Categories Title */}
          <h2 className="text-black text-xl font-bold px-4 pb-3 pt-2">Categorias Populares</h2>

          {/* Promo Banner */}
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 sm:p-5 text-white overflow-hidden relative">
              {/* Badge de Destaque */}
              <div className="absolute bottom-3 right-3 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                DESTAQUE
              </div>
              
              <div className="flex gap-4 relative z-10">
                {/* Conteúdo do Banner */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold">Super Ofertas</h3>
                      <button onClick={() => {
                      navigate('/ofertas');
                      onClose();
                    }} className="bg-white text-orange-600 px-4 py-1.5 rounded-full font-bold text-xs hover:bg-gray-100 transition-colors whitespace-nowrap">
                        Ver Ofertas
                      </button>
                    </div>
                    
                    <p className="text-sm opacity-90 mb-3">Até 50% OFF em materiais selecionados</p>
                    
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span>✓</span>
                      <span>Frete Grátis acima de R$ 200</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 pt-3 border-t border-white/20">
                    <span className="text-3xl sm:text-4xl font-bold">50%</span>
                    <span className="text-sm opacity-90">Economia de até</span>
                  </div>
                </div>

                {/* Imagem do Produto */}
                
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
            {filteredCategories.map(category => {
            const IconComponent = category.icon;
            return <button key={category.id} onClick={() => handleCategoryClick(category.route)} className="relative rounded-xl border-2 border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all overflow-hidden p-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <IconComponent className="h-6 w-6 text-orange-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="text-left">
                    <h3 className="text-black text-sm font-bold mb-1 line-clamp-2">{category.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-1">{category.description}</p>
                  </div>
                  
                  {/* Store count badge */}
                  {category.stores.length > 0 && <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {category.stores.length}
                    </div>}
                </button>;
          })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-center px-4">
                {searchQuery ? `Nenhuma categoria encontrada para "${searchQuery}"` : `Nenhuma categoria disponível para esta loja`}
              </p>
              <div className="flex gap-2 mt-4">
                {searchQuery && <button onClick={() => setSearchQuery('')} className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
                    Limpar busca
                  </button>}
                {selectedStore !== 'todas' && <button onClick={() => setSelectedStore('todas')} className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
                    Ver todas as lojas
                  </button>}
              </div>
            </div>}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation cartItemCount={cartItemCount} onHomeClick={() => {
        navigate('/');
        onClose();
      }} onFavoritesClick={() => {
        navigate('/favoritos');
        onClose();
      }} onCartClick={() => {
        navigate('/carrinho');
        onClose();
      }} onClipsClick={() => {
        navigate('/clips');
        onClose();
      }} onMoreClick={() => {
        // Já está no modal de categorias, não faz nada
      }} />
      </div>
    </div>;
};
export default CategoriesModal;