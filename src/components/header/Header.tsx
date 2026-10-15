import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import ChatNotifications from '@/components/chat/ChatNotifications';
import { NotificationBell } from '@/components/NotificationBell';
import { Menu, User, ChevronDown, ShoppingCart, ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";
interface HeaderProps {
  cartItemCount?: number;
  onSearchClick?: () => void;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  onMoreClick?: () => void;
}
const Header = ({
  cartItemCount = 0,
  onSearchClick,
  onSearch,
  onMenuClick,
  onCartClick,
  showBackButton = false,
  onBackClick,
  title,
  onMoreClick
}: HeaderProps) => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user } = useAuth();
  const accountLabel = user?.name || 'Meu Perfil';
  const navigate = useNavigate();
  if (showBackButton && title) {
    return <header className="fixed top-0 left-0 right-0 w-full z-50 bg-orange-600 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBackClick} className="p-2 hover:bg-orange-700 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          
          <h1 className="text-white text-lg font-semibold">{title}</h1>
          
          <button className="p-2 hover:bg-orange-700 rounded-full transition-colors" onClick={onMoreClick}>
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </header>;
  }
  return <header className="fixed top-0 left-0 right-0 w-full z-50 bg-orange-600 shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-1.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        <Logo />
        <SearchBar onSearch={onSearch} className="order-last sm:order-none basis-full sm:basis-auto sm:flex-1 min-w-0" />
        <div className="flex items-center space-x-2">
            
            <ChatNotifications />
            
            <button className="relative p-2 hover:bg-orange-700 rounded-full transition-colors" onClick={onCartClick}>
              <ShoppingCart className="h-6 w-6 text-white" />
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>}
            </button>
            
            {isAuthenticated ? <ProfileDropdown>
              <button aria-label={accountLabel} className="flex items-center gap-1 p-2 hover:bg-orange-700 rounded-full transition-colors text-white">
                <User className="h-6 w-6" /><span className="inline max-w-[100px] sm:max-w-[180px] truncate text-sm">{accountLabel}</span><ChevronDown className="h-4 w-4" />
              </button>
            </ProfileDropdown> : (
              <button type="button" aria-label="Entrar" onClick={() => navigate('/auth')} className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-white transition-colors hover:bg-white/25">
                <LogIn className="h-5 w-5" aria-hidden="true" /><span className="text-sm font-medium">Entrar</span>
              </button>
            )}
          </div>
      </div>
    </header>;
};
export default Header;