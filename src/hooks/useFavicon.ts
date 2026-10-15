import { useEffect } from 'react';

/**
 * Hook para gerenciar dinamicamente o favicon da página
 * @param faviconUrl - URL do favicon a ser aplicado
 */
export const useFavicon = (faviconUrl?: string) => {
  useEffect(() => {
    if (!faviconUrl) return;

    // Encontrar ou criar o elemento link do favicon
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!faviconLink) {
      // Se não existir, criar um novo
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/x-icon';
      document.head.appendChild(faviconLink);
    }

    // Atualizar o href do favicon
    faviconLink.href = faviconUrl;

    // Também atualizar o favicon SVG se existir
    const svgFaviconLink = document.querySelector('link[rel="icon"][type="image/svg+xml"]') as HTMLLinkElement;
    if (svgFaviconLink && faviconUrl.endsWith('.svg')) {
      svgFaviconLink.href = faviconUrl;
    }

    // Cleanup function para restaurar o favicon original quando o componente for desmontado
    return () => {
      // Restaurar favicon padrão
      faviconLink.href = '/favicon.ico';
      if (svgFaviconLink) {
        svgFaviconLink.href = '/favicon.svg';
      }
    };
  }, [faviconUrl]);
};