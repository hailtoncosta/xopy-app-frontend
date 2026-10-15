import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface UseAdminAuthCheckOptions {
  redirectTo?: string;
}

export const useAdminAuthCheck = (options: UseAdminAuthCheckOptions = {}) => {
  const { redirectTo = '/admin/login' } = options;
  const { isAuthenticated, isAdmin, isLoading, admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !isAdmin) {
      navigate(redirectTo, { 
        state: { from: location },
        replace: true 
      });
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate, redirectTo, location]);

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    admin
  };
};
