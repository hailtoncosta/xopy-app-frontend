import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useAuthCheck = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuthForCheckout = (): boolean => {
    if (!isAuthenticated && !isGuest) {
      // Redirecionar para login se não estiver autenticado nem como visitante
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
      return false;
    }

    if (isGuest) {
      // Se for visitante, mostrar modal pedindo para fazer login
      navigate('/login', { 
        state: { 
          from: location,
          message: 'Para finalizar sua compra, você precisa fazer login ou criar uma conta.'
        },
        replace: true 
      });
      return false;
    }

    return true;
  };

  const requireAuthForAction = (action: string = 'esta ação'): boolean => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          message: `Para ${action}, você precisa fazer login.`
        },
        replace: true 
      });
      return false;
    }
    return true;
  };

  return {
    requireAuthForCheckout,
    requireAuthForAction,
    isAuthenticated,
    isGuest
  };
};