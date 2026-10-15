import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';

interface MainLayoutWithSidebarProps {
  children: React.ReactNode;
}

export const MainLayoutWithSidebar: React.FC<MainLayoutWithSidebarProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header com trigger do sidebar sempre visível */}
          <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="ml-4 font-semibold text-gray-900">Menu</h1>
          </header>
          
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};