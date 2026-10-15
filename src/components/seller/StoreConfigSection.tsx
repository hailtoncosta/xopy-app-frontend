import { MaskedInput } from '@/components/ui/masked-input';
import { useState, useEffect } from 'react';
import { Store, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { sellerStoreService, type SellerStore } from '@/services/sellerStoreService';
import { LogoUpload } from './LogoUpload';

interface StoreConfigSectionProps {
  userId: string;
  onSave?: () => void;
}

export const StoreConfigSection = ({ userId, onSave }: StoreConfigSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [storeData, setStoreData] = useState<Partial<SellerStore>>({
    user_id: userId,
    business_name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    logo_url: ''
  });

  useEffect(() => {
    loadStoreConfig();
  }, [userId]);

  const loadStoreConfig = async () => {
    try {
      setIsLoading(true);
      const config = await sellerStoreService.getStoreConfig(userId);
      
      if (config) {
        setStoreData(config);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SellerStore, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (logoUrl: string) => {
    setStoreData(prev => ({ ...prev, logo_url: logoUrl }));
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!storeData.business_name || storeData.business_name.trim().length < 3) {
        toast.error('Nome da empresa deve ter no mínimo 3 caracteres');
        return;
      }

      if (storeData.description && storeData.description.length > 500) {
        toast.error('Descrição deve ter no máximo 500 caracteres');
        return;
      }

      setIsSaving(true);

      await sellerStoreService.upsertStore({
        ...storeData,
        user_id: userId
      });

      toast.success('Configurações salvas com sucesso!');
      
      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Store className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configurações da Loja</h2>
          <p className="text-sm text-gray-600">Configure as informações da sua loja</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <LogoUpload
          currentLogoUrl={storeData.logo_url}
          userId={userId}
          onUploadComplete={handleLogoUpload}
        />

        {/* Nome da Empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeData.business_name || ''}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            placeholder="Ex: Construções Silva"
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {storeData.business_name?.length || 0}/255 caracteres
          </p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Loja
          </label>
          <textarea
            value={storeData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Conte um pouco sobre sua empresa..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {storeData.description?.length || 0}/500 caracteres
          </p>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço
          </label>
          <input
            type="text"
            value={storeData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Rua, número, bairro"
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={storeData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Ex: São Paulo"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <input
              type="text"
              value={storeData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
            />
          </div>
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <MaskedInput mask="phone"
            type="tel"
            value={storeData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={20}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
