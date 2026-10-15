import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const ADMIN_CHECK_TIMEOUT = 5000; // 5 seconds
    
    const checkAdmin = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Race between admin check and timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Admin check timeout')), ADMIN_CHECK_TIMEOUT)
        );

        const adminCheckPromise = supabase.rpc('is_admin');

        const { data, error } = await Promise.race([
          adminCheckPromise,
          timeoutPromise
        ]) as { data: boolean; error: any };

        if (error) {
          console.error('Erro ao verificar admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Erro ao verificar admin (timeout ou falha):', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAdmin();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
};