import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout';
import CheckoutNew from './CheckoutNew';

interface CheckoutRouterProps {
  onBack: () => void;
}

const CheckoutRouter = ({ onBack }: CheckoutRouterProps) => {
  const [useNewCheckout, setUseNewCheckout] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar qual checkout usar baseado no produto
    const checkoutItem = localStorage.getItem('xopy_checkout_item');
    
    if (!checkoutItem) {
      navigate('/');
      return;
    }

    try {
      const items = JSON.parse(checkoutItem);
      const product = items[0];
      
      // Verificar se o ID é UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(String(product.id));
      
      console.log('🔀 CheckoutRouter:', {
        productId: product.id,
        isUUID: isUUID,
        useCheckout: isUUID ? 'CheckoutNew (com MP)' : 'Checkout (mockado)'
      });
      
      // Se for UUID, usar CheckoutNew (com Mercado Pago)
      // Se for numérico, usar Checkout antigo (mockado)
      setUseNewCheckout(isUUID);
      
    } catch (error) {
      console.error('Erro ao verificar produto:', error);
      navigate('/');
    }
  }, [navigate]);

  // Mostrar loading enquanto decide
  if (useNewCheckout === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  // Renderizar o checkout apropriado
  return useNewCheckout ? (
    <CheckoutNew onBack={onBack} />
  ) : (
    <Checkout onBack={onBack} />
  );
};

export default CheckoutRouter;
