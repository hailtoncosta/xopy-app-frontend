-- Criar tabela para armazenar configurações do admin
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) UNIQUE NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por tipo
CREATE INDEX IF NOT EXISTS idx_admin_settings_type ON admin_settings(type);

-- Inserir configurações padrão
INSERT INTO admin_settings (type, settings) VALUES 
('general', '{
  "siteName": "Xopy",
  "siteDescription": "Plataforma de construção e materiais",
  "siteUrl": "https://xopy.com",
  "adminEmail": "admin@xopy.com",
  "supportEmail": "suporte@xopy.com",
  "phone": "(11) 99999-9999",
  "address": "São Paulo, SP",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "currency": "BRL",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h"
}'),
('appearance', '{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#10B981",
  "logoUrl": "/logo.svg",
  "faviconUrl": "/favicon.ico",
  "darkModeEnabled": false,
  "customCss": ""
}'),
('interface', '{
  "topbarTitle": "Xopy",
  "topbarSubtitle": "Materiais de Construção",
  "logoUrl": "/logo.svg",
  "logoAlt": "Xopy Logo",
  "searchPlaceholder": "Buscar produtos...",
  "menuItems": [
    {"id": "1", "label": "Início", "icon": "home", "url": "/", "enabled": true},
    {"id": "2", "label": "Produtos", "icon": "package", "url": "/produtos", "enabled": true},
    {"id": "3", "label": "Serviços", "icon": "wrench", "url": "/servicos", "enabled": true},
    {"id": "4", "label": "Contato", "icon": "phone", "url": "/contato", "enabled": true}
  ],
  "footerText": "© 2024 Xopy. Todos os direitos reservados.",
  "contactInfo": {
    "phone": "(11) 99999-9999",
    "email": "contato@xopy.com",
    "address": "São Paulo, SP"
  }
}'),
('email', '{
  "smtpHost": "",
  "smtpPort": 587,
  "smtpUsername": "",
  "smtpPassword": "",
  "smtpEncryption": "tls",
  "fromEmail": "noreply@xopy.com",
  "fromName": "Xopy",
  "testEmail": ""
}'),
('payment', '{
  "pixEnabled": true,
  "pixKey": "",
  "creditCardEnabled": false,
  "stripePublicKey": "",
  "stripeSecretKey": "",
  "paypalEnabled": false,
  "paypalClientId": "",
  "paypalClientSecret": "",
  "minimumOrderValue": 50,
  "processingFee": 2.5
}'),
('shipping', '{
  "freeShippingThreshold": 200,
  "defaultShippingCost": 15,
  "expressShippingCost": 25,
  "internationalShipping": false,
  "estimatedDeliveryDays": 7,
  "trackingEnabled": true,
  "packagingCost": 5
}'),
('security', '{
  "twoFactorEnabled": false,
  "sessionTimeout": 30,
  "maxLoginAttempts": 5,
  "passwordMinLength": 8,
  "requireStrongPassword": true,
  "allowUserRegistration": true,
  "emailVerificationRequired": true,
  "adminNotifications": true
}')
ON CONFLICT (type) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();