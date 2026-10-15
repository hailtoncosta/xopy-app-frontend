import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Truck, Clock, Shield, Star, MapPin, HardHat, Zap, Home, Heart, ShoppingCart, Play, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

import { loadRentalCatalog, RentalItem } from '@/services/rentalService';
import RentalGallery from '@/components/rental/RentalGallery';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MoreModal from '@/components/modals/MoreModal';

export default function RentalCategory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [searchTerm, selectedCategory]);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    setLoading(true); setError('');
    try {
      const allRentals = await loadRentalCatalog();
      setRentals(allRentals);
      setCategories(['all', ...Array.from(new Set(allRentals.map(item => item.category))).sort((a, b) => a.localeCompare(b, 'pt-BR'))]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível carregar os equipamentos');
    } finally { setLoading(false); }
  };

  // Filter items based on category and search
  const filteredItems = rentals
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleItemClick = (item: RentalItem) => {
    navigate(`/locacao/${item.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Truck className="h-6 w-6 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Locações</h1>
                <p className="text-blue-100 text-sm">Máquinas e ferramentas para sua obra</p>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Entrega rápida</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Shield className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Equipamentos revisados</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Zap className="h-5 w-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Suporte técnico</span>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Navegação de Locações" className="hidden lg:flex max-w-6xl mx-auto px-4 pt-4 gap-2 flex-wrap">
        {[{ label: 'Início', path: '/', icon: Home }, { label: 'Favoritos', path: '/favoritos', icon: Heart }, { label: 'Carrinho', path: '/carrinho', icon: ShoppingCart }, { label: 'Clips', path: '/clips', icon: Play }].map(({ label, path, icon: Icon }) => <Button key={path} variant="outline" onClick={() => navigate(path)}><Icon className="w-4 h-4 mr-2" />{label}</Button>)}
        <Button variant="outline" onClick={() => setShowMoreModal(true)}><MoreHorizontal className="w-4 h-4 mr-2" />Mais</Button>
      </nav>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Barra de busca e filtros */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {/* Filtros de categoria */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'Todas' : category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div role="alert" className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">{error}<Button variant="outline" className="ml-3" onClick={() => void loadRentals()}>Tentar novamente</Button></div>}
        {/* Lista de equipamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.slice(page * 12, (page + 1) * 12).map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                item.popular ? 'border-orange-300' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Badges */}
              <div className="relative">
                {item.popular && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 z-10">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.available ? 'Disponível' : 'Indisponível'}
                  </div>
                </div>

                <RentalGallery images={item.images} name={item.name} compact />
              </div>

              {/* Conteúdo */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                  {item.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                {/* Avaliação e localização */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-orange-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{item.location}</span>
                  </div>
                </div>
                
                {/* Preço e botão */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-blue-600">
                      {item.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      {item.period}
                    </span>
                  </div>
                  
                  {item.available && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      Solicitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length > 0 && <nav aria-label="Páginas de equipamentos" className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Anterior</Button>
          <span className="text-sm">Página {page + 1} de {Math.ceil(filteredItems.length / 12)}</span>
          <Button variant="outline" disabled={(page + 1) * 12 >= filteredItems.length} onClick={() => setPage(value => value + 1)}>Próxima</Button>
        </nav>}

        {/* Mensagem quando não há resultados */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <HardHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum equipamento encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="text-center">
            <HardHat className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-blue-900 text-xl mb-2">
              Não encontrou o que precisa?
            </h3>
            <p className="text-blue-700 mb-4">
              Nossa equipe pode ajudar você a encontrar o equipamento ideal para sua obra
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Falar com especialista
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation onHomeClick={() => navigate('/')} onFavoritesClick={() => navigate('/favoritos')} onCartClick={() => navigate('/carrinho')} onClipsClick={() => navigate('/clips')} onMoreClick={() => setShowMoreModal(true)} />
      <MoreModal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)} />
    </div>
  );
}
