import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { BottomNavigation } from '@/components/layout';
import { MoreModal } from '@/components/modals';
import { useCart } from '@/hooks';
import type { Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  onBack: () => void;
  onHomeClick: () => void;
  onCategoriesClick: () => void;
  onProfileClick: () => void;
}

const Cart = ({ onBack, onHomeClick, onCategoriesClick, onProfileClick }: CartProps) => {
  const navigate = useNavigate();
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const { cartItems: items, cartItemCount, updateQuantity: updateQty, removeFromCart } = useCart();
  
  const cartItems = items as CartItem[];

  // Função para converter preço string para número
  const priceToNumber = (priceString: string | number): number => {
    if (typeof priceString === 'number') {
      return isNaN(priceString) ? 0 : priceString;
    }
    if (typeof priceString !== 'string' || priceString.trim() === '') {
      console.warn('⚠️ Preço inválido:', priceString);
      return 0;
    }
    const numericValue = parseFloat(priceString.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.'));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Função para converter número para preço string
  const numberToPrice = (number: number): string => {
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const updateQuantity = (id: number | string, newQuantity: number) => {
    updateQty(id, newQuantity);
  };

  const removeItem = (id: number | string) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    try {
      const price = priceToNumber(item.price);
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    } catch (error) {
      console.error('❌ Erro ao calcular preço do item:', item, error);
      return sum;
    }
  }, 0);

  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <button onClick={onBack} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Carrinho</h2>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto pt-16 pb-40">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Seu carrinho está vazio</p>
            <p className="text-gray-400 text-sm">Adicione produtos para continuar</p>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-white px-4 py-4 border-b border-gray-100">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-black text-base font-medium leading-tight">{item.name}</p>
                  <p className="text-orange-600 text-sm font-semibold">{item.price}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      // @ts-ignore
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-black text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button 
                      // @ts-ignore
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <p className="text-black text-base font-semibold">
                    {numberToPrice(priceToNumber(item.price) * item.quantity)}
                  </p>
                  <button 
                    // @ts-ignore
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="px-4 py-4">
              <h3 className="text-black text-lg font-bold mb-4">Resumo do Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-gray-600 text-sm">Subtotal</p>
                  <p className="text-black text-sm">{numberToPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600 text-sm">Frete</p>
                  <p className="text-black text-sm">
                    {shipping === 0 ? 'Grátis' : numberToPrice(shipping)}
                  </p>
                </div>
                {shipping === 0 && (
                  <p className="text-green-600 text-xs">
                    Frete grátis para compras acima de R$ 200,00
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <p className="text-black text-base font-bold">Total</p>
                    <p className="text-black text-base font-bold">{numberToPrice(total)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Button - Fixed above BottomNavigation */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
          <button 
            onClick={() => { localStorage.removeItem('xopy_checkout_item'); navigate('/checkout'); }}
            className="w-full bg-orange-600 text-white text-base font-bold h-12 rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            Adicionar
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        cartItemCount={cartItemCount}
        onHomeClick={onHomeClick}
        onFavoritesClick={onCategoriesClick}
        onCartClick={() => {}} // Already on cart
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => setIsMoreModalOpen(true)}
      />

      {/* More Modal */}
      <MoreModal 
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
      />
    </div>
  );
};

export default Cart;