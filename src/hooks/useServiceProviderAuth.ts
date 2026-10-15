import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { serviceProviderAuthService } from '@/services/serviceProviderAuthService';

export interface ServiceProviderData {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  experience: string;
  daily_rate: number;
  city: string;
  neighborhood: string;
  address: string;
  description?: string;
  specialties?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const useServiceProviderAuth = () => {
  const { user } = useAuth();
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkServiceProvider = async () => {
      if (!user) {
        setIsServiceProvider(false);
        setServiceProviderData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Verificar se é prestador aprovado
        const isApproved = await serviceProviderAuthService.isApprovedServiceProvider(user.id);
        
        // Buscar dados do prestador (independente do status)
        const providerData = await serviceProviderAuthService.getServiceProviderByUserId(user.id);
        
        setIsServiceProvider(!!providerData);
        setServiceProviderData(providerData);
        
      } catch (error) {
        console.error('Erro ao verificar prestador de serviços:', error);
        setIsServiceProvider(false);
        setServiceProviderData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkServiceProvider();
  }, [user]);

  return {
    isServiceProvider,
    isApprovedProvider: serviceProviderData?.status === 'approved',
    isPendingProvider: serviceProviderData?.status === 'pending',
    isRejectedProvider: serviceProviderData?.status === 'rejected',
    serviceProviderData,
    isLoading,
    refreshData: async () => {
      if (user) {
        setIsLoading(true);
        const providerData = await serviceProviderAuthService.getServiceProviderByUserId(user.id);
        setIsServiceProvider(!!providerData);
        setServiceProviderData(providerData);
        setIsLoading(false);
      }
    }
  };
};