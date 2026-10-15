# Estrutura do Projeto

Este projeto foi organizado de forma modular e componentizada para facilitar a manutenção e escalabilidade.

## Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── header/          # Componentes do cabeçalho
│   ├── home/            # Componentes específicos da home
│   ├── layout/          # Componentes de layout
│   └── ui/              # Componentes base do shadcn/ui
├── data/                # Dados estáticos e configurações
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e configurações
├── pages/               # Páginas da aplicação
└── types/               # Definições de tipos TypeScript

## Componentes Principais

### Header (`/components/header/`)
- `Header.tsx` - Componente principal do cabeçalho
- `Logo.tsx` - Logo da aplicação
- `SearchBar.tsx` - Barra de pesquisa
- `CartButton.tsx` - Botão do carrinho com contador
- `HeaderActions.tsx` - Ações do cabeçalho (menu, carrinho, usuário)

### Home (`/components/home/`)
- `LocationSection.tsx` - Seção de localização/CEP
- `BannerCarousel.tsx` - Carrossel de banners
- `PromotionalSection.tsx` - Seção promocional
- `CategoryChips.tsx` - Chips de categorias
- `ProductCatalog.tsx` - Catálogo de produtos

### Layout (`/components/layout/`)
- `MainLayout.tsx` - Layout principal da aplicação

## Dados (`/data/`)
- `banners.ts` - Dados dos banners
- `categories.ts` - Categorias disponíveis
- `products.ts` - Produtos do catálogo
- `promotions.ts` - Promoções ativas

## Tipos (`/types/`)
- Definições centralizadas de tipos TypeScript
- Interfaces para componentes e dados

## Como Usar

### Importações
```typescript
// Importar componentes
import { Header, MainLayout } from '@/components';
import { LocationSection, ProductCatalog } from '@/components/home';

// Importar dados
import { homeBanners, homeProducts } from '@/data';

// Importar tipos
import type { Product, Banner } from '@/types';
```

### Exemplo de Uso
```typescript
import { MainLayout } from '@/components/layout';
import { ProductCatalog } from '@/components/home';
import { homeProducts } from '@/data';

const MyPage = () => (
  <MainLayout>
    <ProductCatalog 
      products={homeProducts}
      onProductClick={(product) => console.log(product)}
    />
  </MainLayout>
);
```

## Benefícios da Estrutura

1. **Modularidade** - Cada componente tem responsabilidade única
2. **Reutilização** - Componentes podem ser facilmente reutilizados
3. **Manutenibilidade** - Fácil localização e modificação de código
4. **Escalabilidade** - Estrutura preparada para crescimento
5. **Tipagem** - TypeScript garante type safety
6. **Organização** - Separação clara entre dados, componentes e tipos