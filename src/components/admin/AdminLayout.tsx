import React, { useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { findRouteByPath } from '@/config/adminRoutes';
import { useFavicon } from '@/hooks';
import { getAppearanceSettings } from '@/services/settingsService';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [faviconUrl, setFaviconUrl] = useState<string>('/favicon.ico');
  const location = useLocation();
  
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarCollapsed(true);
  }, [location.pathname]);

  const currentRoute = findRouteByPath(location.pathname);
  const pageTitle = title || currentRoute?.label || 'Admin';

  // Aplicar favicon das configurações de admin
  useFavicon(faviconUrl);

  // Carregar configurações de aparência
  useEffect(() => {
    const loadAppearanceSettings = async () => {
      try {
        const settings = await getAppearanceSettings();
        if (settings && settings.faviconUrl) {
          setFaviconUrl(settings.faviconUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de aparência:', error);
        // Manter favicon padrão em caso de erro
      }
    };

    loadAppearanceSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      }`}>
        {/* Header */}
        <AdminHeader 
          title={pageTitle}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Page Content */}
        <main className="flex-1 min-w-0 p-3 sm:p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AdminLayout;