import { z } from 'zod';

// Validações simplificadas - removidas regex complexas

// Email validation
const emailSchema = z.string()
  .trim()
  .email({ message: 'Email inválido' })
  .max(255, { message: 'Email muito longo' });

// Phone validation - simplificada
const phoneSchema = z.string()
  .trim()
  .min(1, { message: 'Telefone é obrigatório' })
  .refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  }, { message: 'Telefone deve ter 10 ou 11 dígitos' });

// CPF validation - simplificada
const cpfSchema = z.string()
  .trim()
  .min(1, { message: 'CPF é obrigatório' })
  .refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 11;
  }, { message: 'CPF deve ter 11 dígitos' });

// CNPJ validation - simplificada
const cnpjSchema = z.string()
  .trim()
  .min(1, { message: 'CNPJ é obrigatório' })
  .refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 14;
  }, { message: 'CNPJ deve ter 14 dígitos' });

// CEP validation - simplificada
const cepSchema = z.string()
  .trim()
  .min(1, { message: 'CEP é obrigatório' })
  .refine((val) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.length === 8;
  }, { message: 'CEP deve ter 8 dígitos' });

// Product validation schema
export const productSchema = z.object({
  title: z.string()
    .trim()
    .min(3, { message: 'Título deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Título deve ter no máximo 100 caracteres' }),
  
  description: z.string()
    .trim()
    .min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
    .max(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' }),
  
  category: z.string()
    .trim()
    .min(1, { message: 'Selecione uma categoria' }),
  
  price: z.number()
    .positive({ message: 'Preço deve ser maior que zero' })
    .max(1000000, { message: 'Preço deve ser menor que R$ 1.000.000,00' }),
  
  quantity: z.number()
    .int({ message: 'Quantidade deve ser um número inteiro' })
    .positive({ message: 'Quantidade deve ser maior que zero' })
    .max(10000, { message: 'Quantidade deve ser menor que 10.000' }),
  
  seller_type: z.enum(['individual', 'business'], {
    errorMap: () => ({ message: 'Tipo de vendedor inválido' })
  }),
  
  product_type: z.enum(['new', 'leftover'], {
    errorMap: () => ({ message: 'Tipo de produto inválido' })
  }),
});

// Individual seller validation schema
export const individualSellerSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  
  email: emailSchema,
  phone: phoneSchema,
  
  cpf: cpfSchema.optional().or(z.literal('')),
  
  address: z.string()
    .trim()
    .min(5, { message: 'Endereço deve ter pelo menos 5 caracteres' })
    .max(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
    .optional()
    .or(z.literal('')),
  
  city: z.string()
    .trim()
    .min(1, { message: 'Selecione uma cidade' })
    .optional()
    .or(z.literal('')),
  
  state: z.string()
    .trim()
    .length(2, { message: 'Estado deve ter 2 caracteres' })
    .optional()
    .or(z.literal('')),
  
  zipCode: cepSchema.optional().or(z.literal('')),
});

// Business seller validation schema
export const businessSellerSchema = z.object({
  businessName: z.string()
    .trim()
    .min(3, { message: 'Razão social deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Razão social deve ter no máximo 100 caracteres' }),
  
  businessEmail: emailSchema,
  businessPhone: phoneSchema,
  
  cnpj: z.string()
    .trim()
    .refine((val) => {
      if (!val) return true; // Opcional
      const numbers = val.replace(/\D/g, '');
      // Aceita CNPJ (14 dígitos) ou CPF (11 dígitos)
      return numbers.length === 11 || numbers.length === 14;
    }, { message: 'Digite 11 dígitos (CPF) ou 14 dígitos (CNPJ)' })
    .optional()
    .or(z.literal('')),
  
  businessAddress: z.string()
    .trim()
    .min(5, { message: 'Endereço deve ter pelo menos 5 caracteres' })
    .max(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
    .optional()
    .or(z.literal('')),
  
  businessCity: z.string()
    .trim()
    .min(1, { message: 'Selecione uma cidade' })
    .optional()
    .or(z.literal('')),
  
  businessState: z.string()
    .trim()
    .length(2, { message: 'Estado deve ter 2 caracteres' })
    .optional()
    .or(z.literal('')),
  
  businessZipCode: cepSchema.optional().or(z.literal('')),
});

// Service provider validation schema
export const serviceProviderSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  
  email: emailSchema,
  phone: phoneSchema,
  
  category: z.string()
    .trim()
    .min(1, { message: 'Selecione uma categoria' }),
  
  experience: z.string()
    .trim()
    .min(1, { message: 'Selecione a experiência' }),
  
  daily_rate: z.number()
    .positive({ message: 'Diária deve ser maior que zero' })
    .max(100000, { message: 'Diária deve ser menor que R$ 100.000,00' }),
  
  city: z.string()
    .trim()
    .min(1, { message: 'Selecione uma cidade' }),
  
  neighborhood: z.string()
    .trim()
    .min(3, { message: 'Bairro deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .trim()
    .min(5, { message: 'Endereço deve ter pelo menos 5 caracteres' })
    .max(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .trim()
    .max(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
    .optional()
    .or(z.literal('')),
  
  specialties: z.string()
    .trim()
    .max(200, { message: 'Especialidades devem ter no máximo 200 caracteres' })
    .optional()
    .or(z.literal('')),
});

// Export validation functions
export function validateProduct(data: unknown) {
  return productSchema.safeParse(data);
}

export function validateIndividualSeller(data: unknown) {
  return individualSellerSchema.safeParse(data);
}

export function validateBusinessSeller(data: unknown) {
  return businessSellerSchema.safeParse(data);
}

export function validateServiceProvider(data: unknown) {
  return serviceProviderSchema.safeParse(data);
}