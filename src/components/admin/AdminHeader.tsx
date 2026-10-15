import { usePendingProviders } from '@/hooks/usePendingProviders';
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, MessageCircle, Search, Moon, Sun, LogOut, User, Settings, Command, HelpCircle, Maximize, Minimize, Check, X, Truck, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePendingRentals } from '@/hooks/usePendingRentals';
import Breadcrumbs from './Breadcrumbs';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { admin } = useAdminAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useAdminNotifications();
  const navigate = useNavigate();
  const pendingRentals = usePendingRentals();
  const pendingProviders = usePendingProviders();
  const badgeCount = unreadCount + pendingRentals + pendingProviders;
  
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      
      // Escape to close search
      if (event.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Check fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleExitPanel = () => {
    setShowUserMenu(false);
    navigate('/', { replace: true });
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navegar baseado no tipo de notificação
    switch (notification.type) {
      case 'new_product_pending':
        navigate('/admin/user-products');
        break;
      case 'new_user_registered':
        navigate('/admin/users');
        break;
      case 'new_service_provider':
        navigate('/admin/service-providers');
        break;
      case 'new_rental_inquiry':
        navigate('/admin/rental-inquiries');
        break;
      default:
        break;
    }
    
    setShowNotifications(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_product_pending':
        return 'bg-blue-500';
      case 'new_user_registered':
        return 'bg-green-500';
      case 'new_service_provider':
        return 'bg-purple-500';
      case 'new_rental_inquiry':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };



  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementar lógica de busca
      console.log('Buscar por:', searchQuery);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 relative">
        <div className="flex items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button onClick={onMenuClick} aria-label="Abrir ou recolher menu" className="p-2 shrink-0"><Menu className="h-5 w-5" /></button>
            <h1 className="min-w-0 break-words text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>•</span>
              <span>{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            title="Buscar (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Buscar...</span>
            <div className="flex items-center space-x-1 ml-2">
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">K</kbd>
            </div>
          </button>

          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Buscar"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isFullscreen ? 'Sair do Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Maximize className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Help */}
          <button
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Ajuda"
          >
            <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title={pendingProviders > 0 ? `${pendingProviders} prestador(es) aguardando aprovação` : 'Mensagens e notificações'}
              aria-label={pendingProviders > 0 ? `Mensagens: ${pendingProviders} prestadores aguardando aprovação` : 'Abrir mensagens e notificações'}
              aria-expanded={showNotifications}
            >
              <MessageCircle className={`h-5 w-5 ${pendingProviders > 0 ? "text-orange-600" : "text-gray-600 dark:text-gray-300"}`} />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mensagens e aprovações</h3>
                    <div className="flex items-center gap-2">
                      {badgeCount > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                          {badgeCount} pendente{badgeCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          title="Marcar todas como lidas"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {pendingProviders > 0 && <button onClick={() => {navigate('/admin/service-providers?status=pending');setShowNotifications(false);}} className="flex w-full items-center gap-3 border-b border-orange-200 bg-orange-50 p-4 text-left hover:bg-orange-100"><User className="h-6 w-6 text-orange-600"/><div><p className="font-semibold text-orange-900">Prestadores de serviços para aprovação</p><p className="text-sm text-orange-800">{pendingProviders} {pendingProviders===1?'cadastro pendente':'cadastros pendentes'}</p></div></button>}
                  {pendingRentals > 0 && <button onClick={() => { navigate('/admin/rental-equipment'); setShowNotifications(false); }} className="flex w-full items-center gap-3 border-b border-orange-200 bg-orange-50 p-4 text-left hover:bg-orange-100">
                    <Truck className="h-6 w-6 shrink-0 text-orange-600" />
                    <div><p className="font-semibold text-orange-900">Equipamentos para alugar</p><p className="text-sm text-orange-800">{pendingRentals} {pendingRentals === 1 ? 'equipamento aguardando aprovação' : 'equipamentos aguardando aprovação'}</p></div>
                  </button>}

                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Carregando...</p>
                    </div>
                  ) : notifications.length === 0 ? (pendingProviders || pendingRentals ? null : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
                    </div>
                  )) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 ${getNotificationIcon(notification.type)} rounded-full mt-2 ${!notification.is_read ? 'animate-pulse' : ''}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                    <button
                      onClick={() => {
                        navigate('/admin/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.user_metadata?.full_name || admin?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin?.user_metadata?.full_name || admin?.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-500">{admin?.email}</p>
                      <p className="text-xs text-blue-600 capitalize font-medium">Administrador</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  {[{ label: 'Ajuda & Suporte', path: '/ajuda', icon: HelpCircle }, { label: 'Configurações', path: '/admin/settings', icon: Settings }, { label: 'Painel do Admistrador', path: '/admin/dashboard', icon: LayoutDashboard }, { label: 'Equipamentos para alugar', path: '/admin/rental-equipment', icon: Truck }, { label: 'Solicitações de aluguel', path: '/solicitacoes-aluguel', icon: Truck }, { label: 'Suas informações', path: '/profile?action=complete', icon: User }, { label: 'Meu Perfil', path: '/admin/profile', icon: User }].map(({ label, path, icon: Icon }) => (
                    <button key={path} type="button" onClick={() => { navigate(path); setShowUserMenu(false); }} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon className="h-4 w-4 mr-3 text-gray-500" />{label}
                    </button>
                  ))}
                  <hr className="my-2" />
                  <button
                    onClick={handleExitPanel}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair do Painel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Breadcrumbs */}
        <div className="mt-4">
          <Breadcrumbs />
        </div>
      </header>
      {pendingProviders > 0 && <div role="status" className="mx-3 mt-3 sm:mx-6 rounded-xl border border-orange-200 bg-orange-100/70 p-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-orange-900">{pendingProviders===1 ? 'Há 1 prestador de serviços aguardando aprovação.' : `Há ${pendingProviders} prestadores de serviços aguardando aprovação.`}</p><button type="button" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700" onClick={()=>navigate('/admin/service-providers?status=pending')}>Analisar cadastros</button></div>}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in slide-in-from-top-4 duration-200">
            <form onSubmit={handleSearch} className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos, categorias, usuários..."
                  className="flex-1 text-lg border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">ESC</kbd>
                </button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Sugestões de busca:</div>
                <div className="space-y-2">
                  <button
                    type="button"
                    className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => {
                      setSearchQuery('produtos');
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    <Command className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Buscar produtos</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => {
                      setSearchQuery('categorias');
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    <Command className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Buscar categorias</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => {
                      setSearchQuery('usuários');
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    <Command className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Buscar usuários</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;