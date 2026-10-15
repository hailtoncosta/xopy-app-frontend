# Design Document - Painel Administrativo

## Overview

O painel administrativo será uma aplicação web moderna e responsiva que permitirá ao administrador gerenciar todos os aspectos do sistema. O design seguirá princípios de Material Design e será otimizado para produtividade, com navegação intuitiva e feedback visual claro.

## Architecture

### Estrutura de Rotas
```
/admin
├── /login - Autenticação do administrador
├── /dashboard - Dashboard principal com métricas
├── /products - Gerenciamento de produtos
│   ├── /list - Lista de produtos
│   ├── /add - Adicionar produto
│   └── /edit/:id - Editar produto
├── /categories - Gerenciamento de categorias
├── /content - Gerenciamento de conteúdo
│   ├── /pages - Edição de páginas
│   ├── /texts - Textos e labels
│   └── /seo - Configurações SEO
├── /media - Galeria de mídia
├── /banners - Banners e promoções
├── /analytics - Relatórios e analytics
├── /settings - Configurações gerais
└── /backup - Backup e restauração
```

### Tecnologias e Bibliotecas
- **React** com TypeScript para componentes
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Hook Form** para formulários
- **React Query** para gerenciamento de estado servidor
- **Chart.js** para gráficos e analytics
- **React DnD** para drag-and-drop
- **React Dropzone** para upload de arquivos

## Components and Interfaces

### 1. Layout Principal (AdminLayout)
```typescript
interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

**Características:**
- Sidebar fixa com navegação principal
- Header com breadcrumbs e informações do admin
- Área de conteúdo responsiva
- Tema escuro/claro toggle

### 2. Sidebar de Navegação (AdminSidebar)
```typescript
interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}
```

**Características:**
- Navegação hierárquica com ícones
- Estado colapsado/expandido
- Badges para notificações
- Highlight do item ativo

### 3. Dashboard Cards (MetricCard)
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}
```

### 4. Tabela de Dados (DataTable)
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  filters?: FilterConfig[];
  actions?: ActionConfig<T>[];
  onRowClick?: (row: T) => void;
}

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}
```

### 5. Editor de Conteúdo (ContentEditor)
```typescript
interface ContentEditorProps {
  content: ContentItem[];
  onSave: (content: ContentItem[]) => void;
  loading?: boolean;
}

interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'banner' | 'section';
  label: string;
  value: string;
  editable: boolean;
  validation?: ValidationRule[];
}
```

### 6. Formulário de Produto (ProductForm)
```typescript
interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: ProductFormData) => void;
  loading?: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: File[];
  specifications: KeyValue[];
  status: 'active' | 'inactive' | 'draft';
}
```

## Data Models

### Admin User
```typescript
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin';
  lastLogin: Date;
  permissions: Permission[];
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

### Content Management
```typescript
interface Page {
  id: string;
  name: string;
  route: string;
  sections: Section[];
  seoConfig: SEOConfig;
}

interface Section {
  id: string;
  type: 'hero' | 'products' | 'categories' | 'banner' | 'text';
  title: string;
  content: Record<string, any>;
  order: number;
  visible: boolean;
}

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}
```

### Media Management
```typescript
interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folder?: string;
  tags: string[];
  uploadedAt: Date;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  children: MediaFolder[];
  files: MediaFile[];
}
```

### Analytics Data
```typescript
interface AnalyticsData {
  period: DateRange;
  metrics: {
    totalViews: number;
    uniqueVisitors: number;
    conversions: number;
    revenue: number;
  };
  charts: {
    dailyViews: ChartData[];
    topProducts: ChartData[];
    categoryPerformance: ChartData[];
  };
}

interface ChartData {
  label: string;
  value: number;
  date?: Date;
}
```

## Error Handling

### Estratégia de Tratamento de Erros
1. **Validação de Formulários**: Validação em tempo real com feedback visual
2. **Erros de API**: Toast notifications com opção de retry
3. **Erros de Upload**: Progress bar com status de erro detalhado
4. **Erros de Autenticação**: Redirecionamento automático para login
5. **Erros de Permissão**: Mensagens claras sobre acesso negado

### Componente de Error Boundary
```typescript
interface ErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}
```

## Testing Strategy

### Testes Unitários
- Componentes de formulário com validação
- Utilitários de formatação e validação
- Hooks customizados para gerenciamento de estado

### Testes de Integração
- Fluxos de autenticação
- CRUD de produtos e categorias
- Upload e gerenciamento de mídia

### Testes E2E
- Login e navegação completa
- Criação e edição de produtos
- Backup e restauração

## UI/UX Design Specifications

### Paleta de Cores
```css
:root {
  /* Primary Colors */
  --admin-primary: #3B82F6;
  --admin-primary-dark: #1E40AF;
  --admin-primary-light: #DBEAFE;
  
  /* Secondary Colors */
  --admin-secondary: #6B7280;
  --admin-success: #10B981;
  --admin-warning: #F59E0B;
  --admin-error: #EF4444;
  
  /* Neutral Colors */
  --admin-gray-50: #F9FAFB;
  --admin-gray-100: #F3F4F6;
  --admin-gray-900: #111827;
  
  /* Dark Theme */
  --admin-dark-bg: #1F2937;
  --admin-dark-surface: #374151;
  --admin-dark-text: #F9FAFB;
}
```

### Typography
- **Headings**: Inter font family, weights 600-700
- **Body**: Inter font family, weight 400-500
- **Code**: JetBrains Mono, weight 400

### Spacing System
- Base unit: 4px (0.25rem)
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Component Specifications

#### Sidebar
- Width: 280px (expanded), 64px (collapsed)
- Background: White (light theme), Dark gray (dark theme)
- Shadow: Subtle right shadow
- Animation: 200ms ease-in-out transition

#### Header
- Height: 64px
- Background: White with border bottom
- Sticky positioning
- Breadcrumbs with separator icons

#### Cards
- Border radius: 8px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Padding: 24px
- Hover effect: Subtle shadow increase

#### Buttons
- Primary: Blue background, white text
- Secondary: Gray border, gray text
- Danger: Red background, white text
- Border radius: 6px
- Padding: 8px 16px (small), 12px 24px (medium)

#### Forms
- Input height: 40px
- Border radius: 6px
- Focus state: Blue border with shadow
- Error state: Red border with error message
- Label: 14px, medium weight, gray color

### Responsive Breakpoints
- Mobile: < 768px (sidebar overlay)
- Tablet: 768px - 1024px (sidebar collapsed by default)
- Desktop: > 1024px (sidebar expanded by default)

### Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast mode support
- Screen reader optimized
- Focus indicators clearly visible

### Performance Considerations
- Lazy loading for large data tables
- Virtual scrolling for media gallery
- Image optimization and lazy loading
- Code splitting por rotas
- Caching de dados com React Query