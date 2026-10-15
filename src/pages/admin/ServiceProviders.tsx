import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { appConfirm } from '@/lib/feedback';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { 
  Search,
  Trash2, 
  Filter,
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  city: string;
  neighborhood: string;
  address?: string;
  experience: string;
  daily_rate: number;
  specialties?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  user_profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const ServiceProviders: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>(()=>new URLSearchParams(location.search).get('status') === 'pending' ? 'pending' : 'all');
  useEffect(()=>{if(new URLSearchParams(location.search).get('status')==='pending')setStatusFilter('pending');},[location.search]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [rejectionProvider,setRejectionProvider]=useState<ServiceProvider|null>(null);
  const [rejectionReason,setRejectionReason]=useState('');
  const openRejection=(provider:ServiceProvider)=>{if(actionLoading)return;setShowDetailModal(false);setRejectionProvider(provider);setRejectionReason('');};

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, statusFilter, categoryFilter]);

  const loadProviders = async () => {
    try {
      setLoading(true);setLoadError('');
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setLoadError(error.message || 'Não foi possível carregar os prestadores.');
        console.error('Erro ao carregar prestadores:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar prestadores de serviços",
          variant: "destructive"
        });
        return;
      }

      setProviders((Array.isArray(data) ? data : []).map((p: any) => ({
        ...p, name: String(p.name || ''), email: String(p.email || ''), category: String(p.category || ''),
        city: String(p.city || ''), neighborhood: String(p.neighborhood || ''), experience: String(p.experience || ''),
        daily_rate: Number(p.daily_rate) || 0,
        specialties: Array.isArray(p.specialties) ? p.specialties.join(', ') : String(p.specialties || ''),
        status: ['pending','approved','rejected'].includes(p.status) ? p.status : 'pending'
      })));
    } catch (error) {
      setLoadError('Não foi possível carregar os prestadores. Tente novamente.');
      console.error('Erro no loadProviders:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.status === statusFilter);
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(provider => provider.category === categoryFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.user_profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  const updateProviderStatus = async (providerId: string, newStatus: 'approved' | 'rejected', reason='') => {
    if(actionLoading) return;
    if(newStatus==='rejected' && !reason.trim()){toast({title:'Motivo obrigatório',description:'Informe o motivo da rejeição.',variant:'destructive'});return;}
    try {
      setActionLoading(providerId);
      
      const { data: saved, error } = await supabase
        .from('service_providers')
        .update({ 
          status: newStatus,
          ...(newStatus==='rejected'?{rejection_reason:reason.trim()}:{rejection_reason:null}),
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId).select('*').single();

      if (error || !saved) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do prestador",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: newStatus, rejection_reason:newStatus==='rejected'?reason.trim():undefined, updated_at: new Date().toISOString() }
          : provider
      ));

      const statusText = newStatus === 'approved' ? 'aprovado' : 'rejeitado';
      toast({
        title: "Sucesso",
        description: `Prestador ${statusText} com sucesso!`,
      });

      setShowDetailModal(false);setRejectionProvider(null);setRejectionReason('');
      window.dispatchEvent(new Event('contentUpdated'));
    } catch (error) {
      console.error('Erro no updateProviderStatus:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRejectedProvider = async (provider: ServiceProvider) => {
    if(actionLoading || provider.status !== 'rejected') return;
    const confirmed = await appConfirm(`Excluir o cadastro de prestador de ${provider.name || provider.email}? Essa ação não pode ser desfeita. A conta de acesso será mantida.`);
    if(!confirmed) return;
    setActionLoading(provider.id);
    try {
      const result = await supabase.from('service_providers').delete().eq('id',provider.id).eq('status','rejected').select('*').single();
      if(result.error || !result.data) throw new Error(result.error?.message || 'O cadastro não está mais rejeitado. Atualize a lista.');
      setProviders(previous=>previous.filter(item=>item.id!==provider.id));
      setShowDetailModal(false);setSelectedProvider(null);
      window.dispatchEvent(new Event('contentUpdated'));
      toast({title:'Sucesso',description:'Cadastro de prestador excluído com sucesso!'});
    } catch(error) {
      toast({title:'Erro',description:error instanceof Error?error.message:'Não foi possível excluir o prestador.',variant:'destructive'});
    } finally {setActionLoading(null);}
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || 'Pendente';
  };

  const categories = [...new Set(providers.map(p => p.category))].filter(Boolean);
  const pendingCount = providers.filter(p => p.status === 'pending').length;
  const approvedCount = providers.filter(p => p.status === 'approved').length;
  const rejectedCount = providers.filter(p => p.status === 'rejected').length;

  if (loading) {
    return (
      <AdminLayout title="Prestadores de Serviços">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prestadores de Serviços">
      <div className="space-y-6">
        {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><p>{loadError}</p><button type="button" className="mt-2 underline font-semibold" onClick={loadProviders}>Tentar novamente</button></div>}

        {/* Header com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{providers.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar prestadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button
              onClick={loadProviders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Lista de prestadores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prestador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">Nenhum prestador encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros de busca</p>
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {provider.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {provider.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {provider.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {provider.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {provider.city} - {provider.neighborhood}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                          {getStatusIcon(provider.status)}
                          <span className="ml-1">{getStatusLabel(provider.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(provider.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProvider(provider);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {provider.status === 'rejected' && <button type="button" onClick={()=>deleteRejectedProvider(provider)} disabled={Boolean(actionLoading)} title="Excluir prestador rejeitado" aria-label={`Excluir prestador ${provider.name}`} className="text-red-600 hover:text-red-800 disabled:opacity-50"><Trash2 className="h-4 w-4"/></button>}
                          {provider.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateProviderStatus(provider.id, 'approved')}
                                disabled={actionLoading === provider.id}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                title="Aprovar"
                              >
                                {actionLoading === provider.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => openRejection(provider)}
                                disabled={actionLoading === provider.id}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                title="Rejeitar"
                              >
                                {actionLoading === provider.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      {showDetailModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do Prestador
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.email}</p>
                  </div>
                  
                  {selectedProvider.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Telefone
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.category}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Experiência
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.experience}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor Diário
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      R$ {selectedProvider.daily_rate.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                
                {/* Localização */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Localização
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedProvider.city} - {selectedProvider.neighborhood}
                    {selectedProvider.address && `, ${selectedProvider.address}`}
                  </p>
                </div>
                
                {/* Especialidades */}
                {selectedProvider.specialties && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Especialidades
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.specialties}</p>
                  </div>
                )}
                
                {/* Descrição */}
                {selectedProvider.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProvider.description}</p>
                  </div>
                )}
                
                {/* Status atual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status Atual
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProvider.status)}`}>
                    {getStatusIcon(selectedProvider.status)}
                    <span className="ml-1">{getStatusLabel(selectedProvider.status)}</span>
                  </span>
                </div>
                
                {selectedProvider.status==='rejected' && selectedProvider.rejection_reason && <div className="rounded-lg bg-red-50 p-3 text-red-800"><p className="font-semibold text-sm">Motivo da rejeição</p><p className="text-sm whitespace-pre-wrap break-words">{selectedProvider.rejection_reason}</p></div>}
                {/* Ações */}
                {selectedProvider.status === 'rejected' && <div className="pt-4 border-t"><button type="button" onClick={()=>deleteRejectedProvider(selectedProvider)} disabled={Boolean(actionLoading)} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4"/>{actionLoading===selectedProvider.id?'Excluindo...':'Excluir prestador rejeitado'}</button></div>}
                {selectedProvider.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => updateProviderStatus(selectedProvider.id, 'approved')}
                      disabled={actionLoading === selectedProvider.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {actionLoading === selectedProvider.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Aprovar
                    </button>
                    
                    <button
                      onClick={() => openRejection(selectedProvider)}
                      disabled={actionLoading === selectedProvider.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {actionLoading === selectedProvider.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Dialog open={Boolean(rejectionProvider)} onOpenChange={open=>{if(!open && !actionLoading)setRejectionProvider(null);}}>
        <DialogContent className="max-w-lg" onEscapeKeyDown={event=>{if(actionLoading)event.preventDefault();}} onPointerDownOutside={event=>{if(actionLoading)event.preventDefault();}}><DialogHeader><DialogTitle>Rejeitar prestador de serviço</DialogTitle><DialogDescription>Informe o motivo da rejeição de {rejectionProvider?.name || 'este cadastro'}.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={event=>{event.preventDefault();if(rejectionProvider)void updateProviderStatus(rejectionProvider.id,'rejected',rejectionReason);}}>
            <label htmlFor="provider-rejection-reason" className="block text-sm font-medium">Motivo da rejeição *</label>
            <textarea id="provider-rejection-reason" required autoFocus maxLength={2000} rows={4} disabled={Boolean(actionLoading)} value={rejectionReason} onChange={event=>setRejectionReason(event.target.value)} className="w-full rounded-lg border p-3 bg-transparent" placeholder="Explique por que o cadastro está sendo rejeitado"/>
            <div className="flex justify-end gap-3"><button type="button" disabled={Boolean(actionLoading)} onClick={()=>setRejectionProvider(null)} className="rounded-lg border px-4 py-2">Cancelar</button><button type="submit" disabled={Boolean(actionLoading)||!rejectionReason.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">{actionLoading?'Salvando...':'Confirmar rejeição'}</button></div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ServiceProviders;