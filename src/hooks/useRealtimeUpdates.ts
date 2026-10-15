import { useEffect } from 'react';

/**
 * Hook para forçar atualização da página principal quando houver mudanças no admin
 * Funciona como fallback para garantir que as mudanças sejam refletidas
 */
export const useRealtimeUpdates = () => {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated') {
        console.log('🔄 Mudança detectada via localStorage - recarregando página...');
        window.location.reload();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastUpdate = localStorage.getItem('admin_content_updated');
        const now = Date.now();
        
        if (lastUpdate && (now - parseInt(lastUpdate)) < 60000) {
          console.log('🔄 Página voltou ao foco após atualização recente - recarregando...');
          localStorage.removeItem('admin_content_updated');
          window.location.reload();
        }
      }
    };

    // Escutar mudanças no localStorage de outras abas
    window.addEventListener('storage', handleStorageChange);
    
    // Escutar quando a página volta ao foco
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

/**
 * Função para marcar que houve atualização no admin
 * Deve ser chamada pelos componentes admin após salvar mudanças
 */
export const markContentUpdated = () => {
  const timestamp = Date.now().toString();
  localStorage.setItem('admin_content_updated', timestamp);
  console.log('📝 Marcado como atualizado:', timestamp);
};