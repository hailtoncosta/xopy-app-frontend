import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Heart, CreditCard, MapPin, Plus, Calendar, Bell, Settings, HelpCircle, LogOut, Globe, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const options = [
  { title: 'Suas informações', url: '/profile?action=complete', icon: User },
  { title: 'Solicitações de aluguel', url: '/solicitacoes-aluguel', icon: Calendar },
  { title: 'Meu Perfil', url: '/profile', icon: User },
  { title: 'Meus Pedidos', url: '/pedidos', icon: Truck },
  { title: 'Lista de Desejos', url: '/favoritos', icon: Heart },
  { title: 'Receber vendas', url: '/pagamentos', icon: CreditCard },
  { title: 'Endereços', url: '/enderecos', icon: MapPin },
  { title: 'Vender Produto', url: '/profile?action=sell', icon: Plus },
  { title: 'Alugar Equipamento', url: '/profile?action=rent', icon: Calendar },
  { title: 'Notificações', url: '/notificacoes', icon: Bell },
  { title: 'Alterar senha', url: '/change-password', icon: Settings },
  { title: 'Central de Ajuda', url: '/ajuda', icon: HelpCircle },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function ProfileDropdown({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return null;
  const menuOptions = user?.type === 'admin'
    ? [{ title: 'Meu Perfil', url: '/admin/profile', icon: User }, { title: 'Painel do Admistrador', url: '/admin/dashboard', icon: LayoutDashboard }, { title: 'Equipamentos para alugar', url: '/admin/rental-equipment', icon: Truck }, ...options.filter(option => option.title !== 'Meu Perfil')].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
    : options;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="profile-dropdown w-72 max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border-white/40 bg-orange-600/85 p-2 text-white shadow-[0_16px_48px_rgba(154,52,18,0.25)] backdrop-blur-xl">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30"><User className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="text-base font-semibold tracking-tight">{user?.type === 'admin' ? 'Administrador' : 'Meu Perfil'}</p><p className="mt-0.5 truncate text-xs font-normal text-white/85">{user?.name || 'Sua conta no Xopy'}</p></div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-2 bg-white/25" />
        {menuOptions.map(({ title, url, icon: Icon }) => (
          <DropdownMenuItem key={title} onSelect={() => navigate(url)} className="my-0.5 gap-3 rounded-xl px-3 py-2 text-white cursor-pointer focus:bg-white/20 focus:text-white">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15"><Icon className="h-4 w-4" /></span><span className="flex-1 font-medium">{title}</span><ChevronRight className="h-3.5 w-3.5 text-white/65" />
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem disabled className="my-1 gap-3 rounded-xl px-3 py-2 text-white data-[disabled]:opacity-75"><Globe className="h-4 w-4" />Idioma: Português</DropdownMenuItem>
        {isAuthenticated && <><DropdownMenuSeparator className="mx-2 bg-white/25" /><DropdownMenuItem className="my-1 gap-3 rounded-xl px-3 py-2.5 text-white cursor-pointer focus:bg-red-950/25 focus:text-white" onSelect={() => { logout(); navigate('/'); }}><LogOut className="h-4 w-4" />Sair da Conta</DropdownMenuItem></>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
