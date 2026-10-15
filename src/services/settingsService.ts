import { supabase } from '@/integrations/supabase/client';

// Interfaces para as configurações
export interface GeneralSettings {
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

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  darkModeEnabled: boolean;
  customCss: string;
}

export interface InterfaceSettings {
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

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'tls' | 'ssl';
  fromEmail: string;
  fromName: string;
  testEmail: string;
}

export interface PaymentSettings {
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

export interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: number;
  trackingEnabled: boolean;
  packagingCost: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  allowUserRegistration: boolean;
  emailVerificationRequired: boolean;
  adminNotifications: boolean;
}

export interface PromoSettings {
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

export interface PromoImageSettings {
  imageUrl: string;
  altText: string;
  enabled: boolean;
}

export type SettingsType = 'general' | 'appearance' | 'interface' | 'email' | 'payment' | 'shipping' | 'security' | 'promo' | 'promo_image';

class SettingsService {
  // Configurações padrão como fallback
  private getDefaultSettings(type: SettingsType): any {
    const defaults = {
      general: {
        siteName: "Xopy",
        siteDescription: "Plataforma de construção e materiais",
        siteUrl: "https://xopy.com",
        adminEmail: "admin@xopy.com",
        supportEmail: "suporte@xopy.com",
        phone: "(11) 99999-9999",
        address: "São Paulo, SP",
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
        currency: "BRL",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h"
      },
      appearance: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        logoUrl: "/logo.svg",
        faviconUrl: "/favicon.ico",
        darkModeEnabled: false,
        customCss: ""
      },
      interface: {
        topbarTitle: "Xopy",
        topbarSubtitle: "Materiais de Construção",
        logoUrl: "/logo.svg",
        logoAlt: "Xopy Logo",
        searchPlaceholder: "Buscar produtos...",
        menuItems: [
          {"id": "1", "label": "Início", "icon": "home", "url": "/", "enabled": true},
          {"id": "2", "label": "Produtos", "icon": "package", "url": "/produtos", "enabled": true},
          {"id": "3", "label": "Serviços", "icon": "wrench", "url": "/servicos", "enabled": true},
          {"id": "4", "label": "Contato", "icon": "phone", "url": "/contato", "enabled": true}
        ],
        footerText: "© 2024 Xopy. Todos os direitos reservados.",
        contactInfo: {
          phone: "(11) 99999-9999",
          email: "contato@xopy.com",
          address: "São Paulo, SP"
        }
      },
      email: {
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpEncryption: "tls",
        fromEmail: "noreply@xopy.com",
        fromName: "Xopy",
        testEmail: ""
      },
      payment: {
        pixEnabled: true,
        pixKey: "",
        creditCardEnabled: false,
        stripePublicKey: "",
        stripeSecretKey: "",
        paypalEnabled: false,
        paypalClientId: "",
        paypalClientSecret: "",
        minimumOrderValue: 50,
        processingFee: 2.5
      },
      shipping: {
        freeShippingThreshold: 200,
        defaultShippingCost: 15,
        expressShippingCost: 25,
        internationalShipping: false,
        estimatedDeliveryDays: 7,
        trackingEnabled: true,
        packagingCost: 5
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
        allowUserRegistration: true,
        emailVerificationRequired: true,
        adminNotifications: true
      },
      promo: {
        freeShippingTitle: "Frete grátis em produtos selecionados",
        freeShippingDescription: "Confira as condições",
        freeShippingSubtext: "Válido para compras acima de R$ 200",
        freeShippingBgColor: "#10b98120",
        freeShippingIconColor: "#10b981",
        discountTitle: "Descontos de até 50% em produtos selecionados",
        discountDescription: "Aproveite nossas ofertas especiais",
        categoryOfferTitle: "Desconto de até 50% em produtos selecionados desta categoria",
        categoryOfferDescription: "Oferta válida por tempo limitado"
      },
      promo_image: {
        imageUrl: "",
        altText: "Banner promocional",
        enabled: false
      }
    };
    return defaults[type] || null;
  }

  // Buscar configurações por tipo
  async getSettings<T>(type: SettingsType): Promise<T | null> {
    try {
      // Primeiro, verificar se a tabela existe
      const { data, error } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('type', type)
        .single();

      if (error) {
        // Verificar se é erro de tabela não encontrada
        if (error.code === 'PGRST205' || error.message.includes('not found') || error.message.includes('schema cache')) {
          console.warn(`⚠️ Tabela admin_settings não encontrada. Usando configurações padrão para ${type}`);
          console.warn('💡 Execute fix-banner-table.sql para criar a tabela');
          return this.getDefaultSettings(type) as T;
        }
        
        // Para outros erros, também usar configurações padrão
        console.warn(`⚠️ Erro ao buscar configurações ${type}:`, error.message);
        console.log(`📋 Usando configurações padrão para ${type}`);
        return this.getDefaultSettings(type) as T;
      }

      return data?.settings as T;
    } catch (error) {
      console.warn(`⚠️ Erro inesperado ao buscar configurações ${type}:`, error);
      // Retornar configurações padrão em caso de erro
      return this.getDefaultSettings(type) as T;
    }
  }

  // Salvar configurações por tipo
  async saveSettings<T>(type: SettingsType, settings: T): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert([{
          type,
          settings: settings as any,
          updated_at: new Date().toISOString()
        }] as any, {
          onConflict: 'type'
        });

      if (error) {
        console.error(`Erro ao salvar configurações ${type}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Erro ao salvar configurações ${type}:`, error);
      return false;
    }
  }

  // Buscar todas as configurações
  async getAllSettings(): Promise<Record<SettingsType, any> | null> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('type, settings');

      if (error) {
        console.error('Erro ao buscar todas as configurações:', error);
        return null;
      }

      const settings: Record<string, any> = {};
      data?.forEach(item => {
        settings[item.type] = item.settings;
      });

      return settings as Record<SettingsType, any>;
    } catch (error) {
      console.error('Erro ao buscar todas as configurações:', error);
      return null;
    }
  }

  // Método específico para buscar configurações de imagem promocional
  async getPromoImageSettings(): Promise<PromoImageSettings | null> {
    return this.getSettings<PromoImageSettings>('promo_image');
  }
}

export const settingsService = new SettingsService();
export default settingsService;

// Função específica para buscar configurações de aparência
export async function getAppearanceSettings(): Promise<AppearanceSettings | null> {
  return settingsService.getSettings<AppearanceSettings>('appearance');
}

// Função específica para buscar configurações de imagem promocional
export async function getPromoImageSettings(): Promise<PromoImageSettings | null> {
  return settingsService.getPromoImageSettings();
}