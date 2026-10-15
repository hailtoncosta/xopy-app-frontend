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
  Wrench,
  Camera,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Tag,
  Ruler,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks';
import { ProductService } from '@/services/productService';
import { generateUUID } from '@/utils/uuid';
import { toast } from 'sonner';

interface RentEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OwnerType = 'individual' | 'business' | null;

interface OwnerInfo {
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
  logoFile?: File;
}

interface EquipmentInfo {
  title: string;
  description: string;
  category: string;
  dailyPrice: string;
  freight: string;
  condition: string;
  manufacturingYear?: string;
  photos: File[];
  photoUrls: string[]; // Para preview
}

const RentEquipmentModal: React.FC<RentEquipmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(2);
  const [ownerType, setOwnerType] = useState<OwnerType>(user?.profileDetails?.type || 'individual');
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({});
  const [equipmentInfo, setEquipmentInfo] = useState<EquipmentInfo>({
    title: '',
    description: '',
    category: '',
    dailyPrice: '',
    freight: '0.00',
    condition: '',
    photos: [],
    photoUrls: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Cidades disponíveis (apenas São Luís e Raposa)
  const availableCities = [
    { value: 'sao-luis', label: 'São Luís' },
    { value: 'raposa', label: 'Raposa' },
    ...(user?.profileDetails?.city && !['sao-luis','raposa'].includes(profileCityValue(user.profileDetails.city)) ? [{ value: profileCityValue(user.profileDetails.city), label: user.profileDetails.city }] : [])
  ];

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(2);
    if (user && !user.profileCompleted) toast.warning('Conclua seu cadastro para continuar com o aluguel de equipamentos.', { id: 'rental-profile-incomplete' });
  }, [isOpen]);

  // Preencher dados do usuário automaticamente quando o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      setOwnerType(user.profileDetails?.type || 'individual');
      setOwnerInfo(prev => ({
        ...prev,
        // Dados pessoa física
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        state: 'MA', // Fixo para Maranhão
        city: 'sao-luis', // Padrão São Luís
        // Dados lojista
        businessEmail: user.email,
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

  const equipmentCategories = [
    'Escavadeiras',
    'Retroescavadeiras',
    'Tratores',
    'Compactadores',
    'Betoneiras',
    'Andaimes',
    'Geradores',
    'Compressores',
    'Martelos Pneumáticos',
    'Furadeiras Industriais',
    'Serras Elétricas',
    'Outros Equipamentos'
  ];

  const equipmentConditions = [
    'Excelente',
    'Bom',
    'Regular',
    'Precisa de Manutenção'
  ];

  const handleNext = () => {
    if (!user?.profileCompleted) { toast.warning('Conclua seu cadastro antes de continuar.'); return; }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Limpar URLs temporárias
    equipmentInfo.photoUrls.forEach(url => URL.revokeObjectURL(url));
    if (ownerInfo.logo) {
      URL.revokeObjectURL(ownerInfo.logo);
    }
    
    setCurrentStep(2);
    setOwnerType(user?.profileDetails?.type || 'individual');
    setOwnerInfo({});
    setEquipmentInfo({
      title: '',
      description: '',
      category: '',
      dailyPrice: '',
    freight: '0.00',
      condition: '',
      photos: [],
      photoUrls: []
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 5 - equipmentInfo.photos.length;
      const newPhotoFiles = Array.from(files).slice(0, remainingSlots);
      
      // Validar tipo e tamanho
      const validPhotos = newPhotoFiles.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error('Apenas arquivos de imagem são permitidos');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Imagens devem ter no máximo 5MB');
          return false;
        }
        return true;
      });
      
      const photoUrls = validPhotos.map(file => URL.createObjectURL(file));
      
      setEquipmentInfo(prev => ({
        ...prev,
        photos: [...prev.photos, ...validPhotos],
        photoUrls: [...prev.photoUrls, ...photoUrls]
      }));
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho do arquivo (máximo 2MB para logo)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A logo deve ter no máximo 2MB.');
        return;
      }

      const logoUrl = URL.createObjectURL(file);
      setOwnerInfo(prev => ({ ...prev, logo: logoUrl, logoFile: file }));
    }
  };

  const removePhoto = (index: number) => {
    // Revogar URL temporária para liberar memória
    if (equipmentInfo.photoUrls[index]) {
      URL.revokeObjectURL(equipmentInfo.photoUrls[index]);
    }
    
    setEquipmentInfo(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      if (!user?.profileCompleted) { toast.warning('Conclua seu cadastro antes de cadastrar o equipamento.'); return; }
      setIsSubmitting(true);
      
      const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authenticatedUser) {
        window.location.href = '/auth';
        return;
      }

      const freight = Number(equipmentInfo.freight || 0);
      if (!Number.isFinite(freight) || freight < 0) { toast.error('Informe um valor de frete válido'); return; }
      const dailyPrice = Number(equipmentInfo.dailyPrice.trim().replace(',', '.'));
      if (!ownerType || !equipmentInfo.title.trim() || !equipmentInfo.description.trim()
          || !equipmentInfo.category || !equipmentInfo.condition) {
        toast.error('Preencha os dados obrigatórios do equipamento e do proprietário');
        return;
      }
      if (!Number.isFinite(dailyPrice) || dailyPrice <= 0) {
        toast.error('Informe um valor de diária maior que zero');
        return;
      }

      // Validar fotos
      if (equipmentInfo.photos.length === 0) {
        toast.error('Adicione pelo menos uma foto do equipamento');
        setIsSubmitting(false);
        return;
      }

      // Gerar ID único para o produto
      const productId = generateUUID();

      // Upload das imagens
      const imageUrls: string[] = [];
      for (let i = 0; i < equipmentInfo.photos.length; i++) {
        const imageUrl = await ProductService.uploadImage(equipmentInfo.photos[i], productId, i + 1);
        if (!imageUrl) {
          throw new Error(`Não foi possível enviar a foto ${i + 1}. Tente novamente.`);
        }
        imageUrls.push(imageUrl);
      }

      if (imageUrls.length === 0) {
        toast.error('Erro ao fazer upload das imagens');
        setIsSubmitting(false);
        return;
      }

      // Upload da logo se for empresa
      let logoUrl = null;
      if (ownerType === 'business' && ownerInfo.logoFile) {
        const logoExt = ownerInfo.logoFile.name.split('.').pop();
        const logoFileName = `${productId}_logo.${logoExt}`;
        const logoPath = `logos/${logoFileName}`;

        const { data: logoData, error: logoError } = await supabase.storage
          .from('store-logos')
          .upload(logoPath, ownerInfo.logoFile);

        if (logoError) {
          throw new Error('Não foi possível enviar a logo da empresa. Tente novamente.');
        }
        if (!logoError) {
          const { data: { publicUrl } } = supabase.storage
            .from('store-logos')
            .getPublicUrl(logoPath);
          logoUrl = publicUrl;
        }
      }

      // Preparar seller_info com logo URL se disponível
      const sellerInfo = ownerType === 'individual' ? {
        name: ownerInfo.name,
        cpf: ownerInfo.cpf,
        email: ownerInfo.email,
        phone: ownerInfo.phone,
        city: ownerInfo.city,
        state: ownerInfo.state
      } : {
        businessName: ownerInfo.businessName,
        cnpj: ownerInfo.cnpj,
        businessEmail: ownerInfo.businessEmail,
        businessPhone: ownerInfo.businessPhone,
        businessCity: ownerInfo.businessCity,
        businessState: ownerInfo.businessState,
        logo: logoUrl // Adicionar logo URL
      };

      // Preparar dados do produto para locação
      const productData = {
        id: productId,
        user_id: authenticatedUser.id,
        title: equipmentInfo.title,
        description: `[LOCAÇÃO] ${equipmentInfo.description}`,
        price: dailyPrice,
        shipping_cost: freight,
        quantity: 1,
        unit: 'diária',
        category: equipmentInfo.category,
        product_type: 'new', // Usar 'new' em vez de 'rental'
        seller_type: ownerType,
        condition: equipmentInfo.condition,
        manufacturing_date: equipmentInfo.manufacturingYear ? `${equipmentInfo.manufacturingYear}-01-01` : null,
        seller_info: sellerInfo,
        images: imageUrls,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Equipamento cadastrado para locação com sucesso! Aguarde a aprovação do administrador.');
      handleClose();
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message) : 'Erro ao cadastrar equipamento. Tente novamente.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step - 1}
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

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">
          {ownerType === 'individual' ? 'Dados pessoais' : 'Dados da empresa'}
        </p>
      </div>

      {!user?.profileCompleted && <div role="alert" className="rounded-2xl border border-orange-200 bg-orange-50 p-4 space-y-3">
        <p className="font-semibold text-orange-900">Conclua seu cadastro para continuar</p>
        <p className="text-sm text-orange-800">Preencha suas informações. Os dados aparecerão aqui automaticamente após salvar.</p>
        <button type="button" className="rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700" onClick={() => window.dispatchEvent(new Event('xopy:complete-profile'))}>Concluir cadastro</button>
      </div>}
      {ownerType === 'business' && <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700"><p>Responsável: {user?.name}</p><p>E-mail da conta: {user?.email}</p></div>}
      <div className="space-y-4">
        {ownerType === 'individual' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={ownerInfo.name || ''}
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
                type="text"
                value={ownerInfo.cpf || ''}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <MaskedInput mask="phone"
                  type="tel"
                  value={ownerInfo.phone || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="(98) 99999-9999"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={ownerInfo.email || ''}
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
                value={ownerInfo.address || ''}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, address: e.target.value }))}
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
                  value={ownerInfo.city || ''}
                  onChange={(e) => setOwnerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                >
                  <option value="">Selecione</option>
                  {availableCities.map(city => (
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
                  value={ownerInfo.state || 'MA'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                >
                  <option value={ownerInfo.state || 'MA'}>{ownerInfo.state || 'MA'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  value={ownerInfo.zipCode || ''}
                  onChange={(e) => setOwnerInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="65000-000"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={ownerInfo.businessName || ''}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ *
              </label>
              <MaskedInput mask="cnpj"
                type="text"
                value={ownerInfo.cnpj || ''}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone Comercial *
                </label>
                <MaskedInput mask="phone"
                  type="tel"
                  value={ownerInfo.businessPhone || user?.phone || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="(98) 3333-3333"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Comercial *
                </label>
                <input
                  type="email"
                  value={ownerInfo.businessEmail || user?.email || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="contato@empresa.com"
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Comercial *
              </label>
              <input
                type="text"
                value={ownerInfo.businessAddress || ''}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
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
                  value={ownerInfo.businessCity || ''}
                  onChange={(e) => setOwnerInfo(prev => ({ ...prev, businessCity: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                >
                  <option value="">Selecione</option>
                  {availableCities.map(city => (
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
                  value={ownerInfo.businessState || 'MA'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled
                >
                  <option value={ownerInfo.businessState || 'MA'}>{ownerInfo.businessState || 'MA'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  value={ownerInfo.businessZipCode || ''}
                  onChange={(e) => setOwnerInfo(prev => ({ ...prev, businessZipCode: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  placeholder="65000-000"
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
        <h3 className="text-xl font-bold text-black mb-2">Informações do Equipamento</h3>
        <p className="text-gray-600">Descreva o equipamento que você quer alugar</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Anúncio *
          </label>
          <input
            type="text"
            value={equipmentInfo.title}
            onChange={(e) => setEquipmentInfo(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            placeholder="Ex: Escavadeira Caterpillar 320D para locação"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={equipmentInfo.category}
            onChange={(e) => setEquipmentInfo(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
          >
            <option value="">Selecione uma categoria</option>
            {equipmentCategories.map(category => (
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
            value={equipmentInfo.description}
            onChange={(e) => setEquipmentInfo(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            placeholder="Descreva detalhadamente o equipamento, suas características, estado de conservação, especificações técnicas..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,2fr)] gap-3 items-start">
          <div className="min-w-0">
            <label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5 font-medium text-gray-700 mb-2">
              Preço por Dia (R$) *
            </label>
            <CurrencyInput
              type="number"
              value={equipmentInfo.dailyPrice}
              onChange={(e) => setEquipmentInfo(prev => ({ ...prev, dailyPrice: e.target.value }))}
              className="h-12 min-w-0 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              placeholder="0,00"
              step="0.01"
            />
          </div>
          <div className="min-w-0">
            <label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5 font-medium text-gray-700 mb-2">
              Estado de Conservação *
            </label>
            <select
              value={equipmentInfo.condition}
              onChange={(e) => setEquipmentInfo(prev => ({ ...prev, condition: e.target.value }))}
              className="h-12 min-w-0 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            >
              <option value="">Selecione</option>
              {equipmentConditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
        <div className="min-w-0"><label htmlFor="equipment-freight" className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5 font-medium text-gray-700 mb-2">Frete (R$)</label><CurrencyInput id="equipment-freight" value={equipmentInfo.freight} onChange={e=>setEquipmentInfo(prev=>({...prev,freight:e.target.value}))} className="h-12 min-w-0 w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" /><p className="mt-1 text-xs text-gray-500">Valor total do frete do equipamento. Informe zero para frete grátis.</p></div>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano de Fabricação
          </label>
          <input
            type="number"
            value={equipmentInfo.manufacturingYear || ''}
            onChange={(e) => setEquipmentInfo(prev => ({ ...prev, manufacturingYear: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            placeholder="Ex: 2020"
            min="1990"
            max={new Date().getFullYear()}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-black mb-2">Fotos do Equipamento</h3>
        <p className="text-gray-600">Adicione fotos para atrair mais interessados</p>
      </div>

      <div className="space-y-4">
        {/* Fotos adicionadas */}
        {equipmentInfo.photoUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {equipmentInfo.photoUrls.map((photoUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={photoUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botão para adicionar fotos */}
        {equipmentInfo.photoUrls.length < 5 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors"
          >
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              Adicionar fotos ({equipmentInfo.photoUrls.length}/5)
            </p>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {currentStep > 2 && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-xl font-bold text-black">{currentStep === 2 ? 'Suas informações' : 'Cadastrar equipamento'}</h2>
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
          
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={(
                  !user?.profileCompleted ||
                  (currentStep === 2 && ownerType === 'individual' && (!ownerInfo.cpf || !ownerInfo.address || !ownerInfo.city || !ownerInfo.zipCode)) ||
                  (currentStep === 2 && ownerType === 'business' && (!ownerInfo.businessName || !ownerInfo.cnpj || !ownerInfo.businessAddress || !ownerInfo.businessCity || !ownerInfo.businessZipCode)) ||
                  (currentStep === 3 && (!equipmentInfo.title || !equipmentInfo.category || !equipmentInfo.description || !equipmentInfo.dailyPrice || !equipmentInfo.condition))
                )}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Cadastrar Equipamento
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

export default RentEquipmentModal;