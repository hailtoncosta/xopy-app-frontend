import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { request } from '@/integrations/api/client';

export function usePendingRentals() {
  const { admin, isAdmin } = useAdminAuth();
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (!admin || !isAdmin) return;
    let active = true;
    let sequence = 0;
    const refresh = async () => {
      const current = ++sequence;
      try {
        const result = await request('/admin/rental-equipment?status=pending&page=0');
        if (active && current === sequence) setCount(Number(result.count) || 0);
      } catch (error) { console.error('Erro ao verificar equipamentos pendentes:', error); }
    };
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const update = () => { void refresh(); };
    window.addEventListener('focus', update);
    window.addEventListener('contentUpdated', update);
    window.addEventListener('storage', update);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      window.removeEventListener('contentUpdated', update);
      window.removeEventListener('storage', update);
    };
  }, [admin?.id, isAdmin]);
  return admin && isAdmin ? count : 0;
}
