import xopyLogo from "@/assets/xopy-logo.png";
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Minimize2, Maximize2 } from 'lucide-react';
import { adminRoutes, AdminRoute } from '@/config/adminRoutes';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();

  // Auto-expand parent items when child is active
  useEffect(() => {
    const currentRoute = adminRoutes.find(route => {
      if (route.path === location.pathname) return true;
      return route.children?.some(child => child.path === location.pathname);
    });

    if (currentRoute && currentRoute.children) {
      const hasActiveChild = currentRoute.children.some(child => child.path === location.pathname);
      if (hasActiveChild && !expandedItems.includes(currentRoute.id)) {
        setExpandedItems(prev => [...prev, currentRoute.id]);
      }
    }
  }, [location.pathname, expandedItems]);

  const toggleExpanded = (routeId: string) => {
    setExpandedItems(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const isRouteActive = (route: AdminRoute): boolean => {
    if (route.path === location.pathname) return true;
    if (route.children) {
      return route.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  const hasRoutePermission = (route: AdminRoute): boolean => {
    // Admins have access to all routes
    return true;
  };

  const renderNavItem = (route: AdminRoute, level = 0) => {
    if (!hasRoutePermission(route)) return null;

    const isActive = isRouteActive(route);
    const isExpanded = expandedItems.includes(route.id);
    const hasChildren = route.children && route.children.length > 0;
    const isHovered = hoveredItem === route.id;
    const Icon = route.icon;

    return (
      <div key={route.id} className="relative">
        <div 
          className={`
            flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group
            ${level > 0 ? 'ml-6' : ''}
            ${isActive 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
            }
            ${isHovered && !isActive ? 'bg-gray-100 dark:bg-gray-600 transform scale-[1.02]' : ''}
          `}
          onMouseEnter={() => setHoveredItem(route.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {hasChildren ? (
            <button
              onClick={() => {if(isCollapsed){onToggle();setExpandedItems(previous=>previous.includes(route.id)?previous:[...previous,route.id]);}else toggleExpanded(route.id);}}
              className="flex items-center w-full text-left"
            >
              <Icon className={`h-5 w-5 transition-all duration-200 ${
                isCollapsed ? 'mx-auto' : 'mr-3'
              } ${isActive ? 'text-white' : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium text-sm">{route.label}</span>
                  {route.badge && (
                    <span className={`text-xs rounded-full px-2 py-1 ml-2 font-medium ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {route.badge}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`} />
                  ) : (
                    <ChevronRight className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`} />
                  )}
                </>
              )}
            </button>
          ) : (
            <Link to={route.path} className="flex items-center w-full">
              <Icon className={`h-5 w-5 transition-all duration-200 ${
                isCollapsed ? 'mx-auto' : 'mr-3'
              } ${isActive ? 'text-white' : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium text-sm">{route.label}</span>
                  {route.badge && (
                    <span className={`text-xs rounded-full px-2 py-1 ml-2 font-medium ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {route.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {route.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && isHovered && (
          <div className="absolute left-16 top-0 bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium z-50 whitespace-nowrap shadow-lg">
            {route.label}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`
        fixed left-0 top-0 h-dvh flex flex-col overflow-hidden bg-white dark:bg-gray-800 shadow-lg z-30 transition-all duration-200
        ${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          {!isCollapsed && (
            <div className="min-w-0">
              <img src={xopyLogo} alt="Xopy" className="h-12 w-36 object-contain rounded-lg bg-white" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Painel do Administrador</p>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? (
              <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600" />
            ) : (
              <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto overscroll-contain pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {adminRoutes.map(route => renderNavItem(route))}
          
          {/* Footer info when collapsed */}
          {isCollapsed && (
            <div className="fixed bottom-4 left-4">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">v1.0</span>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`
        fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity
        ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `} onClick={onToggle} />
    </>
  );
};

export default AdminSidebar;