import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff,
  UserX,
  FileText,
  Share2,
  Database,
  Download,
  Shield,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowDataCollection: false,
    shareActivityData: false
  });

  const handleToggleSetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Configuração atualizada');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETAR') {
      toast.error('Digite "DELETAR" para confirmar');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setIsDeleting(true);

    try {
      // Deletar dados relacionados ao usuário em ordem
      // 1. Deletar endereços
      await supabase.from('user_addresses').delete().eq('user_id', user.id);
      
      // 2. Deletar métodos de pagamento
      await supabase.from('user_payment_methods').delete().eq('user_id', user.id);
      
      // 3. Deletar notificações
      await supabase.from('notifications').delete().eq('user_id', user.id);
      
      // 4. Deletar produtos do usuário
      await supabase.from('products').delete().eq('user_id', user.id);
      
      // 5. Deletar push subscriptions
      await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
      
      // 6. Deletar seller stores
      await supabase.from('seller_stores').delete().eq('user_id', user.id);
      
      // 7. Deletar service providers
      await supabase.from('service_providers').delete().eq('user_id', user.id);
      
      // 8. Deletar perfil do usuário
      await supabase.from('user_profiles').delete().eq('id', user.id);
      
      // 9. Deletar roles do usuário
      await supabase.from('user_roles').delete().eq('user_id', user.id);

      // 10. Fazer logout e limpar dados locais
      await logout();
      
      // Limpar localStorage
      localStorage.clear();
      
      toast.success('Conta excluída com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao excluir conta. Entre em contato com o suporte.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setIsExporting(true);

    try {
      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: addresses } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id);

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id);

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      const { data: paymentMethods } = await supabase
        .from('user_payment_methods')
        .select('id, payment_type, card_brand, card_last_four, is_default, created_at')
        .eq('user_id', user.id);

      const exportData = {
        exportInfo: {
          platform: 'Xopy - Marketplace da Construção Civil',
          exportedAt: new Date().toISOString(),
          userId: user.id
        },
        profile: profile ? {
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          type: profile.user_type,
          createdAt: profile.created_at
        } : null,
        addresses: addresses || [],
        orders: orders || [],
        products: products || [],
        paymentMethods: paymentMethods || []
      };

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xopy-meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const privacyOptions = [
    {
      id: 'profileVisible',
      title: 'Perfil Visível',
      description: 'Permitir que outros usuários vejam seu perfil público',
      icon: Eye,
      value: privacySettings.profileVisible
    },
    {
      id: 'showOnlineStatus',
      title: 'Status Online',
      description: 'Mostrar quando você está online para outros usuários',
      icon: EyeOff,
      value: privacySettings.showOnlineStatus
    },
    {
      id: 'allowDataCollection',
      title: 'Coleta de Dados',
      description: 'Permitir coleta de dados anônimos para melhorar sua experiência',
      icon: Database,
      value: privacySettings.allowDataCollection
    },
    {
      id: 'shareActivityData',
      title: 'Personalização',
      description: 'Compartilhar dados de uso para recomendações personalizadas',
      icon: Share2,
      value: privacySettings.shareActivityData
    }
  ];

  const actionOptions = [
    {
      id: 'exportData',
      title: 'Exportar Meus Dados',
      description: 'Baixe uma cópia completa de todos os seus dados',
      icon: Download,
      action: handleExportData,
      loading: isExporting
    },
    {
      id: 'privacyPolicy',
      title: 'Política de Privacidade',
      description: 'Leia nossa política de privacidade completa',
      icon: FileText,
      action: () => navigate('/politica-de-privacidade')
    },
    {
      id: 'termsOfService',
      title: 'Termos de Serviço',
      description: 'Leia nossos termos de uso e condições',
      icon: Shield,
      action: () => navigate('/termos')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Privacidade</h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Privacy Settings */}
        <div>
          <h3 className="text-black text-lg font-bold mb-4">Configurações de Privacidade</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {privacyOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className={`p-4 ${index !== privacyOptions.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-orange-600" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-black font-semibold">{option.title}</p>
                      <p className="text-gray-500 text-sm">{option.description}</p>
                    </div>
                    
                    <Switch
                      checked={option.value}
                      onCheckedChange={() => handleToggleSetting(option.id as keyof typeof privacySettings)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Options */}
        <div>
          <h3 className="text-black text-lg font-bold mb-4">Seus Dados</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {actionOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  disabled={option.loading}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                    index !== actionOptions.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-black font-semibold">
                        {option.loading ? 'Exportando...' : option.title}
                      </p>
                      <p className="text-gray-500 text-sm">{option.description}</p>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* LGPD Info */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">🔒 Seus direitos (LGPD)</h4>
          <p className="text-orange-700 text-sm mb-2">
            De acordo com a Lei Geral de Proteção de Dados, você tem direito a:
          </p>
          <ul className="text-orange-700 text-sm space-y-1 list-disc list-inside">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir informações incorretas</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
        </div>

        {/* Delete Account Section */}
        <div>
          <h3 className="text-red-600 text-lg font-bold mb-4">Zona de Perigo</h3>
          <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full p-4 text-left hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                
                <div className="flex-1">
                  <p className="text-red-600 font-semibold">Excluir Minha Conta</p>
                  <p className="text-gray-500 text-sm">
                    Remover permanentemente sua conta e todos os dados
                  </p>
                </div>
                
                <ChevronRight className="h-5 w-5 text-red-400" />
              </div>
            </button>
          </div>
          
          <p className="text-gray-500 text-xs mt-2 px-2">
            ⚠️ Atenção: Esta ação é irreversível. Todos os seus dados, incluindo pedidos, 
            endereços, produtos anunciados e histórico serão permanentemente excluídos.
          </p>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Excluir Conta</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                Você está prestes a excluir permanentemente sua conta. Esta ação <strong className="text-red-600">NÃO pode ser desfeita</strong>.
              </p>
              <p className="font-medium">Ao excluir sua conta, você perderá:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Todos os seus dados pessoais</li>
                <li>Histórico completo de pedidos</li>
                <li>Endereços salvos</li>
                <li>Métodos de pagamento cadastrados</li>
                <li>Produtos e anúncios publicados</li>
                <li>Conversas e mensagens</li>
                <li>Avaliações recebidas e enviadas</li>
              </ul>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">
                  Para confirmar, digite <span className="text-red-600 font-bold">DELETAR</span> abaixo:
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                  placeholder="Digite DELETAR"
                  className="border-red-200 focus:border-red-500 uppercase"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting} className="flex-1">
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETAR' || isDeleting}
              className="flex-1 h-11 rounded-xl"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Conta'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrivacySettings;
