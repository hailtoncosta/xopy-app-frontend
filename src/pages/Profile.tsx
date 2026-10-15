import ProfessionalProfileSections from '@/components/profile/ProfessionalProfileSections';
import { appConfirm, appNotify } from '@/lib/feedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  MapPin,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  Settings,
  Camera,
  Upload,
  X,
  Store,
  Wrench,
  Edit3,
  Star,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { MoreModal, SellProductModal, RentEquipmentModal, ManageProductModal, ManageUserProductModal } from '@/components/modals';
import { BottomNavigation } from '@/components/layout';
import { useAuth } from '@/hooks';
import { ProductService } from '@/services/productService';
import { generateUUID } from '@/utils/uuid';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AccountOption {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description?: string;
}

interface SettingsOption {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  value?: string;
  hasArrow: boolean;
}

interface ServiceProviderInfo {
  category: string;
  experience: string;
  dailyRate: number;
  specialties: string[];
  description: string;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
}

interface StoreProduct {
  id: string;
  user_id: string;
  seller_type: 'individual' | 'company';
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_cpf?: string;
  seller_cnpj?: string;
  seller_company_name?: string;
  material_type: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_unit: string;
  product_condition: 'new' | 'used' | 'refurbished';
  product_location: string;
  product_images: string[];
  status: 'active' | 'sold' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface StoreInfo {
  name: string;
  description: string;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  activeProducts: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount] = useState(3);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isManageProductModalOpen, setIsManageProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  const { user: authUser, logout, isAuthenticated, isGuest, isLoading, updateUser } = useAuth();
  
  const [user, setUser] = useState<User>({
    name: authUser?.name || "Visitante",
    email: authUser?.email || "",
    avatar: authUser?.avatar || ""
  });

