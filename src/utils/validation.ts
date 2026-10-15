// Utilitários de validação para configurações

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  message: string;
}

// Validação de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validação de telefone (formato brasileiro)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validação de CEP
export const validateCep = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

// Validação de configurações gerais
export const validateGeneralSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (!settings.siteName || settings.siteName.trim().length < 2) {
    errors.push('Nome do site deve ter pelo menos 2 caracteres');
  }

  if (!settings.siteDescription || settings.siteDescription.trim().length < 10) {
    errors.push('Descrição do site deve ter pelo menos 10 caracteres');
  }

  if (settings.siteUrl && !validateUrl(settings.siteUrl)) {
    errors.push('URL do site deve ser uma URL válida');
  }

  if (!settings.adminEmail || !validateEmail(settings.adminEmail)) {
    errors.push('Email do administrador deve ser um email válido');
  }

  if (settings.supportEmail && !validateEmail(settings.supportEmail)) {
    errors.push('Email de suporte deve ser um email válido');
  }

  if (settings.phone && !validatePhone(settings.phone)) {
    errors.push('Telefone deve estar em um formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de aparência
export const validateAppearanceSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (settings.logoUrl && !validateUrl(settings.logoUrl)) {
    errors.push('URL do logotipo deve ser uma URL válida');
  }

  if (settings.faviconUrl && !validateUrl(settings.faviconUrl)) {
    errors.push('URL do favicon deve ser uma URL válida');
  }

  // Validação de cores hexadecimais
  const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor'];
  colorFields.forEach(field => {
    if (settings[field] && !/^#[0-9A-F]{6}$/i.test(settings[field])) {
      errors.push(`${field} deve ser uma cor hexadecimal válida (ex: #FF0000)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de interface
export const validateInterfaceSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (!settings.topbarTitle || settings.topbarTitle.trim().length < 1) {
    errors.push('Título da barra superior é obrigatório');
  }

  if (settings.logoUrl && !validateUrl(settings.logoUrl)) {
    errors.push('URL do logo deve ser uma URL válida');
  }

  // Validação dos itens de menu
  if (settings.menuItems && Array.isArray(settings.menuItems)) {
    settings.menuItems.forEach((item: any, index: number) => {
      if (!item.label || item.label.trim().length < 1) {
        errors.push(`Item de menu ${index + 1}: Label é obrigatório`);
      }
      if (!item.path || item.path.trim().length < 1) {
        errors.push(`Item de menu ${index + 1}: Caminho é obrigatório`);
      }
      if (item.path && !item.path.startsWith('/')) {
        errors.push(`Item de menu ${index + 1}: Caminho deve começar com '/'`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de notificação
export const validateNotificationSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (settings.smtpHost && settings.smtpHost.trim().length < 3) {
    errors.push('Host SMTP deve ter pelo menos 3 caracteres');
  }

  if (settings.smtpPort && (isNaN(settings.smtpPort) || settings.smtpPort < 1 || settings.smtpPort > 65535)) {
    errors.push('Porta SMTP deve ser um número entre 1 e 65535');
  }

  if (settings.smtpUser && !validateEmail(settings.smtpUser)) {
    errors.push('Usuário SMTP deve ser um email válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de pagamento
export const validatePaymentSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  // Validação de taxas
  const feeFields = ['creditCardFee', 'debitCardFee', 'pixFee', 'boletoFee'];
  feeFields.forEach(field => {
    if (settings[field] !== undefined && (isNaN(settings[field]) || settings[field] < 0 || settings[field] > 100)) {
      errors.push(`${field} deve ser um número entre 0 e 100`);
    }
  });

  // Validação de valores mínimos
  const minValueFields = ['minOrderValue', 'freeShippingThreshold'];
  minValueFields.forEach(field => {
    if (settings[field] !== undefined && (isNaN(settings[field]) || settings[field] < 0)) {
      errors.push(`${field} deve ser um valor positivo`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de entrega
export const validateShippingSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (settings.defaultShippingCost !== undefined && (isNaN(settings.defaultShippingCost) || settings.defaultShippingCost < 0)) {
    errors.push('Custo padrão de entrega deve ser um valor positivo');
  }

  if (settings.freeShippingThreshold !== undefined && (isNaN(settings.freeShippingThreshold) || settings.freeShippingThreshold < 0)) {
    errors.push('Valor mínimo para frete grátis deve ser um valor positivo');
  }

  if (settings.estimatedDeliveryDays !== undefined && (isNaN(settings.estimatedDeliveryDays) || settings.estimatedDeliveryDays < 1)) {
    errors.push('Prazo estimado de entrega deve ser pelo menos 1 dia');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de configurações de segurança
export const validateSecuritySettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (settings.sessionTimeout !== undefined && (isNaN(settings.sessionTimeout) || settings.sessionTimeout < 5 || settings.sessionTimeout > 1440)) {
    errors.push('Timeout de sessão deve ser entre 5 e 1440 minutos');
  }

  if (settings.maxLoginAttempts !== undefined && (isNaN(settings.maxLoginAttempts) || settings.maxLoginAttempts < 1 || settings.maxLoginAttempts > 10)) {
    errors.push('Máximo de tentativas de login deve ser entre 1 e 10');
  }

  if (settings.passwordMinLength !== undefined && (isNaN(settings.passwordMinLength) || settings.passwordMinLength < 6 || settings.passwordMinLength > 50)) {
    errors.push('Comprimento mínimo da senha deve ser entre 6 e 50 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Função principal de validação
export const validateSettings = (settingsType: string, settings: any): ValidationResult => {
  switch (settingsType) {
    case 'general':
      return validateGeneralSettings(settings);
    case 'appearance':
      return validateAppearanceSettings(settings);
    case 'interface':
      return validateInterfaceSettings(settings);
    case 'notification':
      return validateNotificationSettings(settings);
    case 'payment':
      return validatePaymentSettings(settings);
    case 'shipping':
      return validateShippingSettings(settings);
    case 'security':
      return validateSecuritySettings(settings);
    default:
      return { isValid: true, errors: [] };
  }
};

// Utilitário para formatar mensagens de erro
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `• ${errors.join('\n• ')}`;
};

// Utilitário para validar campos obrigatórios
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): FieldValidation[] => {
  const errors: FieldValidation[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push({
        field,
        message: `${field} é obrigatório`
      });
    }
  });
  
  return errors;
};

// Utilitário para sanitizar dados de entrada
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, '');
};

// Utilitário para validar tamanho de arquivo
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Utilitário para validar tipo de arquivo
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};