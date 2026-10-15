import xopyLogo from "@/assets/xopy-logo.png";
import { useAuth } from '@/hooks/useAuth';
import { ProfileDropdown } from './ProfileDropdown';
import { Home, Heart, ShoppingCart, Play, User, Package, Settings, Search, ChevronDown, LogIn } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Buscar", url: "/busca", icon: Search },
  { title: "Favoritos", url: "/favorites", icon: Heart },
  { title: "Carrinho", url: "/cart", icon: ShoppingCart },
  { title: "Clips", url: "/clips", icon: Play },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { isAuthenticated, user } = useAuth();
  const accountLabel = user?.name || 'Meu Perfil';
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getNavCls = (active: boolean) =>
    active
      ? "bg-orange-100 text-orange-600 font-medium hover:bg-orange-200"
      : "hover:bg-gray-100";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b">
          <img src={xopyLogo} alt="Xopy" className={`object-contain rounded-lg bg-white ${open ? 'h-12 w-36' : 'h-8 w-8'}`} />
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {isAuthenticated ? <ProfileDropdown>
                  <SidebarMenuButton tooltip={accountLabel}>
                    <User className="h-4 w-4" /><span>{accountLabel}</span><ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </ProfileDropdown> : (
                  <SidebarMenuButton asChild tooltip="Entrar">
                    <NavLink to="/auth"><LogIn className="h-4 w-4" /><span>Entrar</span></NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