  // Estados para produtos da loja
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showMyAds, setShowMyAds] = useState(false);

  const [serviceProviderInfo, setServiceProviderInfo] = useState<ServiceProviderInfo>({
    category: '', experience: '', dailyRate: 0, specialties: [], description: '',
    isApproved: false, rating: 0, reviewCount: 0
  });
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [professionalError, setProfessionalError] = useState('');
  useEffect(() => {
    let active = true;
    const empty = {category: '', experience: '', dailyRate: 0, specialties: [], description: '', isApproved: false, rating: 0, reviewCount: 0};
    setServiceProviderInfo(empty);
    if (!authUser?.id || !['service_provider','provider'].includes(authUser.type)) return;
    setProfessionalLoading(true); setProfessionalError('');
    Promise.resolve(supabase.from('service_providers').select('*').eq('user_id', authUser.id).order('created_at', {ascending: false}).limit(1).maybeSingle()).then(({data, error}) => {
      if (!active) return;
      if (error) { setProfessionalError('Não foi possível carregar o perfil profissional.'); return; }
      if (data) setServiceProviderInfo({
        category: data.category || '', experience: data.experience || '', dailyRate: Number(data.daily_rate) || 0,
        specialties: Array.isArray(data.specialties) ? data.specialties : String(data.specialties || '').split(/[,;\n]/).map(value=>value.trim()).filter(Boolean),
        description: data.description || '', isApproved: data.status === 'approved', rating: Number(data.rating) || 0, reviewCount: Number(data.review_count) || 0
      });
    }).finally(()=>{if(active)setProfessionalLoading(false);});
    return () => {active = false;};
  }, [authUser?.id, authUser?.type, authUser?.profileDetails]);

  // Informações específicas da loja
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Materiais São Paulo',
    description: 'Loja especializada em materiais de construção com mais de 10 anos no mercado.',
    isApproved: true,
    rating: 4.6,
    reviewCount: 89,
    totalProducts: 12,
    activeProducts: 10
  });

  // Cleanup para evitar erros de hooks inválidos durante navegação
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Se não estiver autenticado nem como visitante, redirecionar para login
  useEffect(() => {
    // Aguardar o carregamento completo antes de redirecionar
    if (!isLoading && !isAuthenticated && !isGuest) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, isGuest, navigate]);

  // Abrir os formulários existentes quando selecionados no dropdown.
  useEffect(() => {
    const action = new URLSearchParams(location.search).get('action');
    if (isLoading || (action !== 'sell' && action !== 'rent')) return;
    if (isGuest) {
      navigate('/login', { state: { from: location, message: 'Crie uma conta para anunciar.' }, replace: true });
    } else if (isAuthenticated) {
      setIsSellModalOpen(action === 'sell');
      setIsRentModalOpen(action === 'rent');
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, isLoading, isGuest, isAuthenticated, navigate]);

  // Carregar produtos do usuário quando necessário
  useEffect(() => {
    if (showMyAds && authUser?.id) {
      loadUserProducts();
    }
  }, [showMyAds, authUser?.id]);



  // Sincronizar estado local com AuthContext
  useEffect(() => {
    if (authUser) {
      setUser(prevUser => {
        // Só atualizar se os dados realmente mudaram
        if (prevUser.name !== authUser.name || 
            prevUser.email !== authUser.email || 
            prevUser.avatar !== (authUser.avatar || "")) {
          return {
            name: authUser.name,
            email: authUser.email,
            avatar: authUser.avatar || ""
          };
        }
        return prevUser;
      });
    }
  }, [authUser?.name, authUser?.email, authUser?.avatar]);

  // Funções para gerenciar produtos
  const loadUserProducts = async () => {
    if (!authUser?.id || !isMountedRef.current) return;
    
    setLoadingProducts(true);
    try {
      const products = await ProductService.getUserProducts(authUser.id);
      if (isMountedRef.current) {
        setStoreProducts(products);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      if (isMountedRef.current) {
        setLoadingProducts(false);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!(await appConfirm('Tem certeza que deseja excluir este produto?')) || !isMountedRef.current) return;
    
    try {
      await ProductService.deleteProduct(productId);
      if (isMountedRef.current) {
        setStoreProducts(prev => prev.filter(p => p.id !== productId));
        appNotify('Produto excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      if (isMountedRef.current) {
        appNotify('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  // Separando as opções em categorias
  const mainOptions = [
    {
      id: 'orders',
      title: 'Meus Pedidos',
      icon: Truck,
      description: 'Acompanhe suas compras'
    },
    {
      id: 'favorites',
      title: 'Lista de Desejos',
      icon: Heart,
      description: 'Produtos favoritados'
    }
  ];

  const paymentOptions = [
    {
      id: 'payment',
      title: 'Receber vendas',
      icon: CreditCard,
      description: 'Conectar sua conta Mercado Pago'
    },
    {
      id: 'addresses',
      title: 'Endereços',
      icon: MapPin,
      description: 'Locais de entrega salvos'
    }
  ];

  const sellOptions = [
    { id: 'rental-requests', title: 'Solicitações de aluguel', icon: Calendar, description: 'Consultar documentos e aprovar aluguéis' },
    {
      id: 'sell',
      title: 'Vender Produto',
      icon: Plus,
      description: 'Anunciar novo produto'
    },
    {
      id: 'rent',
      title: 'Alugar Equipamento',
      icon: Calendar,
      description: 'Disponibilizar para locação'
    }
  ];

  const notificationOptions = [
    {
      id: 'notifications',
      title: 'Notificações',
      icon: Bell,
      description: 'Configurar alertas'
    }
  ];



  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const settingsOptions: SettingsOption[] = [
    { id: 'change-password', title: 'Alterar senha', icon: Settings, hasArrow: true },
    {
      id: 'language',
      title: 'Idioma',
      icon: Globe,
      value: 'Português',
      hasArrow: false
    },
    {
      id: 'help',
      title: 'Central de Ajuda',
      icon: HelpCircle,
      hasArrow: true
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: Settings,
      hasArrow: true
    }
  ];

  const handleOptionClick = (optionId: string) => {
    // Navegação baseada na opção clicada
    switch (optionId) {
      case 'change-password': navigate('/change-password'); break;
      case 'favorites':
        navigate('/favoritos');
        break;
      case 'orders':
        navigate('/pedidos');
        break;
      case 'payment':
        navigate('/pagamentos');
        break;
      case 'addresses':
        navigate('/enderecos');
        break;
      case 'notifications':
        navigate('/notificacoes');
        break;
      case 'help':
        navigate('/ajuda');
        break;
      case 'settings':
        navigate('/configuracoes');
        break;
      case 'sell':
        // Verificar se o usuário é visitante
        if (isGuest) {
          navigate('/login', { 
            state: { 
              from: location,
              message: 'Para vender produtos, você precisa criar uma conta.' 
            } 
          });
        } else {
          setIsSellModalOpen(true);
        }
        break;
      case 'rental-requests':
        navigate('/solicitacoes-aluguel');
        break;
      case 'rent':
        // Verificar se o usuário é visitante
        if (isGuest) {
          navigate('/login', { 
            state: { 
              from: location,
              message: 'Para alugar equipamentos, você precisa criar uma conta.' 
            } 
          });
        } else {
          setIsRentModalOpen(true);
        }
        break;
      default:
        console.log('Opção não implementada:', optionId);
    }
  };

  const handleLogout = () => {
    if (!isMountedRef.current) return;
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePhotoClick = () => {
    setIsPhotoModalOpen(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Permite selecionar novamente o mesmo arquivo.
    if (!file || !authUser?.id || isSavingPhoto) return;
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const extension = extensions[file.type];
    if (!extension) { toast.error('Escolha uma imagem JPG, PNG, WebP ou GIF.'); return; }
    if (!file.size || file.size > 5 * 1024 * 1024) { toast.error('A foto deve ter até 5 MB.'); return; }
    setIsSavingPhoto(true);
    let uploadedPath: string | null = null;
    try {
      // Confirma que o arquivo pode ser exibido antes de enviá-lo.
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      const path = `${authUser.id}/${generateUUID()}.${extension}`;
      const bucket = supabase.storage.from('avatars');
      const result = await bucket.upload(path, file);
      if (result.error) throw new Error(result.error.message);
      uploadedPath = path;
      const { data } = bucket.getPublicUrl(path);
      await updateUser({ avatar_url: data.publicUrl });
      if (isMountedRef.current) {
        setIsPhotoModalOpen(false);
        toast.success('Foto do perfil atualizada.');
      }
    } catch (error) {
      if (uploadedPath) await supabase.storage.from('avatars').remove([uploadedPath]);
      if (isMountedRef.current) toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a foto.');
    } finally {
      if (isMountedRef.current) setIsSavingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (isSavingPhoto) return;
    setIsSavingPhoto(true);
    try {
      await updateUser({ avatar_url: '' });
      if (isMountedRef.current) { setIsPhotoModalOpen(false); toast.success('Foto removida.'); }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível remover a foto.');
    } finally {
      if (isMountedRef.current) setIsSavingPhoto(false);
    }
  };

  const handleTakePhoto = () => { cameraInputRef.current?.click(); };

  const handleEditServiceInfo = () => {
    window.dispatchEvent(new CustomEvent('xopy:complete-profile', {detail: {editProfessional: true}}));
  };

  // Funções para gerenciar produtos da loja
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsManageProductModalOpen(true);
  };

  const handleEditProduct = (product: StoreProduct) => {
    setSelectedProduct(product);
    setIsManageProductModalOpen(true);
  };

  const handleSaveProduct = async (product: StoreProduct) => {
    if (!isMountedRef.current) return;
    
    try {
      if (selectedProduct) {
        // Editar produto existente
        const updatedProduct = {
          ...selectedProduct,
          ...product,
          updated_at: new Date().toISOString()
        };
        
        // Atualizar no banco de dados
        await ProductService.updateProduct(selectedProduct.id, updatedProduct);
        
        // Atualizar no estado local
        if (isMountedRef.current) {
          setStoreProducts(prev => 
            prev.map(p => p.id === product.id ? updatedProduct : p)
          );
        }
      } else {
        // Adicionar novo produto
        const newProduct: StoreProduct = {
          ...product,
          id: generateUUID(),
          user_id: authUser?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Salvar no banco de dados seria feito aqui
        // await ProductService.createProduct(authUser?.id || '', newProduct);
        
        if (isMountedRef.current) {
          setStoreProducts(prev => [...prev, newProduct]);
        }
      }
      
      // Atualizar contadores
      if (isMountedRef.current) {
        const activeCount = storeProducts.filter(p => p.status === 'active').length;
        setStoreInfo(prev => ({
          ...prev,
          totalProducts: storeProducts.length + (selectedProduct ? 0 : 1),
          activeProducts: activeCount
        }));
      }
      
      // Recarregar produtos do usuário
      if (showMyAds && isMountedRef.current) {
        loadUserProducts();
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      if (isMountedRef.current) {
        appNotify('Erro ao salvar produto. Tente novamente.');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm relative">
        <div className="w-full max-w-3xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isGuest ? 'Visitante' : 'Meu Perfil'}
          </h1>
          <div className="w-9 h-9" /> {/* Espaçador */}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Foto do perfil" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div aria-label="Perfil sem foto" className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200" />
              )}
              {isAuthenticated && (
                <button
                  onClick={handlePhotoClick}
                  disabled={isSavingPhoto}
                  aria-label="Alterar foto do perfil"
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left break-words">
              <h2 className="text-lg font-semibold text-gray-900 text-left">{user.name}</h2>
              <p className="text-sm text-gray-600 text-left">{user.email}</p>
              {isGuest && (
                <p className="text-xs text-orange-600 mt-1 text-left">
                  Acesso limitado - Faça login para mais funcionalidades
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conta */}
        <div className="">
          <h3 className="text-base font-semibold text-gray-900 mb-4 text-left">
            Conta
          </h3>
        </div>

        {/* Pedidos e Favoritos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {mainOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0 text-left break-words">
                  <p className="text-sm font-medium text-gray-900 text-left">{option.title}</p>
                  <p className="text-xs text-gray-500 text-left">{option.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Pagamento e Endereços */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0 text-left break-words">
                  <p className="text-sm font-medium text-gray-900 text-left">{option.title}</p>
                  <p className="text-xs text-gray-500 text-left">{option.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Vender e Alugar */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sellOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0 text-left break-words">
                  <p className="text-sm font-medium text-orange-800 text-left">{option.title}</p>
                  <p className="text-xs text-orange-600 text-left">{option.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-orange-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notificationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0 text-left break-words">
                  <p className="text-sm font-medium text-gray-900 text-left">{option.title}</p>
                  <p className="text-xs text-gray-500 text-left">{option.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Service Provider Section - Only show if user is a service provider */}
        {(authUser?.type === 'service_provider' || authUser?.type === 'provider') && (
          <>
            <h3 className="text-black text-lg font-bold px-4 pb-2 pt-4 text-left">Perfil Profissional</h3>
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 text-left">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {serviceProviderInfo.isApproved ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-semibold text-sm">Perfil Aprovado</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-800 font-semibold text-sm">Aguardando Aprovação</span>
                      </>
                    )}
                  </div>
                  <button
                    disabled={professionalLoading}
                    onClick={handleEditServiceInfo}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                </div>

                {professionalLoading && <p role="status" className="mb-3 text-sm">Carregando perfil profissional...</p>}
                {professionalError && <p role="alert" className="mb-3 text-sm text-red-700">{professionalError}</p>}
                <ProfessionalProfileSections />

                {!serviceProviderInfo.isApproved && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Perfil em Análise</p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Seu perfil está sendo analisado pela nossa equipe. Você receberá uma notificação quando for aprovado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}


        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <h3 className="text-base font-semibold text-gray-900 p-4 border-b border-gray-100 text-left">
            Configurações
          </h3>
          
          <div className="divide-y divide-gray-100">
            {settingsOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0 text-left break-words">
                  <p className="text-sm font-medium text-gray-900 text-left">{option.title}</p>
                  {option.value && (
                    <p className="text-xs text-gray-500 text-left">{option.value}</p>
                  )}
                </div>
                {option.hasArrow ? (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0 text-left break-words">
                <p className="text-sm font-medium text-red-600 text-left">Sair da Conta</p>
                <p className="text-xs text-red-400 text-left">Fazer logout do aplicativo</p>
              </div>
            </button>
          </div>
        )}

        {/* Guest Login Button */}
        {isGuest && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0 text-left break-words">
                <p className="text-sm font-medium text-orange-600 text-left">Fazer Login</p>
                <p className="text-xs text-orange-400 text-left">Acesse sua conta ou crie uma nova</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Foto do Perfil</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {isSavingPhoto && <p role="status" className="text-sm text-orange-600">Salvando foto...</p>}
              <button
                onClick={handleTakePhoto} disabled={isSavingPhoto}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Camera className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-900">Tirar Foto</span>
              </button>
              
              <button
                onClick={handleFileSelect} disabled={isSavingPhoto}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-900">Escolher da Galeria</span>
              </button>
              
              <button
                onClick={handleRemovePhoto} disabled={isSavingPhoto || !user.avatar}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <X className="h-5 w-5" />
                <span className="text-sm">Remover Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handleFileChange} className="hidden" />

      {/* Modals */}
      <MoreModal 
        isOpen={isMoreModalOpen} 
        onClose={() => setIsMoreModalOpen(false)} 
      />
      
      <SellProductModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)} 
      />
      
      <RentEquipmentModal 
        isOpen={isRentModalOpen} 
        onClose={() => setIsRentModalOpen(false)} 
      />

      <ManageUserProductModal
        isOpen={isManageProductModalOpen}
        onClose={() => setIsManageProductModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Profile;