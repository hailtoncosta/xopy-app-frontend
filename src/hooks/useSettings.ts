import { useState, useEffect } from 'react';
import settingsService from '@/services/settingsService';
import type { 
  GeneralSettings, 
  ShippingSettings, 
  PromoSettings,
  PromoImageSettings 
} from '@/services/settingsService';

interface UseSettingsReturn {
  general: GeneralSettings | null;
  shipping: ShippingSettings | null;
  promo: PromoSettings | null;
  promoImage: PromoImageSettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const [promo, setPromo] = useState<PromoSettings | null>(null);
  const [promoImage, setPromoImage] = useState<PromoImageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [generalData, shippingData, promoData, promoImageData] = await Promise.all([
        settingsService.getSettings<GeneralSettings>('general'),
        settingsService.getSettings<ShippingSettings>('shipping'),
        settingsService.getSettings<PromoSettings>('promo'),
        settingsService.getPromoImageSettings()
      ]);

      setGeneral(generalData);
      setShipping(shippingData);
      setPromo(promoData);
      setPromoImage(promoImageData);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Escutar eventos de atualização do admin
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return {
    general,
    shipping,
    promo,
    promoImage,
    isLoading,
    error,
    refresh: loadSettings
  };
};
