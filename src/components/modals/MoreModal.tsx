import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Heart, Package, Settings, HelpCircle, MessageSquare, Bell, MapPin, CreditCard, FileText, LogOut, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useServiceProviderAuth } from '@/hooks/useServiceProviderAuth';

interface MoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreModal: React.FC<MoreModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isServiceProvider, serviceProviderData } = useServiceProviderAuth();

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  const menuItems = [
    // Chat/Conversas - disponível sempre para usuários logados
    ...(user ? [{
      icon: MessageSquare,
      label: 'Conversas',
      path: '/conversas',
      description: isServiceProvider ? 'Suas conversas com clientes' : 'Suas conversas com prestadores'
    }] : []),
    
    // Notificações - disponível sempre para usuários logados  
    ...(user ? [{
      icon: Bell,
      label: 'Notificações',
      path: '/notificacoes',
      description: 'Gerenciar notificações'
    }] : []),

    // Status do prestador - apenas para prestadores
    ...(isServiceProvider && serviceProviderData ? [{
      icon: User,
      label: `Status: ${serviceProviderData.status === 'approved' ? 'Aprovado' : serviceProviderData.status === 'pending' ? 'Pendente' : 'Rejeitado'}`,
      path: '/service-provider-status',
      description: 'Ver seu perfil como prestador'
    }] : []),

    // Itens padrão para usuários logados
    ...(user ? [
      {
        icon: User,
        label: 'Perfil',
        path: '/profile',
        description: 'Gerenciar seus dados pessoais'
      },
      {
        icon: Megaphone,
        label: 'Meus Anúncios',
        path: '/my-listings',
        description: 'Gerenciar sua loja e produtos'
      },
      {
        icon: Heart,
        label: 'Favoritos',
        path: '/favoritos',
        description: 'Seus produtos favoritos'
      },
      {
        icon: Package,
        label: 'Pedidos',
        path: '/pedidos',
        description: 'Acompanhar seus pedidos'
      },
      {
        icon: MapPin,
        label: 'Endereços',
        path: '/enderecos',
        description: 'Gerenciar endereços de entrega'
      },
      {
        icon: CreditCard,
        label: 'Pagamentos',
        path: '/pagamentos',
        description: 'Métodos de pagamento'
      }
    ] : []),
    
    // Itens sempre disponíveis
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes',
      description: 'Preferências do app'
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      path: '/ajuda',
      description: 'Central de ajuda e suporte'
    },
    {
      icon: FileText,
      label: 'Termos de Uso',
      path: '/termos',
      description: 'Termos e políticas'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-black">{user.email}</p>
                {isServiceProvider && serviceProviderData && (
                  <p className="text-sm text-orange-600 capitalize">
                    {serviceProviderData.category} • {serviceProviderData.status === 'approved' ? 'Aprovado' : serviceProviderData.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-2 space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login/Logout */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigation('/auth')}
              className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoreModal;