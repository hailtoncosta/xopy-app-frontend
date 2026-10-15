import { CurrencyInput } from '@/components/ui/currency-input';
import { MaskedInput } from '@/components/ui/masked-input';
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Globe,
  Palette,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Truck,
  Database,
  Key,
  Users,
  Store,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Percent,
  Upload,
  Download,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Layout,
  Menu,
  Search,
  Image
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import settingsService from '@/services/settingsService';
import ImageUpload from '@/components/admin/ImageUpload';
import { MercadoPagoConnect } from '@/components/admin/MercadoPagoConnect';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  phone: string;
  address: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  darkModeEnabled: boolean;
  customCss: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'tls' | 'ssl';
  fromEmail: string;
  fromName: string;
  testEmail: string;
}

interface PaymentSettings {
  pixEnabled: boolean;
  pixKey: string;
  creditCardEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  minimumOrderValue: number;
  processingFee: number;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: number;
  trackingEnabled: boolean;
  packagingCost: number;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  allowUserRegistration: boolean;
  emailVerificationRequired: boolean;
  adminNotifications: boolean;
}

interface InterfaceSettings {
  topbarTitle: string;
  topbarSubtitle: string;
  logoUrl: string;
  logoAlt: string;
  searchPlaceholder: string;
  menuItems: {
    id: string;
    label: string;
    icon: string;
    url: string;
    enabled: boolean;
  }[];
  footerText: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

interface PromoSettings {
  freeShippingTitle: string;
  freeShippingDescription: string;
  freeShippingSubtext: string;
  freeShippingBgColor: string;
  freeShippingIconColor: string;
  discountTitle: string;
  discountDescription: string;
  categoryOfferTitle: string;
  categoryOfferDescription: string;
}

interface PromoImageSettings {
  imageUrl: string;
  altText: string;
  enabled: boolean;
}

const SettingsAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Minha Loja Online',
    siteDescription: 'A melhor loja online para suas compras',
    siteUrl: 'https://minhaloja.com.br',
    adminEmail: 'admin@minhaloja.com.br',
    supportEmail: 'suporte@minhaloja.com.br',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    darkModeEnabled: true,
    customCss: ''
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@minhaloja.com.br',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@minhaloja.com.br',
    fromName: 'Minha Loja Online',
    testEmail: ''
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    pixEnabled: true,
    pixKey: 'contato@minhaloja.com.br',
    creditCardEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalClientSecret: '',
    minimumOrderValue: 50.00,
    processingFee: 2.5
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 200.00,
    defaultShippingCost: 15.00,
    expressShippingCost: 25.00,
    internationalShipping: false,
    estimatedDeliveryDays: 7,
    trackingEnabled: true,
    packagingCost: 5.00
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    allowUserRegistration: true,
    emailVerificationRequired: true,
    adminNotifications: true
  });

  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>({
    topbarTitle: 'Xopy',
    topbarSubtitle: 'Sua loja de materiais de construção',
    logoUrl: '/logo.png',
    logoAlt: 'Xopy Logo',
    searchPlaceholder: 'Buscar produtos, marcas...',
    menuItems: [
      { id: '1', label: 'Início', icon: 'Home', url: '/', enabled: true },
      { id: '2', label: 'Produtos', icon: 'Package', url: '/produtos', enabled: true },
      { id: '3', label: 'Ofertas', icon: 'Tag', url: '/ofertas', enabled: true },
      { id: '4', label: 'Serviços', icon: 'Wrench', url: '/servicos', enabled: true },
      { id: '5', label: 'Contato', icon: 'Phone', url: '/contato', enabled: true }
    ],
    footerText: '© 2024 Xopy. Todos os direitos reservados.',
    contactInfo: {
      phone: '(11) 99999-9999',
      email: 'contato@xopy.com.br',
      address: 'Rua das Flores, 123 - São Paulo, SP'
    }
  });

  const [promoSettings, setPromoSettings] = useState<PromoSettings>({
    freeShippingTitle: 'Frete grátis em produtos selecionados',
    freeShippingDescription: 'Confira as condições',
    freeShippingSubtext: 'Válido para compras acima de R$ 200',
    freeShippingBgColor: '#10b98120',
    freeShippingIconColor: '#10b981',
    discountTitle: 'Descontos de até 50% em produtos selecionados',
    discountDescription: 'Aproveite nossas ofertas especiais',
    categoryOfferTitle: 'Desconto de até 50% em produtos selecionados desta categoria',
    categoryOfferDescription: 'Oferta válida por tempo limitado'
  });

  const [promoImageSettings, setPromoImageSettings] = useState<PromoImageSettings>({
    imageUrl: '',
    altText: '',
    enabled: false
  });

  // Carregar configurações na inicialização
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const [general, interface_, appearance, email, payment, shipping, security, promo, promoImage] = await Promise.all([
          settingsService.getSettings('general'),
          settingsService.getSettings('interface'),
          settingsService.getSettings('appearance'),
          settingsService.getSettings('email'),
          settingsService.getSettings('payment'),
          settingsService.getSettings('shipping'),
          settingsService.getSettings('security'),
          settingsService.getSettings('promo'),
          settingsService.getPromoImageSettings()
        ]);

        if (general) setGeneralSettings(general as GeneralSettings);
        if (interface_) setInterfaceSettings(interface_ as InterfaceSettings);
        if (appearance) setAppearanceSettings(appearance as AppearanceSettings);
        if (email) setEmailSettings(email as EmailSettings);
        if (payment) setPaymentSettings(payment as PaymentSettings);
        if (shipping) setShippingSettings(shipping as ShippingSettings);
        if (security) setSecuritySettings(security as SecuritySettings);
        if (promo) setPromoSettings(promo as PromoSettings);
        if (promoImage) setPromoImageSettings(promoImage as PromoImageSettings);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // TODO: Mostrar notificação de erro
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    try {
      let success = false;
      
      switch (section) {
        case 'general':
          success = await settingsService.saveSettings('general', generalSettings);
          break;
        case 'interface':
          success = await settingsService.saveSettings('interface', interfaceSettings);
          break;
        case 'appearance':
          success = await settingsService.saveSettings('appearance', appearanceSettings);
          break;
        case 'email':
          success = await settingsService.saveSettings('email', emailSettings);
          break;
        case 'payment':
          success = await settingsService.saveSettings('payment', paymentSettings);
          break;
        case 'shipping':
          success = await settingsService.saveSettings('shipping', shippingSettings);
          break;
        case 'security':
          success = await settingsService.saveSettings('security', securitySettings);
          break;
        case 'promo':
          success = await settingsService.saveSettings('promo', promoSettings);
          break;
        case 'promo_image':
          success = await settingsService.saveSettings('promo_image', promoImageSettings);
          break;
        default:
          console.error('Seção desconhecida:', section);
          return;
      }
      
      if (success) {
        console.log(`✅ Configurações de ${section} salvas com sucesso!`);
        // Disparar evento para atualizar a página principal
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: { section } }));
      } else {
        console.error(`❌ Erro ao salvar configurações de ${section}`);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // TODO: Mostrar notificação de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailSettings.testEmail) return;
    
    setIsLoading(true);
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'interface', label: 'Interface', icon: <Layout className="w-4 h-4" /> },
    { id: 'appearance', label: 'Aparência', icon: <Palette className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'payment', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'mercadopago', label: 'Mercado Pago', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'shipping', label: 'Entrega', icon: <Truck className="w-4 h-4" /> },
    { id: 'promo', label: 'Promoções', icon: <Bell className="w-4 h-4" /> },
    { id: 'promo_image', label: 'Imagem Promocional', icon: <Image className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Informações Básicas Card */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações Básicas
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Site
            </label>
            <input
              type="text"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nome da sua loja"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL do Site
            </label>
            <input
              type="url"
              value={generalSettings.siteUrl}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://seusite.com.br"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição do Site
            </label>
            <textarea
              value={generalSettings.siteDescription}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Descrição breve do seu negócio"
            />
          </div>
        </div>
      </div>

      {/* Contato Card */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações de Contato
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email do Administrador
            </label>
            <input
              type="email"
              value={generalSettings.adminEmail}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email de Suporte
            </label>
            <input
              type="email"
              value={generalSettings.supportEmail}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="suporte@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <MaskedInput mask="phone"
              type="tel"
              value={generalSettings.phone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Endereço
            </label>
            <input
              type="text"
              value={generalSettings.address}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Endereço completo"
            />
          </div>
        </div>
      </div>

      {/* Localização e Formato Card */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Localização e Formato
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuso Horário
            </label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">Nova York (GMT-5)</option>
              <option value="Europe/London">Londres (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idioma
            </label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Moeda
            </label>
            <select
              value={generalSettings.currency}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato de Data
            </label>
            <select
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Cores e Tema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor Primária
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={appearanceSettings.primaryColor}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={appearanceSettings.primaryColor}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor Secundária
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={appearanceSettings.secondaryColor}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={appearanceSettings.secondaryColor}
                onChange={(e) => setAppearanceSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Logotipo e Ícones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logotipo
            </label>
            <ImageUpload
              currentImage={appearanceSettings.logoUrl}
              onImageChange={(url) => setAppearanceSettings(prev => ({ ...prev, logoUrl: url || '' }))}
              folder="logos"
              maxWidth={400}
              maxHeight={200}
              placeholder="Faça upload do logotipo da sua loja"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Favicon
            </label>
            <ImageUpload
              currentImage={appearanceSettings.faviconUrl}
              onImageChange={(url) => setAppearanceSettings(prev => ({ ...prev, faviconUrl: url || '' }))}
              folder="favicons"
              maxWidth={64}
              maxHeight={64}
              placeholder="Faça upload do favicon (ícone do site)"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Opções de Tema
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={appearanceSettings.darkModeEnabled}
              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, darkModeEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar modo escuro
            </span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          CSS Personalizado
        </h3>
        <textarea
          value={appearanceSettings.customCss}
          onChange={(e) => setAppearanceSettings(prev => ({ ...prev, customCss: e.target.value }))}
          placeholder="/* Adicione seu CSS personalizado aqui */"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderInterfaceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações da Topbar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título da Topbar
            </label>
            <input
              type="text"
              value={interfaceSettings.topbarTitle}
              onChange={(e) => setInterfaceSettings(prev => ({ ...prev, topbarTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtítulo da Topbar
            </label>
            <input
              type="text"
              value={interfaceSettings.topbarSubtitle}
              onChange={(e) => setInterfaceSettings(prev => ({ ...prev, topbarSubtitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações do Logo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo da Interface
            </label>
            <ImageUpload
              currentImage={interfaceSettings.logoUrl}
              onImageChange={(url) => setInterfaceSettings(prev => ({ ...prev, logoUrl: url || '' }))}
              folder="interface-logos"
              maxWidth={300}
              maxHeight={100}
              placeholder="Faça upload do logo para a interface"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto Alternativo do Logo
            </label>
            <input
              type="text"
              value={interfaceSettings.logoAlt}
              onChange={(e) => setInterfaceSettings(prev => ({ ...prev, logoAlt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Texto alternativo para acessibilidade"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações da Barra de Pesquisa
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Texto do Placeholder
          </label>
          <input
            type="text"
            value={interfaceSettings.searchPlaceholder}
            onChange={(e) => setInterfaceSettings(prev => ({ ...prev, searchPlaceholder: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Este texto aparecerá como dica na barra de pesquisa
          </p>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pré-visualização da Barra de Pesquisa
          </label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={interfaceSettings.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações do Menu Hambúrguer
        </h3>
        <div className="space-y-4">
          {interfaceSettings.menuItems.map((item, index) => (
            <div key={item.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const newItems = [...interfaceSettings.menuItems];
                      newItems[index] = { ...item, label: e.target.value };
                      setInterfaceSettings(prev => ({ ...prev, menuItems: newItems }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ícone
                  </label>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => {
                      const newItems = [...interfaceSettings.menuItems];
                      newItems[index] = { ...item, icon: e.target.value };
                      setInterfaceSettings(prev => ({ ...prev, menuItems: newItems }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Home, Package, Tag"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const newItems = [...interfaceSettings.menuItems];
                      newItems[index] = { ...item, url: e.target.value };
                      setInterfaceSettings(prev => ({ ...prev, menuItems: newItems }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => {
                        const newItems = [...interfaceSettings.menuItems];
                        newItems[index] = { ...item, enabled: e.target.checked };
                        setInterfaceSettings(prev => ({ ...prev, menuItems: newItems }));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ativo
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    const newItems = interfaceSettings.menuItems.filter((_, i) => i !== index);
                    setInterfaceSettings(prev => ({ ...prev, menuItems: newItems }));
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remover Item
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItem = {
                id: Date.now().toString(),
                label: 'Novo Item',
                icon: 'Circle',
                url: '/',
                enabled: true
              };
              setInterfaceSettings(prev => ({ ...prev, menuItems: [...prev.menuItems, newItem] }));
            }}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            + Adicionar Item do Menu
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informações de Contato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefone
            </label>
            <MaskedInput mask="phone"
              type="tel"
              value={interfaceSettings.contactInfo.phone}
              onChange={(e) => setInterfaceSettings(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={interfaceSettings.contactInfo.email}
              onChange={(e) => setInterfaceSettings(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={interfaceSettings.contactInfo.address}
              onChange={(e) => setInterfaceSettings(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Texto do Rodapé
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Texto do Footer
          </label>
          <input
            type="text"
            value={interfaceSettings.footerText}
            onChange={(e) => setInterfaceSettings(prev => ({ ...prev, footerText: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações SMTP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Servidor SMTP
            </label>
            <input
              type="text"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Porta SMTP
            </label>
            <input
              type="number"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Usuário SMTP
            </label>
            <input
              type="email"
              value={emailSettings.smtpUsername}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha SMTP
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Criptografia
            </label>
            <select
              value={emailSettings.smtpEncryption}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpEncryption: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="none">Nenhuma</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações de Envio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email de Origem
            </label>
            <input
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Origem
            </label>
            <input
              type="text"
              value={emailSettings.fromName}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Teste de Email
        </h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailSettings.testEmail}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, testEmail: e.target.value }))}
            placeholder="Digite um email para teste"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleTestEmail}
            disabled={isLoading || !emailSettings.testEmail}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : testEmailSent ? (
              <Check className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {testEmailSent ? 'Enviado!' : 'Enviar Teste'}
          </button>
        </div>
        {testEmailSent && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Email de teste enviado com sucesso!
          </p>
        )}
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          PIX
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paymentSettings.pixEnabled}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, pixEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar pagamento via PIX
            </span>
          </label>
          {paymentSettings.pixEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={paymentSettings.pixKey}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, pixKey: e.target.value }))}
                onBlur={() => handleSaveSettings('payment')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Cartão de Crédito (Stripe)
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paymentSettings.creditCardEnabled}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, creditCardEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar pagamento com cartão de crédito
            </span>
          </label>
          {paymentSettings.creditCardEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chave Pública Stripe
                </label>
                <input
                  type="text"
                  value={paymentSettings.stripePublicKey}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chave Secreta Stripe
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={paymentSettings.stripeSecretKey}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações Gerais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Mínimo do Pedido (R$)
            </label>
            <CurrencyInput
              type="number"
              step="0.01"
              value={paymentSettings.minimumOrderValue}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, minimumOrderValue: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taxa de Processamento (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={paymentSettings.processingFee}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, processingFee: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações de Frete
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor para Frete Grátis (R$)
            </label>
            <CurrencyInput
              type="number"
              step="0.01"
              value={shippingSettings.freeShippingThreshold}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frete Padrão (R$)
            </label>
            <CurrencyInput
              type="number"
              step="0.01"
              value={shippingSettings.defaultShippingCost}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, defaultShippingCost: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frete Expresso (R$)
            </label>
            <CurrencyInput
              type="number"
              step="0.01"
              value={shippingSettings.expressShippingCost}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, expressShippingCost: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prazo de Entrega (dias)
            </label>
            <input
              type="number"
              value={shippingSettings.estimatedDeliveryDays}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, estimatedDeliveryDays: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Opções Adicionais
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={shippingSettings.internationalShipping}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, internationalShipping: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar entrega internacional
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={shippingSettings.trackingEnabled}
              onChange={(e) => setShippingSettings(prev => ({ ...prev, trackingEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar rastreamento de pedidos
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Autenticação
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={securitySettings.twoFactorEnabled}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habilitar autenticação de dois fatores
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout da Sessão (minutos)
              </label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máximo de Tentativas de Login
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Políticas de Senha
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comprimento Mínimo da Senha
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={securitySettings.requireStrongPassword}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireStrongPassword: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Exigir senha forte (maiúscula, minúscula, número e símbolo)
            </span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Registro de Usuários
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={securitySettings.allowUserRegistration}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, allowUserRegistration: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permitir registro de novos usuários
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={securitySettings.emailVerificationRequired}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Exigir verificação de email
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={securitySettings.adminNotifications}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, adminNotifications: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notificar administradores sobre novos registros
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPromoSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Mensagens Promocionais
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título do Frete Grátis
            </label>
            <input
              type="text"
              value={promoSettings.freeShippingTitle}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Frete grátis em produtos selecionados"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição do Frete Grátis
            </label>
            <input
              type="text"
              value={promoSettings.freeShippingDescription}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Confira as condições"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtexto do Frete Grátis
            </label>
            <input
              type="text"
              value={promoSettings.freeShippingSubtext}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingSubtext: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Válido para compras acima de R$ 200"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor de Fundo do Card (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={promoSettings.freeShippingBgColor?.substring(0, 7) || '#10b981'}
                  onChange={(e) => {
                    const alpha = promoSettings.freeShippingBgColor?.substring(7) || '20';
                    setPromoSettings(prev => ({ ...prev, freeShippingBgColor: e.target.value + alpha }));
                  }}
                  className="h-10 w-16 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={promoSettings.freeShippingBgColor || '#10b98120'}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingBgColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="#10b98120"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Formato: #RRGGBBAA (últimos 2 dígitos = transparência)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor do Ícone (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={promoSettings.freeShippingIconColor || '#10b981'}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingIconColor: e.target.value }))}
                  className="h-10 w-16 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={promoSettings.freeShippingIconColor || '#10b981'}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, freeShippingIconColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="#10b981"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Mensagens de Desconto
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título dos Descontos
            </label>
            <input
              type="text"
              value={promoSettings.discountTitle}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, discountTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Descontos de até 50% em produtos selecionados"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição dos Descontos
            </label>
            <input
              type="text"
              value={promoSettings.discountDescription}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, discountDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Aproveite nossas ofertas especiais"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Ofertas por Categoria
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título da Oferta por Categoria
            </label>
            <input
              type="text"
              value={promoSettings.categoryOfferTitle}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, categoryOfferTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Desconto de até 50% em produtos selecionados desta categoria"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição da Oferta por Categoria
            </label>
            <input
              type="text"
              value={promoSettings.categoryOfferDescription}
              onChange={(e) => setPromoSettings(prev => ({ ...prev, categoryOfferDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Oferta válida por tempo limitado"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPromoImageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações da Imagem Promocional
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure a imagem promocional exibida na página inicial
        </p>
        
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Imagem Promocional
             </label>
             <ImageUpload
               currentImage={promoImageSettings.imageUrl}
               onImageChange={(url) => setPromoImageSettings(prev => ({ ...prev, imageUrl: url || '' }))}
               folder="promo-images"
               maxWidth={1200}
               maxHeight={400}
               placeholder="Clique ou arraste uma imagem promocional aqui"
               className="mb-4"
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               URL da Imagem (alternativo)
             </label>
             <input
               type="url"
               value={promoImageSettings.imageUrl || ''}
               onChange={(e) => setPromoImageSettings(prev => ({ ...prev, imageUrl: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
               placeholder="https://exemplo.com/imagem.jpg"
             />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
               Você pode fazer upload de uma imagem acima ou inserir uma URL diretamente
             </p>
           </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto Alternativo
            </label>
            <input
              type="text"
              value={promoImageSettings.altText || ''}
              onChange={(e) => setPromoImageSettings(prev => ({ ...prev, altText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Descrição da imagem para acessibilidade"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="promo_image_enabled"
              checked={promoImageSettings.enabled}
              onChange={(e) => setPromoImageSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="promo_image_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Exibir imagem promocional
            </label>
          </div>
          
          {promoImageSettings.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pré-visualização
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img
                  src={promoImageSettings.imageUrl}
                  alt={promoImageSettings.altText}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSaveSettings('promo_image')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
       </div>
     </div>
   );

  const renderMercadoPagoSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Integração Mercado Pago
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure sua conta do Mercado Pago para receber pagamentos automaticamente com divisão de taxas.
        </p>
        <MercadoPagoConnect />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'interface':
        return renderInterfaceSettings();
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'mercadopago':
        return renderMercadoPagoSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'promo':
        return renderPromoSettings();
      case 'promo_image':
        return renderPromoImageSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Melhorado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Configurações do Sistema
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Configure e personalize sua plataforma
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Ativo</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configurações</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{tabs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Segurança</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Alta</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Hoje</p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Melhorada */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Categorias
                </h3>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all mb-1 group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      {tab.icon}
                    </div>
                    <span className="font-medium flex-1">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Melhorado */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Header da Seção */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    {tabs.find(t => t.id === activeTab)?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gerencie as configurações de {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                {renderTabContent()}
              </div>
              
              {/* Save Button Melhorado */}
              {activeTab !== 'mercadopago' && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Info className="w-4 h-4" />
                      <span>As alterações serão aplicadas imediatamente</span>
                    </div>
                    <button
                      onClick={() => handleSaveSettings(activeTab)}
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Salvar Configurações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdmin;