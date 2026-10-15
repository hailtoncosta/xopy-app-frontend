# Design Document - Gerenciamento de Loja do Vendedor

## Overview

Este documento descreve o design técnico para implementar o sistema de gerenciamento de loja para vendedores no marketplace Xopy. A solução permite que vendedores configurem sua loja, gerenciem produtos e tenham um perfil público acessível aos compradores.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  MyListings      │  │  SellerProfile   │                │
│  │  (Vendedor)      │  │  (Público)       │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
├──────────────────────┼───────────────────────────────────────┤
│              Supabase Client                                 │
├──────────────────────┼───────────────────────────────────────┤
│                      │                                       │
│  ┌───────────────────▼────────────────────────┐             │
│  │         Supabase Backend                   │             │
│  │  ┌──────────────┐  ┌──────────────────┐   │             │
│  │  │ seller_stores│  │    products      │   │             │
│  │  │   (nova)     │  │   (existente)    │   │             │
│  │  └──────────────┘  └──────────────────┘   │             │
│  │  ┌──────────────┐  ┌──────────────────┐   │             │
│  │  │    orders    │  │  user_profiles   │   │             │
│  │  │  (existente) │  │   (existente)    │   │             │
│  │  └──────────────┘  └──────────────────┘   │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Configuração da Loja:**
   - Vendedor acessa MyListings → Preenche formulário → Salva em `seller_stores`
   - Upload de logo → Supabase Storage → URL salva em `seller_stores.logo_url`

2. **Visualização Pública:**
   - Comprador clica "Ver loja" → Busca dados de `seller_stores` + `products` → Renderiza SellerProfile

3. **Gerenciamento de Produtos:**
   - Vendedor lista produtos → Query em `products` WHERE `user_id` = vendedor
   - Vendedor edita produto → UPDATE em `products`
   - Vendedor ativa/desativa → UPDATE `products.status`

## Components and Interfaces

### 1. Nova Tabela: `seller_stores`

```sql
CREATE TABLE seller_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_seller_stores_user_id ON seller_stores(user_id);

-- RLS Policies
ALTER TABLE seller_stores ENABLE ROW LEVEL SECURITY;

-- Vendedor pode ver e editar apenas sua própria loja
CREATE POLICY "Vendedores podem ver sua própria loja"
  ON seller_stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendedores podem criar sua loja"
  ON seller_stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendedores podem atualizar sua loja"
  ON seller_stores FOR UPDATE
  USING (auth.uid() = user_id);

-- Todos podem ver lojas públicas (para perfil público)
CREATE POLICY "Todos podem ver lojas públicas"
  ON seller_stores FOR SELECT
  USING (true);
```

### 2. Atualização da Tabela `products`

A tabela `products` já existe e tem o campo `user_id`. Vamos adicionar índice se não existir:

```sql
-- Garantir índice para queries por vendedor
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
```

### 3. Componente: MyListings (Página do Vendedor)

**Localização:** `src/pages/MyListings.tsx`

**Estrutura:**

```typescript
interface SellerStore {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
}

interface MyListingsProps {}

const MyListings = () => {
  // States
  const [storeConfig, setStoreConfig] = useState<SellerStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0, avgRating: 0 });
  const [isEditingStore, setIsEditingStore] = useState(false);
  
  // Sections
  return (
    <div>
      <StoreConfigSection /> {/* Configurações da loja */}
      <StatsSection />        {/* Estatísticas */}
      <ProductsListSection /> {/* Lista de produtos */}
    </div>
  );
};
```

**Sub-componentes:**

- `StoreConfigSection`: Formulário de configuração da loja
- `StatsSection`: Cards com estatísticas
- `ProductsListSection`: Grid/lista de produtos com ações
- `ProductEditModal`: Modal para editar produto
- `LogoUpload`: Componente de upload de imagem

### 4. Componente: SellerProfile (Perfil Público) - Atualização

**Localização:** `src/pages/SellerProfile.tsx` (já existe, precisa atualização)

**Mudanças:**

```typescript
const SellerProfile = () => {
  const { sellerId } = useParams();
  
  // Buscar dados da loja de seller_stores
  const loadSellerProfile = async (id: string) => {
    // 1. Buscar configuração da loja
    const { data: storeData } = await supabase
      .from('seller_stores')
      .select('*')
      .eq('user_id', id)
      .single();
    
    // 2. Buscar produtos do vendedor
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', id)
      .eq('status', 'active')
      .eq('approval_status', 'approved');
    
    // 3. Calcular estatísticas
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', id);
    
    // Renderizar com dados reais
  };
};
```

### 5. Service: SellerStoreService

**Localização:** `src/services/sellerStoreService.ts`

```typescript
export const sellerStoreService = {
  // Buscar configuração da loja do vendedor
  async getStoreConfig(userId: string): Promise<SellerStore | null> {
    const { data, error } = await supabase
      .from('seller_stores')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
  
  // Criar ou atualizar loja
  async upsertStore(storeData: Partial<SellerStore>): Promise<SellerStore> {
    const { data, error } = await supabase
      .from('seller_stores')
      .upsert(storeData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Upload de logo
  async uploadLogo(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `store-logos/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },
  
  // Buscar produtos do vendedor
  async getSellerProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Atualizar status do produto
  async toggleProductStatus(productId: string, newStatus: 'active' | 'inactive'): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId);
    
    if (error) throw error;
  },
  
  // Buscar estatísticas do vendedor
  async getSellerStats(userId: string): Promise<SellerStats> {
    // Total de produtos
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    // Total de vendas
    const { count: salesCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .in('status', ['completed', 'shipped']);
    
    // Avaliação média (implementar quando houver sistema de reviews)
    const avgRating = 4.8; // Placeholder
    
    return {
      totalProducts: productsCount || 0,
      totalSales: salesCount || 0,
      avgRating
    };
  }
};
```

## Data Models

### SellerStore Model

```typescript
interface SellerStore {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### Product Model (já existe, referência)

```typescript
interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: 'active' | 'inactive';
  approval_status: 'pending' | 'approved' | 'rejected';
  seller_info: {
    name: string;
    businessName: string;
  };
  created_at: string;
  updated_at: string;
}
```

### SellerStats Model

```typescript
interface SellerStats {
  totalProducts: number;
  totalSales: number;
  avgRating: number;
}
```

## Error Handling

### Validações

1. **Configuração da Loja:**
   - `business_name`: Obrigatório, mínimo 3 caracteres, máximo 255
   - `description`: Opcional, máximo 500 caracteres
   - `logo_url`: Validar formato de imagem (PNG, JPG, JPEG), máximo 2MB
   - `phone`: Validar formato brasileiro (opcional)

2. **Produtos:**
   - Não permitir deletar produtos com pedidos pendentes
   - Validar permissões (vendedor só pode editar seus próprios produtos)

### Tratamento de Erros

```typescript
try {
  await sellerStoreService.upsertStore(storeData);
  toast.success('Loja atualizada com sucesso!');
} catch (error) {
  if (error.code === '23505') {
    toast.error('Já existe uma loja cadastrada para este usuário');
  } else if (error.code === '23503') {
    toast.error('Usuário não encontrado');
  } else {
    toast.error('Erro ao salvar configurações da loja');
  }
  console.error('Erro:', error);
}
```

## Testing Strategy

### Unit Tests

1. **sellerStoreService.ts:**
   - Testar CRUD de seller_stores
   - Testar upload de logo
   - Testar cálculo de estatísticas
   - Testar validações

2. **MyListings.tsx:**
   - Testar renderização de formulário
   - Testar submit de configurações
   - Testar listagem de produtos
   - Testar toggle de status

### Integration Tests

1. **Fluxo completo de configuração:**
   - Vendedor cria loja → Salva no banco → Aparece no perfil público

2. **Fluxo de edição de produto:**
   - Vendedor edita produto → Atualiza no banco → Reflete no perfil público

3. **Fluxo de visualização pública:**
   - Comprador acessa perfil → Vê informações corretas → Vê produtos ativos

### E2E Tests

1. Vendedor configura loja completa
2. Vendedor adiciona produtos
3. Comprador visualiza perfil público
4. Comprador vê produtos do vendedor

## Performance Considerations

### Otimizações

1. **Caching:**
   - Cache de perfil público (5 minutos)
   - Invalidar cache ao atualizar loja ou produtos

2. **Queries:**
   - Usar índices em `user_id` e `status`
   - Limitar resultados (paginação)
   - Usar `select('*')` apenas quando necessário

3. **Imagens:**
   - Comprimir logos antes de upload
   - Usar CDN do Supabase Storage
   - Lazy loading de imagens de produtos

### Métricas

- Tempo de carregamento do MyListings: < 1s
- Tempo de carregamento do perfil público: < 2s
- Tempo de upload de logo: < 3s

## Security Considerations

### RLS Policies

- Vendedores só podem ver/editar sua própria loja
- Todos podem ver lojas públicas (para perfil)
- Vendedores só podem editar seus próprios produtos

### Validações

- Validar tamanho e tipo de arquivo de logo
- Sanitizar inputs de texto (XSS)
- Validar permissões em todas as operações

### Storage

- Bucket `product-images` com políticas públicas para leitura
- Upload restrito a usuários autenticados
- Validação de tipo MIME no backend

## Migration Plan

### Fase 1: Criar Infraestrutura
1. Criar tabela `seller_stores`
2. Adicionar índices em `products`
3. Configurar RLS policies
4. Configurar Storage bucket

### Fase 2: Implementar Backend
1. Criar `sellerStoreService.ts`
2. Implementar funções CRUD
3. Implementar upload de logo
4. Implementar cálculo de estatísticas

### Fase 3: Implementar Frontend
1. Criar página `MyListings.tsx`
2. Criar componentes de configuração
3. Criar componentes de listagem de produtos
4. Atualizar `SellerProfile.tsx`

### Fase 4: Testes e Ajustes
1. Testar fluxos completos
2. Ajustar UI/UX
3. Otimizar performance
4. Deploy

## Future Enhancements

- Sistema de avaliações/reviews de vendedores
- Dashboard com gráficos de vendas
- Notificações de novos pedidos
- Chat entre comprador e vendedor
- Múltiplas lojas por vendedor
- Integração com redes sociais
