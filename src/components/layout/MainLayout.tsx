import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingCart } from "lucide-react";
import { Header } from "@/components/header";
import BottomNavigation from "./BottomNavigation";
import { MoreModal } from "@/components/modals";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useCart } from "@/hooks";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";
interface MainLayoutProps {
  children: ReactNode;
  showMobileSearch?: boolean;
  onMobileSearch?: (query: string) => void;
}

const MainLayout = ({ children, showMobileSearch = false, onMobileSearch }: MainLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { cartItemCount } = useCart();
  const { permission, requestPermission } = usePushNotifications();
  // Debug completo
  console.log('🔍🔍🔍 MainLayout Debug 🔍🔍🔍');
  console.log('showMobileSearch prop:', showMobileSearch);
  console.log('isMobile hook:', isMobile);
  console.log('window.innerWidth:', window.innerWidth);
  console.log('================================');

  const handleSearchClick = () => {
    // TODO: Implement mobile search modal
    console.log("Search clicked");
  };

  const handleMenuClick = () => {
    // Navegar para o perfil do usuário
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  const handleClipsClick = () => {
    navigate('/clips');
  };

  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

  const handleMoreClick = () => {
    setIsMoreModalOpen(true);
  };

  // Layout mobile/tablet (current layout with bottom nav)
  if (isMobile || window.innerWidth < 1024) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartItemCount={cartItemCount}
          onSearchClick={handleSearchClick}
          onSearch={onMobileSearch}
          onMenuClick={handleMenuClick}
          onCartClick={handleCartClick}
        />

        <PushNotificationBanner
          permission={permission}
          onRequestPermission={requestPermission}
        />

        <main className="pb-20 px-2 pt-[104px] sm:pt-[64px]">
          {children}
        </main>

        <BottomNavigation
          cartItemCount={cartItemCount}
          onHomeClick={handleHomeClick}
          onFavoritesClick={handleFavoritesClick}
          onCartClick={handleCartClick}
          onClipsClick={handleClipsClick}
          onMoreClick={handleMoreClick}
        />

        <MoreModal
          isOpen={isMoreModalOpen}
          onClose={() => setIsMoreModalOpen(false)}
        />
      </div>
    );
  }

  // Layout desktop (new layout with sidebar)
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 min-w-0 flex flex-col w-full">
          <header className="h-16 border-b bg-orange-600 flex items-center px-4 gap-4 sticky top-0 z-50">
            <SidebarTrigger className="text-white" />

            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Buscar produtos, serviços..."
                className="w-full py-2 px-4 rounded-full bg-white/20 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:bg-white/30 focus:border-white/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      // Lista de categorias de prestadores de serviços
                      const serviceProviderCategories = [
                        'pedreiro',
                        'pintor',
                        'eletricista',
                        'encanador',
                        'engenheiro',
                        'arquiteto',
                        'marceneiro'
                      ];

                      // Verificar se o termo de busca corresponde a alguma categoria de prestador
                      const normalizedQuery = value.toLowerCase();
                      const matchedCategory = serviceProviderCategories.find(
                        category => category === normalizedQuery
                      );

                      if (matchedCategory) {
                        // Redirecionar para página de prestadores com a categoria específica
                        navigate(`/servicos/${matchedCategory}`);
                      } else if (onMobileSearch) {
                        // Navegar para página de resultados
                        onMobileSearch(value);
                      }
                    }
                  }
                }}
              />
            </div>

            <button
              className="relative p-2 hover:bg-orange-700 rounded-full transition-colors"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-6 w-6 text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </header>

          <PushNotificationBanner
            permission={permission}
            onRequestPermission={requestPermission}
          />

          <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;