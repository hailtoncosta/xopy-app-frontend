import { LucideIcon, LayoutDashboard, Package, FolderTree, FileText, Image, Megaphone, BarChart3, Settings, Database, Users, ShoppingCart, Edit3, Briefcase, Grid3X3, Store, Truck, CreditCard } from 'lucide-react';

export interface AdminRoute {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  children?: AdminRoute[];
  permission?: {
    resource: string;
    action: string;
  };
}

const adminRoutesBase: AdminRoute[] = [
  {
    id: 'dashboard',
    path: '/admin/dashboard',
    label: 'Painel do Admistrador',
    icon: LayoutDashboard,
    permission: { resource: 'dashboard', action: 'read' }
  },
  {
    id: 'products',
    path: '/admin/products',
    label: 'Produtos',
    icon: Package,
    permission: { resource: 'products', action: 'read' },
    children: [
      {
        id: 'products-list',
        path: '/admin/products',
        label: 'Lista de Produtos',
        icon: Package,
        permission: { resource: 'products', action: 'read' }
      },
      {
        id: 'products-add',
        path: '/admin/products/add',
        label: 'Adicionar Produto',
        icon: Package,
        permission: { resource: 'products', action: 'create' }
      }
    ]
  },
  {
    id: 'categories',
    path: '/admin/categories',
    label: 'Categorias',
    icon: FolderTree,
    permission: { resource: 'categories', action: 'read' }
  },
  {
    id: 'content',
    path: '/admin/content',
    label: 'Conteúdo',
    icon: FileText,
    permission: { resource: 'content', action: 'read' },
    children: [
        {
          id: 'content-management',
          path: '/admin/content-management',
          label: 'Gerenciar Conteúdo',
          icon: Edit3,
          permission: { resource: 'content', action: 'read' }
        },
      {
        id: 'content-pages',
        path: '/admin/content/pages',
        label: 'Páginas',
        icon: FileText,
        permission: { resource: 'content', action: 'read' }
      },
      {
        id: 'content-texts',
        path: '/admin/content/texts',
        label: 'Textos e Labels',
        icon: FileText,
        permission: { resource: 'content', action: 'read' }
      },
      {
        id: 'content-seo',
        path: '/admin/content/seo',
        label: 'SEO',
        icon: FileText,
        permission: { resource: 'content', action: 'read' }
      }
    ]
  },
  {
    id: 'media',
    path: '/admin/media',
    label: 'Mídia',
    icon: Image,
    permission: { resource: 'media', action: 'read' }
  },
  {
    id: 'section-manager',
    path: '/admin/section-manager',
    label: 'Gerenciar Seções',
    icon: Grid3X3,
    permission: { resource: 'content', action: 'read' }
  },
  {
    id: 'orders',
    path: '/admin/orders',
    label: 'Pedidos',
    icon: ShoppingCart,
    permission: { resource: 'orders', action: 'read' }
  },
  {
    id: 'users',
    path: '/admin/users',
    label: 'Gerenciamento de Usuários',
    icon: Users,
    permission: { resource: 'users', action: 'read' }
  },
  {
    id: 'user-products',
    path: '/admin/user-products',
    label: 'Produtos de Usuários',
    icon: Package,
    permission: { resource: 'products', action: 'read' }
  },
  {
    id: 'service-providers',
    path: '/admin/service-providers',
    label: 'Prestadores de Serviços',
    icon: Briefcase,
    permission: { resource: 'service-providers', action: 'read' }
  },
  {
    id: 'rental-equipment',
    path: '/admin/rental-equipment',
    label: 'Equipamentos para alugar',
    icon: Truck,
    permission: { resource: 'rentals', action: 'read' }
  },
  {
    id: 'rental-inquiries',
    path: '/admin/rental-inquiries',
    label: 'Consultas de Locação',
    icon: Briefcase,
    permission: { resource: 'rentals', action: 'read' }
  },
  {
    id: 'seller-profiles',
    path: '/admin/seller-profiles',
    label: 'Perfis de Vendedores',
    icon: Store,
    permission: { resource: 'users', action: 'read' }
  },
  {
    id: 'rental-companies',
    path: '/admin/rental-companies',
    label: 'Empresas de Locação',
    icon: Truck,
    permission: { resource: 'rentals', action: 'read' }
  },
  {
    id: 'analytics',
    path: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    permission: { resource: 'analytics', action: 'read' }
  },
  {
    id: 'settings',
    path: '/admin/settings',
    label: 'Configurações',
    icon: Settings,
    permission: { resource: 'settings', action: 'read' },
    children: [
      {
        id: 'settings-general',
        path: '/admin/settings',
        label: 'Configurações Gerais',
        icon: Settings,
        permission: { resource: 'settings', action: 'read' }
      },
      {
        id: 'settings-payment',
        path: '/admin/settings/payment',
        label: 'Pagamentos',
        icon: CreditCard,
        permission: { resource: 'settings', action: 'read' }
      },
      {
        id: 'platform-settings',
        path: '/admin/platform-settings',
        label: 'Configurações da Plataforma',
        icon: Settings,
        permission: { resource: 'settings', action: 'read' }
      }
    ]
  },
  {
    id: 'backup',
    path: '/admin/backup',
    label: 'Backup',
    icon: Database,
    permission: { resource: 'backup', action: 'read' }
  }
];

const sortAdminRoutes = (routes: AdminRoute[]): AdminRoute[] => routes
  .map(route => ({ ...route, ...(route.children ? { children: sortAdminRoutes(route.children) } : {}) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));

export const adminRoutes = sortAdminRoutes(adminRoutesBase);

export const findRouteByPath = (path: string): AdminRoute | undefined => {
  const findInRoutes = (routes: AdminRoute[]): AdminRoute | undefined => {
    for (const route of routes) {
      if (route.path === path) {
        return route;
      }
      if (route.children) {
        const found = findInRoutes(route.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findInRoutes(adminRoutes);
};

export const generateBreadcrumbs = (path: string): { label: string; href?: string }[] => {
  const route = findRouteByPath(path);
  if (!route) return [];

  const breadcrumbs: { label: string; href?: string }[] = [];
  
  // Adicionar breadcrumb do dashboard
  if (path !== '/admin/dashboard') {
    breadcrumbs.push({ label: 'Painel do Admistrador', href: '/admin/dashboard' });
  }
  
  // Encontrar rota pai se existir
  const findParent = (routes: AdminRoute[], targetPath: string): AdminRoute | undefined => {
    for (const route of routes) {
      if (route.children) {
        const child = route.children.find(child => child.path === targetPath);
        if (child) return route;
        
        const found = findParent(route.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };

  const parent = findParent(adminRoutes, path);
  if (parent) {
    breadcrumbs.push({ label: parent.label, href: parent.path });
  }
  
  // Adicionar rota atual
  if (route) {
    breadcrumbs.push({ label: route.label });
  }
  
  return breadcrumbs;
};