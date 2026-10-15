import { appConfirm } from '@/lib/feedback';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Building, X, Loader2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addressService, type Address } from '@/services/addressService';
import { toast } from 'sonner';

const Addresses = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAddresses();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Você precisa estar logado');
      navigate('/login');
      return;
    }

    setUserId(user.id);
  };

  const loadAddresses = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const data = await addressService.getUserAddresses(userId);
      setAddresses(data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return;
    }

    try {
      setIsSearchingCEP(true);
      const result = await addressService.searchByCEP(cleanCEP);
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          street: result.logradouro || prev.street,
          neighborhood: result.bairro || prev.neighborhood,
          city: result.localidade || prev.city,
          state: result.uf || prev.state,
          zip_code: addressService.formatZipCode(cleanCEP)
        }));
        toast.success('CEP encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsSearchingCEP(false);
    }
  };

  const handleAddAddress = async () => {
    if (!userId) return;

    try {
      // Validações
      if (!formData.label || !formData.street || !formData.number || 
          !formData.neighborhood || !formData.city || !formData.state || !formData.zip_code) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await addressService.createAddress({
        ...formData,
        user_id: userId,
        is_default: addresses.length === 0 // Primeiro endereço é padrão
      });

      toast.success('Endereço adicionado com sucesso!');
      setIsAddModalOpen(false);
      resetForm();
      loadAddresses();
    } catch (error: any) {
      console.error('Erro ao adicionar endereço:', error);
      toast.error(error.message || 'Erro ao adicionar endereço');
    }
  };

  const handleEditAddress = async () => {
    if (!editingAddress) return;

    try {
      await addressService.updateAddress(editingAddress.id, formData);
      
      toast.success('Endereço atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditingAddress(null);
      resetForm();
      loadAddresses();
    } catch (error: any) {
      console.error('Erro ao atualizar endereço:', error);
      toast.error(error.message || 'Erro ao atualizar endereço');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!(await appConfirm('Tem certeza que deseja excluir este endereço?'))) {
      return;
    }

    try {
      await addressService.deleteAddress(id);
      toast.success('Endereço excluído com sucesso!');
      loadAddresses();
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      toast.error('Erro ao excluir endereço');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!userId) return;

    try {
      await addressService.setDefaultAddress(id, userId);
      toast.success('Endereço padrão atualizado!');
      loadAddresses();
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error);
      toast.error('Erro ao definir endereço padrão');
    }
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: ''
    });
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5 text-orange-600" />;
      case 'work':
        return <Building className="h-5 w-5 text-orange-600" />;
      default:
        return <MapPin className="h-5 w-5 text-orange-600" />;
    }
  };

  if (!userId || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-black">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Endereços</h2>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Botão Adicionar */}
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="w-full mb-4 flex items-center justify-center gap-2 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Adicionar Endereço
        </button>

        {/* Lista de Endereços */}
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum endereço cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione um endereço para facilitar suas compras
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getAddressIcon(address.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{address.label}</h3>
                      {address.is_default && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                          <Star className="h-3 w-3 fill-current" />
                          Padrão
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {addressService.formatAddress(address)}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Definir como padrão
                        </button>
                      )}
                      
                      <button
                        onClick={() => openEditModal(address)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar */}
      {(isAddModalOpen || isEditModalOpen) && (
        <AddressModal
          isOpen={isAddModalOpen || isEditModalOpen}
          isEdit={isEditModalOpen}
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingAddress(null);
            resetForm();
          }}
          onSave={isEditModalOpen ? handleEditAddress : handleAddAddress}
          onSearchCEP={handleSearchCEP}
          isSearchingCEP={isSearchingCEP}
        />
      )}
    </div>
  );
};

// Componente Modal
interface AddressModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onClose: () => void;
  onSave: () => void;
  onSearchCEP: (cep: string) => void;
  isSearchingCEP: boolean;
}

const AddressModal = ({
  isOpen,
  isEdit,
  formData,
  setFormData,
  onClose,
  onSave,
  onSearchCEP,
  isSearchingCEP
}: AddressModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Editar Endereço' : 'Adicionar Endereço'}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Endereço
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'home', label: 'Casa', icon: Home },
                { value: 'work', label: 'Trabalho', icon: Building },
                { value: 'other', label: 'Casa Mãe', icon: MapPin }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-orange-600 bg-orange-50 shadow-sm'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                >
                  <type.icon className={`h-6 w-6 ${
                    formData.type === type.value ? 'text-orange-600' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.type === type.value ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Endereço *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex: Casa, Trabalho, Casa da Mãe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <input
              type="text"
              value={formData.zip_code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, zip_code: value });
                if (value.length === 8) {
                  onSearchCEP(value);
                }
              }}
              placeholder="00000-000"
              maxLength={9}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {isSearchingCEP && (
              <p className="text-xs text-gray-500 mt-1">Buscando CEP...</p>
            )}
          </div>

          {/* Rua */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua *
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Nome da rua"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto 45"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro *
            </label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Nome do bairro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="São Paulo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UF *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="SP"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              {isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addresses;
