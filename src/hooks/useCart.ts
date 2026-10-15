import { useState, useEffect } from 'react';

interface CartItem {
  id: number | string;
  quantity: number;
  [key: string]: any;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Função para carregar itens do carrinho
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('xopy_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        
        // Calcular total de itens (soma das quantidades)
        const totalItems = parsedCart.reduce((sum: number, item: CartItem) => {
          return sum + (item.quantity || 1);
        }, 0);
        
        setCartItemCount(totalItems);
      } else {
        setCartItems([]);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
      setCartItems([]);
      setCartItemCount(0);
    }
  };

  // Carregar carrinho ao montar o componente
  useEffect(() => {
    loadCart();

    // Listener para mudanças no localStorage (sincronização entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'xopy_cart' || e.key === null) {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listener customizado para mudanças no mesmo contexto
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // Função para adicionar item ao carrinho
  const addToCart = (product: any) => {
    try {
      const savedCart = localStorage.getItem('xopy_cart');
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
      
      // Verificar se o produto já existe no carrinho
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Incrementar quantidade
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Adicionar novo item
        currentCart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('xopy_cart', JSON.stringify(currentCart));
      
      // Disparar evento customizado para atualizar todos os componentes
      window.dispatchEvent(new Event('cart-updated'));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      return false;
    }
  };

  // Função para remover item do carrinho
  const removeFromCart = (productId: number | string) => {
    try {
      const savedCart = localStorage.getItem('xopy_cart');
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
      
      const updatedCart = currentCart.filter(item => item.id !== productId);
      
      localStorage.setItem('xopy_cart', JSON.stringify(updatedCart));
      
      // Disparar evento customizado
      window.dispatchEvent(new Event('cart-updated'));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
      return false;
    }
  };

  // Função para atualizar quantidade
  const updateQuantity = (productId: number | string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        return removeFromCart(productId);
      }

      const savedCart = localStorage.getItem('xopy_cart');
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
      
      const updatedCart = currentCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      
      localStorage.setItem('xopy_cart', JSON.stringify(updatedCart));
      
      // Disparar evento customizado
      window.dispatchEvent(new Event('cart-updated'));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      return false;
    }
  };

  // Função para limpar o carrinho
  const clearCart = () => {
    try {
      localStorage.removeItem('xopy_cart');
      
      // Disparar evento customizado
      window.dispatchEvent(new Event('cart-updated'));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      return false;
    }
  };

  return {
    cartItems,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: loadCart,
  };
};
