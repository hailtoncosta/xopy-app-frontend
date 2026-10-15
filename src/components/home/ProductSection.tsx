import { HorizontalScroll } from './HorizontalScroll';
import { ShoppingCart, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Product } from "@/types";
interface ProductSectionProps {
  title: string;
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onViewMore?: () => void;
  horizontal?: boolean;
  className?: string;
}
const ProductSection = ({
  title,
  products,
  onProductClick,
  onAddToCart,
  onViewMore,
  horizontal = false,
  className = ""
}: ProductSectionProps) => {
  const {
    toggleFavorite,
    isFavorite
  } = useFavorites();
  
  // Log para debug
  if (title === "Essenciais da obra" || title === "Top escolhas pra você") {
    console.log(`🔍 ProductSection "${title}":`, {
      totalProdutos: products.length,
      produtos: products.map(p => ({ id: p.id, name: p.name }))
    });
  }
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'serviço':
        return 'bg-blue-100 text-blue-700';
      case 'decoração':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };
  const handleProductClick = (product: Product) => {
    onProductClick?.(product);
  };
  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    toggleFavorite(product);
  };
  // Se não houver produtos, não renderizar a seção
  if (!products || products.length === 0) {
    console.warn(`⚠️ Seção "${title}" sem produtos para exibir`);
    return null;
  }
  
  return <div className={`mb-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2 px-2 pt-2">
        <h2 className="text-xl font-bold text-black">{title}</h2>
      </div>
      
      {horizontal ? <HorizontalScroll label={title} className="px-2">
          <div className="flex gap-3 min-w-max pb-2">
            {products.map(product => <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow w-48 flex-shrink-0 cursor-pointer" onClick={() => handleProductClick(product)}>
                <div data-carousel-image className="h-32 bg-gray-100 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => {
              console.warn('Erro ao carregar imagem do produto:', product.name);
              e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="18">Imagem indisponível</text></svg>');
            }} />
                  {/* Botão de Favoritos */}
                  <Button size="icon" variant="ghost" className={`absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 ${isFavorite(product.id) ? 'text-orange-600 hover:text-orange-600' : 'text-gray-400 hover:text-orange-600'}`} onClick={e => handleToggleFavorite(e, product)}>
                    <Heart className={`h-3 w-3 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-xs text-black leading-tight">{product.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(product.type)}`}>
                      {product.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-orange-600 font-semibold text-xs">{product.price}</p>
                    <button className="p-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700" onClick={e => handleAddToCart(e, product)}>
                      <ShoppingCart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </HorizontalScroll> : <HorizontalScroll label={title} className="px-2">
        <div className="flex gap-2 w-max min-w-full pb-2">
          {products.map(product => <div key={product.id} className="w-60 sm:w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductClick(product)}>
              <div data-carousel-image className="h-40 bg-gray-100 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => {
            console.warn('Erro ao carregar imagem do produto:', product.name);
            e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="18">Imagem indisponível</text></svg>');
          }} />
                {/* Botão de Favoritos */}
                <Button size="icon" variant="ghost" className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 ${isFavorite(product.id) ? 'text-orange-600 hover:text-orange-600' : 'text-gray-400 hover:text-orange-600'}`} onClick={e => handleToggleFavorite(e, product)}>
                  <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-xs text-black leading-tight">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(product.type)}`}>
                    {product.type}
                  </span>
                </div>
                <div>
                  <p className="text-black font-bold text-sm">{product.price}</p>
                </div>
              </div>
            </div>)}
        </div>
        </HorizontalScroll>}
      
      {onViewMore && <div className="flex justify-between items-center mt-2 px-2 pb-2">
          <button onClick={onViewMore} className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
            Ver mais
          </button>
          <ArrowRight className="h-4 w-4 text-orange-600" />
        </div>}
    </div>;
};
export default ProductSection;