import { Home, Heart, ShoppingCart, Play, MoreHorizontal } from "lucide-react";
interface BottomNavigationProps {
  cartItemCount?: number;
  onHomeClick?: () => void;
  onFavoritesClick?: () => void;
  onCartClick?: () => void;
  onClipsClick?: () => void;
  onMoreClick?: () => void;
}
const BottomNavigation = ({
  cartItemCount = 0,
  onHomeClick,
  onFavoritesClick,
  onCartClick,
  onClipsClick,
  onMoreClick
}: BottomNavigationProps) => {
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden" style={{
    backgroundColor: 'white'
  }}>
      <div className="max-w-6xl mx-auto px-4 py-[10px] bg-gray-50">
        <div className="grid grid-cols-5 gap-1 items-end">
          {/* Início */}
          <button className="flex flex-col items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors justify-self-center" onClick={onHomeClick}>
            <Home className="h-4 w-4 text-gray-600" />
            <span className="text-xs mt-0.5 text-gray-800">Início</span>
          </button>

          {/* Favoritos */}
          <button className="flex flex-col items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors justify-self-center" onClick={onFavoritesClick}>
            <Heart className="h-4 w-4 text-gray-600" />
            <span className="text-xs mt-0.5 text-gray-800">Favoritos</span>
          </button>

          {/* Carrinho - Destaque - Centro */}
          <button onClick={onCartClick} className="flex flex-col items-center w-12 h-12 bg-orange-600 rounded-full hover:bg-orange-700 transition-all duration-300 relative -top-3 shadow-lg hover:shadow-xl hover:scale-105 justify-center justify-self-center py-[5px]">
            <ShoppingCart className="h-5 w-5 text-white" />
            {/* Badge de notificação */}
            {cartItemCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </div>}
          </button>

          {/* Clips */}
          <button className="flex flex-col items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors justify-self-center" onClick={onClipsClick}>
            <Play className="h-4 w-4 text-gray-600" />
            <span className="text-xs mt-0.5 text-gray-800">Clips</span>
          </button>

          {/* Mais */}
          <button className="flex flex-col items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors justify-self-center" onClick={onMoreClick}>
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
            <span className="text-xs mt-0.5 text-gray-800">Mais</span>
          </button>
        </div>
      </div>
    </div>;
};
export default BottomNavigation;