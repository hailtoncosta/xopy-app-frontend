import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Power, Loader2, Package as PackageIcon } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { StoreConfigSection, StatsSection } from '@/components/seller';
import { SellProductModal } from '@/components/modals';
import { supabase } from '@/integrations/supabase/client';
import { sellerStoreService, type Product } from '@/services/sellerStoreService';
import { toast } from 'sonner';

const MyListings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cartItemCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadProducts();
    }
  }, [userId, refreshKey]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Você precisa estar logado');
      navigate('/login');
      return;
    }

    setUserId(user.id);
  };

  const loadProducts = async () => {
    if (!userId) return;

    try {
      setIsLoadingProducts(true);
      const data = await sellerStoreService.getSellerProducts(userId);
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    
    try {
      await sellerStoreService.toggleProductStatus(productId, newStatus as 'active' | 'inactive');
      
      // Atualizar lista local
      setProducts(prev => 
        prev.map(p => 
          p.id === productId ? { ...p, status: newStatus as 'active' | 'inactive' } : p
        )
      );

      toast.success(
        newStatus === 'active' 
          ? 'Produto ativado com sucesso!' 
          : 'Produto desativado com sucesso!'
      );
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error(error.message || 'Erro ao alterar status do produto');
    }
  };

  const handleEditProduct = (productId: string) => {
    // Navegar para página de edição (implementar depois)
    navigate(`/product/edit/${productId}`);
  };

  const handleStoreConfigSaved = () => {
    // Atualizar estatísticas após salvar configurações
    setRefreshKey(prev => prev + 1);
  };

  const handleNewProduct = () => {
    setIsSellModalOpen(true);
  };

  const handleSellModalClose = () => {
    setIsSellModalOpen(false);
    // Recarregar produtos após criar novo
    loadProducts();
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/carrinho')}
        onMenuClick={() => navigate('/profile')}
      />

      <div className="pt-[104px] sm:pt-20 pb-24 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex-shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Meus Anúncios</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Gerencie sua loja e produtos</p>
            </div>
          </div>

          <button
            onClick={handleNewProduct}
            className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm md:text-base whitespace-nowrap flex-shrink-0"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Estatísticas */}
        <StatsSection userId={userId} />

        {/* Configurações da Loja */}
        <div className="mb-6">
          <StoreConfigSection userId={userId} onSave={handleStoreConfigSaved} />
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <PackageIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">Produtos Anunciados</h2>
                <p className="text-xs md:text-sm text-gray-600">
                  {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                </p>
              </div>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto anunciado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando seu primeiro produto
              </p>
              <button
                onClick={handleNewProduct}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                Criar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation
        cartItemCount={cartItemCount}
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favoritos')}
        onCartClick={() => navigate('/carrinho')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => {}}
      />

      {/* Modal de Vender Produto */}
      <SellProductModal 
        isOpen={isSellModalOpen} 
        onClose={handleSellModalClose} 
      />
    </div>
  );
};

// Componente ProductCard
interface ProductCardProps {
  product: Product;
  onToggleStatus: (productId: string, currentStatus: string) => void;
  onEdit: (productId: string) => void;
}

const ProductCard = ({ product, onToggleStatus, onEdit }: ProductCardProps) => {
  const getImageUrl = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
  };

  const getStatusColor = () => {
    if (product.approval_status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (product.approval_status === 'rejected') return 'bg-red-100 text-red-800';
    if (product.status === 'inactive') return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (product.approval_status === 'pending') return 'Pendente';
    if (product.approval_status === 'rejected') return 'Rejeitado';
    if (product.status === 'inactive') return 'Inativo';
    return 'Ativo';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagem */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={getImageUrl()}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
          }}
        />
        
        {/* Badge de Status */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Informações */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
          {product.title}
        </h3>
        
        <p className="text-lg font-bold text-orange-600 mb-3">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>

        <p className="text-xs text-gray-500 mb-4">
          Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
        </p>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          
          <button
            onClick={() => onToggleStatus(product.id, product.status)}
            disabled={product.approval_status !== 'approved'}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              product.status === 'active'
                ? 'border border-red-300 text-red-700 hover:bg-red-50'
                : 'border border-green-300 text-green-700 hover:bg-green-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Power className="h-4 w-4" />
            {product.status === 'active' ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
