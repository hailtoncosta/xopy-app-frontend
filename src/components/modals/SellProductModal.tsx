import { CurrencyInput } from '@/components/ui/currency-input';
import { MaskedInput } from '@/components/ui/masked-input';
import { profileCityValue } from '@/lib/profileDetails';
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  User,
  Store,
  Package,
  Recycle,
  Camera,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Tag,
  Ruler,
  Palette,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { ProductService } from '@/services/productService';
import { isValidUUID, generateUUID } from '@/utils/uuid';
import { validateProduct, validateIndividualSeller, validateBusinessSeller } from '@/utils/validation.schemas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SellerType = 'individual' | 'business' | null;
type ProductType = 'new' | 'leftover' | null;

interface SellerInfo {
  // Pessoa Física
  name?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Lojista
  businessName?: string;
  cnpj?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  logo?: string;
}

interface ProductInfo {
  title: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  photos: string[];
}

const SellProductModal: React.FC<SellProductModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerType, setSellerType] = useState<SellerType>(null);
  const [productType, setProductType] = useState<ProductType>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo>({});
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    photos: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Cidades disponíveis (apenas São Luís e Raposa)
  const availableCities = [
    { value: 'sao-luis', label: 'São Luís' },
    { value: 'raposa', label: 'Raposa' },
    ...(user?.profileDetails?.city && !['sao-luis','raposa'].includes(profileCityValue(user.profileDetails.city)) ? [{ value: profileCityValue(user.profileDetails.city), label: user.profileDetails.city }] : [])
  ];

  // Pré-preencher dados do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      setSellerInfo(prev => ({
        ...prev,
        name: user.name || user.email?.split('@')?.[0] || '',
        email: user.email || '',
        phone: user.phone || '',
        state: 'MA',
        city: 'sao-luis',
        businessEmail: user.email || '',
        businessPhone: user.phone || '',
        businessState: 'MA',
        businessCity: 'sao-luis',
        ...(user.profileDetails ? {
          cpf: user.profileDetails.type === 'individual' ? user.profileDetails.taxId : '',
          cnpj: user.profileDetails.type === 'business' ? user.profileDetails.taxId : '',
          address: user.profileDetails.address, zipCode: user.profileDetails.zipCode,
          state: user.profileDetails.state,
          city: profileCityValue(user.profileDetails.city),
          businessName: user.profileDetails.companyName,
          businessAddress: user.profileDetails.address, businessZipCode: user.profileDetails.zipCode,
          businessState: user.profileDetails.state,
          businessCity: profileCityValue(user.profileDetails.city)
        } : {})
      }));
    }
  }, [isOpen, user]);

  const categories = [
    'Cimento e Argamassa',
    'Tijolos e Blocos',
    'Telhas e Coberturas',
    'Pisos e Revestimentos',
    'Tintas e Vernizes',
    'Ferragens',
    'Tubos e Conexões',
    'Madeiras',
    'Metais',
    'Isolamento',
    'Outros'
  ];



  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSellerType(null);
    setProductType(null);
    setSellerInfo({});
    setProductInfo({
      title: '',
      description: '',
      category: '',
      price: '',
      quantity: '',
      photos: []
    });
    onClose();
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo inválido', {
          description: 'Por favor, selecione apenas arquivos de imagem.',
          duration: 4000,
        });
        return;
      }

      // Validar tamanho do arquivo (máximo 2MB para logo)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande', {
          description: 'A logo deve ter no máximo 2MB.',
          duration: 4000,
        });
        return;
      }

      // Criar URL temporária para preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSellerInfo(prev => ({ ...prev, logo: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: string[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/') && productInfo.photos.length + newPhotos.length < 5) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            setProductInfo(prev => ({
              ...prev,
              photos: [...prev.photos, imageUrl]
            }));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    setProductInfo(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validar informações do vendedor
      const sellerValidation = sellerType === 'individual' 
        ? validateIndividualSeller(sellerInfo)
        : validateBusinessSeller(sellerInfo);

      if (!sellerValidation.success) {
        const errors = sellerValidation.error.errors.map(e => e.message).join(', ');
        toast.error('Erro nos dados do vendedor', {
          description: errors,
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      // Validar informações do produto
      const priceStr = String(productInfo.price ?? '').replace(/[^\d,\.]/g, '').replace(',', '.');
      const price = parseFloat(priceStr);

      // Quantidade pode vir como "10 sacos", "5m²", "1 unidade" — extrair o primeiro número
      const quantityMatch = String(productInfo.quantity ?? '').match(/\d+/);
      const quantity = quantityMatch ? parseInt(quantityMatch[0], 10) : NaN;

      if (isNaN(price) || price <= 0) {
        toast.error('Erro nos dados do produto', {
          description: 'Informe um preço válido maior que zero (ex: 99,90)',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Erro nos dados do produto', {
          description: 'Informe uma quantidade válida começando com um número (ex: 10 sacos, 5 unidades)',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      const productValidation = validateProduct({
        title: productInfo.title,
        description: productInfo.description,
        category: productInfo.category,
        price,
        quantity,
        seller_type: sellerType,
        product_type: productType
      });

      if (!productValidation.success) {
        const errors = productValidation.error.errors.map(e => e.message).join(', ');
        toast.error('Erro nos dados do produto', {
          description: errors,
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      // Validar fotos
      if (productInfo.photos.length === 0) {
        toast.error('Fotos obrigatórias', {
          description: 'Adicione pelo menos uma foto do produto',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }
      // Converter imagens base64 para File objects para upload
      const imageFiles: File[] = [];
      for (let i = 0; i < productInfo.photos.length; i++) {
        const base64 = productInfo.photos[i];
        if (base64.startsWith('data:image/')) {
          const response = await fetch(base64);
          const blob = await response.blob();
          const file = new File([blob], `product-image-${i}.jpg`, { type: 'image/jpeg' });
          imageFiles.push(file);
        }
      }

      // Upload da logo se for lojista
      let logoUrl = null;
      if (sellerType === 'business' && sellerInfo.logo) {
        const productId = generateUUID();
        const logoResponse = await fetch(sellerInfo.logo);
        const logoBlob = await logoResponse.blob();
        const logoFile = new File([logoBlob], `logo-${productId}.jpg`, { type: 'image/jpeg' });
        
        const logoExt = logoFile.name.split('.').pop();
        const logoFileName = `${productId}_logo.${logoExt}`;
        const logoPath = `logos/${logoFileName}`;

        const { data: logoData, error: logoError } = await supabase.storage
          .from('store-logos')
          .upload(logoPath, logoFile);

        if (!logoError) {
          const { data: { publicUrl } } = supabase.storage
            .from('store-logos')
            .getPublicUrl(logoPath);
          logoUrl = publicUrl;
        }
      }

      // Preparar dados do produto conforme estrutura da tabela products
       const productData = {
         title: productInfo.title,
         description: productInfo.description,
         category: productInfo.category,
         price: Number(productInfo.price),
         quantity: parseInt(productInfo.quantity),
         seller_type: sellerType as 'individual' | 'business',
         product_type: productType === 'new' ? 'new' as const : 'leftover' as const,
         seller_info: {
           ...(sellerType === 'individual' ? {
             name: sellerInfo.name || '',
             email: sellerInfo.email || '',
             phone: sellerInfo.phone || '',
             cpf: sellerInfo.cpf || '',
             city: sellerInfo.city || '',
             state: sellerInfo.state || ''
           } : {
             businessName: sellerInfo.businessName || '',
             businessEmail: sellerInfo.businessEmail || '',
             businessPhone: sellerInfo.businessPhone || '',
             cnpj: sellerInfo.cnpj || '',
             businessCity: sellerInfo.businessCity || '',
             businessState: sellerInfo.businessState || '',
             logo: logoUrl // Adicionar logo URL
           })
         }
       };

      // Verificar se o usuário está autenticado e tem um ID válido
      if (!user || !user.id || !isValidUUID(user.id)) {
        toast.error('Erro de autenticação', {
          description: 'Usuário não autenticado. Por favor, faça login novamente.',
          duration: 4000,
        });
        return;
      }

      // Criar produto no Supabase usando método estático
      const result = await ProductService.createProductFromModal(user.id, productData, imageFiles);
      
      if (result.success) {
        console.log('Produto criado com sucesso:', result.product);
        toast.success('🎉 Produto cadastrado com sucesso!', {
          description: 'Seu produto está em análise. Em breve entraremos em contato.',
          duration: 4000,
        });
        handleClose();
      } else {
        console.error('Erro ao criar produto:', result.error);
        toast.error('Erro ao cadastrar produto', {
          description: result.error,
          duration: 4000,
        });
      }
      
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      toast.error('Erro inesperado', {
        description: 'Erro ao cadastrar produto. Tente novamente.',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-8 h-1 mx-2 ${
              step < currentStep ? 'bg-orange-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-black mb-2">Tipo de Vendedor</h3>
        <p className="text-gray-600">Selecione como você quer vender</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setSellerType('individual')}
          className={`w-full p-6 border-2 rounded-xl transition-all ${
            sellerType === 'individual'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              sellerType === 'individual' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              <User className={`h-6 w-6 ${
                sellerType === 'individual' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-black">Pessoa Física</h4>
              <p className="text-gray-600 text-sm">Venda como pessoa física</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSellerType('business')}
          className={`w-full p-6 border-2 rounded-xl transition-all ${
            sellerType === 'business'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              sellerType === 'business' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              <Store className={`h-6 w-6 ${
                sellerType === 'business' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-black">Lojista</h4>
              <p className="text-gray-600 text-sm">Venda como empresa/loja</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-black mb-2">Suas Informações</h3>
        <p className="text-gray-600">
          {sellerType === 'individual' ? 'Dados pessoais' : 'Dados da empresa'}
        </p>
      </div>

      <div className="space-y-4">
        {sellerType === 'individual' ? (
          <>
            {/* Informações preenchidas automaticamente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Informações do seu cadastro</span>
              </div>
              <p className="text-xs text-blue-700">
                Estas informações são preenchidas automaticamente com base no seu cadastro.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={sellerInfo.name || ''}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Seu nome completo"
                disabled
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <MaskedInput mask="cpf"
                type="tel"
                value={sellerInfo.cpf || ''}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setSellerInfo(prev => ({ ...prev, cpf: onlyDigits }));
                }}
                inputMode="numeric"
                maxLength={11}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Digite apenas números (11 dígitos)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <MaskedInput mask="phone"
                  type="tel"
                  value={sellerInfo.phone || ''}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setSellerInfo(prev => ({ ...prev, phone: onlyDigits }));
                  }}
                  inputMode="numeric"
                  maxLength={11}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="Digite apenas números: 11987654321"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={sellerInfo.email || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="seu@email.com"
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                type="text"
                value={sellerInfo.address || ''}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <select
                  value={sellerInfo.city || ''}
                  onChange={(e) => setSellerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                >
                  <option value="">Selecione a cidade</option>
                  {availableCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  value={sellerInfo.state || 'MA'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                >
                  <option value="MA">MA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  value={sellerInfo.zipCode || ''}
                  onChange={(e) => setSellerInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="Digite 8 dígitos: 65000000"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Informações preenchidas automaticamente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Informações do seu cadastro</span>
              </div>
              <p className="text-xs text-blue-700">
                Algumas informações são preenchidas automaticamente com base no seu cadastro.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={sellerInfo.businessName || ''}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ ou CPF *
              </label>
              <MaskedInput mask="cpf-cnpj"
                type="text"
                value={sellerInfo.cnpj || ''}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Digite apenas números"
              />
              <p className="text-xs text-gray-500 mt-1">
                11 dígitos para CPF ou 14 dígitos para CNPJ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone Comercial *
                </label>
                <MaskedInput mask="phone"
                  type="tel"
                  value={sellerInfo.businessPhone || ''}
                  onChange={(e) => setSellerInfo(prev => ({ ...prev, businessPhone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="Digite apenas números: 11987654321"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Comercial *
                </label>
                <input
                  type="email"
                  value={sellerInfo.businessEmail || user?.email || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="contato@empresa.com"
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </label>
              <div
                onClick={handleLogoUpload}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer"
              >
                {sellerInfo.logo ? (
                  <div className="relative">
                    <img
                      src={sellerInfo.logo}
                      alt="Logo"
                      className="w-24 h-24 object-contain mx-auto rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSellerInfo(prev => ({ ...prev, logo: '' }));
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Clique para adicionar logo</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Comercial *
              </label>
              <input
                type="text"
                value={sellerInfo.businessAddress || ''}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Endereço da empresa"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <select
                  value={sellerInfo.businessCity || ''}
                  onChange={(e) => setSellerInfo(prev => ({ ...prev, businessCity: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                >
                  <option value="">Selecione a cidade</option>
                  {availableCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  value={sellerInfo.businessState || 'MA'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                >
                  <option value="MA">MA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  value={sellerInfo.businessZipCode || ''}
                  onChange={(e) => setSellerInfo(prev => ({ ...prev, businessZipCode: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="Digite 8 dígitos: 65000000"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-black mb-2">Tipo de Material</h3>
        <p className="text-gray-600">O que você está vendendo?</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setProductType('new')}
          className={`w-full p-6 border-2 rounded-xl transition-all ${
            productType === 'new'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              productType === 'new' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              <Package className={`h-6 w-6 ${
                productType === 'new' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-black">Material Novo</h4>
              <p className="text-gray-600 text-sm">Produtos novos, nunca utilizados</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setProductType('leftover')}
          className={`w-full p-6 border-2 rounded-xl transition-all ${
            productType === 'leftover'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              productType === 'leftover' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              <Recycle className={`h-6 w-6 ${
                productType === 'leftover' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-black">Sobra de Construção</h4>
              <p className="text-gray-600 text-sm">Materiais que sobraram de obras</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-black mb-2">Informações do Produto</h3>
        <p className="text-gray-600">Descreva o que você está vendendo</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Anúncio *
          </label>
          <input
            type="text"
            value={productInfo.title}
            onChange={(e) => setProductInfo(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            placeholder="Ex: Cimento Portland 50kg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={productInfo.category}
            onChange={(e) => setProductInfo(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={productInfo.description}
            onChange={(e) => setProductInfo(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            placeholder="Descreva detalhadamente o produto, suas características, estado de conservação..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço (R$) *
            </label>
            <CurrencyInput
              type="number"
              value={productInfo.price}
              onChange={(e) => setProductInfo(prev => ({ ...prev, price: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              placeholder="0,00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="text"
              value={productInfo.quantity}
              onChange={(e) => setProductInfo(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              placeholder="Ex: 10 sacos, 5m², 1 unidade"
            />
          </div>
        </div>







        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos do Produto ({productInfo.photos.length}/5)
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {productInfo.photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {productInfo.photos.length < 5 && (
            <div
              onClick={handlePhotoUpload}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer"
            >
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                Adicionar fotos ({productInfo.photos.length}/5)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-xl font-bold text-black">Quero Vender</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !sellerType) ||
                  (currentStep === 3 && !productType)
                }
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !productInfo.title ||
                  !productInfo.category ||
                  !productInfo.description ||
                  !productInfo.price ||
                  !productInfo.quantity
                }
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        className="hidden"
      />
    </div>
  );
};

export default SellProductModal;