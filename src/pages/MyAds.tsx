import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar, Package, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { MoreModal } from '@/components/modals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  product_type: string; // Changed from 'new' | 'leftover' to string for more flexibility
  approval_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'sold' | 'inactive';
  created_at: string;
  images: string[];
  admin_comments?: string;
}

const MyAds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filter, setFilter] = useState<'todos' | 'aprovados' | 'pendentes' | 'rejeitados'>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserAds();
    }
  }, [user]);

  const loadUserAds = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar anúncios:', error);
        toast.error('Erro ao carregar seus anúncios');
        return;
      }

      const formattedAds: Ad[] = data.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        product_type: product.product_type,
        approval_status: (product.approval_status || 'pending') as 'pending' | 'approved' | 'rejected',
        status: product.status as 'active' | 'sold' | 'inactive',
        created_at: product.created_at,
        images: product.images || [],
        admin_comments: product.admin_comments
      }));

      setAds(formattedAds);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      toast.error('Erro ao carregar seus anúncios');
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular se não há dados reais, usar mock
  useEffect(() => {
    if (!user && !loading) {
      // Mock data para usuários não logados
      const mockAds: Ad[] = [
        {
          id: '1',
          title: 'Furadeira Bosch Profissional',
          description: 'Furadeira de impacto em excelente estado, ideal para obras.',
          price: 150,
          category: 'Ferramentas',
          product_type: 'new' as const,
          approval_status: 'approved' as const,
          status: 'active' as const,
          created_at: '2024-01-15T00:00:00Z',
          images: ['/placeholder.svg']
        }
      ];
      setAds(mockAds);
      setLoading(false);
    }
  }, [user, loading]);

  const filteredAds = ads.filter(ad => {
    if (filter === 'aprovados') return ad.approval_status === 'approved';
    if (filter === 'pendentes') return ad.approval_status === 'pending';
    if (filter === 'rejeitados') return ad.approval_status === 'rejected';
    return true;
  });

  const handleEditAd = (adId: string) => {
    toast.info('Funcionalidade de edição será implementada em breve');
  };

  const handleDeleteAd = async (adId: string) => {
    if (!(await appConfirm('Tem certeza que deseja excluir este anúncio?'))) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', adId)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Erro ao excluir anúncio');
        return;
      }

      setAds(prev => prev.filter(ad => ad.id !== adId));
      toast.success('Anúncio excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir anúncio');
    }
  };

  const handleToggleStatus = async (adId: string) => {
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;

    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', adId)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Erro ao alterar status');
        return;
      }

      setAds(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, status: newStatus } : ad
      ));
      
      toast.success(`Anúncio ${newStatus === 'active' ? 'ativado' : 'desativado'}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (approval_status: string) => {
    switch (approval_status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (approval_status: string) => {
    switch (approval_status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (approval_status: string) => {
    switch (approval_status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Aguardando';
      case 'rejected': return 'Rejeitado';
      default: return 'Indefinido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onMoreClick={() => setIsMoreModalOpen(true)}
          showBackButton={true}
          onBackClick={() => navigate('/')}
          title="Meus Anúncios"
        />
        <div className="pt-[104px] sm:pt-16 pb-20 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando anúncios...</p>
            </div>
          </div>
        </div>
        <BottomNavigation 
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favorites')}
        onCartClick={() => navigate('/cart')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => setIsMoreModalOpen(true)}
      />
        <MoreModal 
          isOpen={isMoreModalOpen} 
          onClose={() => setIsMoreModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMoreClick={() => setIsMoreModalOpen(true)}
        showBackButton={true}
        onBackClick={() => navigate('/')}
        title="Meus Anúncios"
      />
      
      <div className="pt-[104px] sm:pt-16 pb-20">
        {/* Filtros */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'aprovados', label: 'Aprovados' },
                { key: 'pendentes', label: 'Aguardando' },
                { key: 'rejeitados', label: 'Rejeitados' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Anúncios */}
        <div className="px-4 py-4">
          {filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'todos' ? 'Nenhum anúncio encontrado' : 
                 filter === 'aprovados' ? 'Nenhum anúncio aprovado' : 
                 filter === 'pendentes' ? 'Nenhum anúncio aguardando aprovação' :
                 'Nenhum anúncio rejeitado'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'todos' ? 'Você ainda não criou nenhum anúncio.' : 
                 filter === 'aprovados' ? 'Você não possui anúncios aprovados no momento.' : 
                 filter === 'pendentes' ? 'Nenhum anúncio aguardando aprovação.' :
                 'Você não possui anúncios rejeitados.'}
              </p>
              {!user ? (
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Fazer Login
                </button>
              ) : (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openSellModal'))}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Criar Anúncio
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAds.map((ad) => {                
                return (
                  <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Package className="h-5 w-5 text-orange-600" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ad.approval_status)}`}>
                            {getStatusIcon(ad.approval_status)}
                            {getStatusText(ad.approval_status)}
                          </span>
                          {ad.product_type === 'leftover' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Sobra
                            </span>
                          )}
                        </div>
                        
                        {/* Ações */}
                        <div className="flex items-center space-x-2">
                          {ad.approval_status === 'approved' && (
                            <button
                              onClick={() => handleToggleStatus(ad.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                              title={ad.status === 'active' ? 'Desativar' : 'Ativar'}
                            >
                              {ad.status === 'active' ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAd(ad.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                            disabled={ad.approval_status === 'pending'}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Conteúdo do Anúncio */}
                      <div className="flex space-x-3">
                        <img 
                          src={ad.images[0] || '/placeholder.svg'} 
                          alt={ad.title}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{ad.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ad.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Categoria: {ad.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-orange-600">
                              R$ {ad.price.toFixed(2)}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(ad.created_at)}
                            </div>
                          </div>
                          {ad.admin_comments && ad.approval_status === 'rejected' && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              <strong>Motivo da rejeição:</strong> {ad.admin_comments}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botão Flutuante para Criar Anúncio */}
        {user && filteredAds.length > 0 && (
          <div className="fixed bottom-24 right-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openSellModal'))}
              className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors"
            >
              <Package className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
      <MoreModal 
        isOpen={isMoreModalOpen} 
        onClose={() => setIsMoreModalOpen(false)} 
      />
    </div>
  );
};

export default MyAds;