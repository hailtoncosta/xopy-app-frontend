import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  MessageSquare,
  Calendar,
  Trash2,
  Package,
  User,
  Building,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface UserProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  product_type: string;
  seller_type: 'individual' | 'business';
  approval_status: 'pending' | 'approved' | 'rejected';
  status: string;
  created_at: string;
  images: string[];
  admin_comments?: string;
  expires_at?: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
  seller_info: any;
}

const UserProducts: React.FC = () => {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Hook para verificar se usuário é admin
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  // Seções da página principal onde os produtos aprovados aparecerão
  const mainPageSections = [
    { value: 'destaque', label: 'Destaque', flags: { is_featured: true } },
    { value: 'pintura', label: 'Semana da pintura', flags: { product_group: 'paint' } },
    { value: 'essenciais', label: 'Essenciais da obra', flags: { is_essential: true } },
    { value: 'top_escolhas', label: 'Top escolhas pra você', flags: { is_top_choice: true } },
    { value: 'telhas', label: 'Telhas e Coberturas', flags: { product_group: 'tiles', category: 'Telhas e Coberturas' } },
    { value: 'decoracao', label: 'Vibe Decoração', flags: { product_group: 'decoration' } },
    { value: 'clips', label: 'Clips', flags: { product_group: 'clips' } },
    { value: 'eletro', label: 'Eletro', flags: { product_group: 'electro' } },
    { value: 'locacao', label: 'Locação de Equipamentos', flags: { product_group: 'rental', type: 'locação' } }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Buscar produtos sem filtro de approval_status para admins verem todos
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        console.error('Detalhes do erro:', error.message, error.details, error.hint);
        toast.error(`Erro ao carregar produtos: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('Nenhum produto encontrado');
        setProducts([]);
        return;
      }

      // Buscar informações dos usuários para os produtos
      const productsWithUserInfo = await Promise.all(
        (data || []).filter(product => product.product_type !== 'rental'
          && !product.description?.startsWith('[LOCAÇÃO]')).map(async (product) => {
          let userInfo = { full_name: 'Usuário', email: 'email@exemplo.com' };
          
          if (product.user_id) {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', product.user_id)
              .single();
            
            if (userProfile) {
              userInfo = userProfile;
            }
          }

          return {
            ...product,
            seller_type: product.seller_type as 'individual' | 'business',
            approval_status: product.approval_status as 'pending' | 'approved' | 'rejected',
            user_profiles: userInfo
          };
        })
      );

      setProducts(productsWithUserInfo);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    // Verificar se usuário é admin
    if (!isAdmin) {
      toast.error('Apenas administradores podem aprovar produtos');
      return;
    }

    console.log('🔄 Iniciando aprovação do produto:', productId);
    console.log('📝 Seção selecionada:', selectedCategory);
    console.log('🏷️ Seções disponíveis:', mainPageSections.map(s => s.value));
    
    if (!selectedCategory || selectedCategory.trim() === '') {
      console.log('❌ Nenhuma seção selecionada');
      toast.error('Selecione uma seção para o produto aparecer');
      return;
    }

    try {
      const selectedSection = mainPageSections.find(section => section.value === selectedCategory);
      console.log('🔍 Procurando seção:', selectedCategory, 'Resultado:', selectedSection);
      
      if (!selectedSection) {
        console.log('❌ Seção não encontrada. Valor procurado:', selectedCategory);
        console.log('❌ Valores válidos:', mainPageSections.map(s => s.value));
        toast.error(`Seção selecionada inválida: ${selectedCategory}`);
        return;
      }

      console.log('✅ Seção encontrada:', selectedSection);

      // Primeiro, aprovar o produto na tabela products
      console.log('📤 Atualizando status do produto para aprovado...');
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ 
          approval_status: 'approved',
          approval_date: new Date().toISOString(),
          admin_comments: adminComments || null,
          category: selectedSection.label,
          status: 'active'
        })
        .eq('id', productId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar produto:', updateError);
        throw updateError;
      }

      console.log('✅ Produto atualizado com sucesso:', updatedProduct);

      // Buscar os dados do produto aprovado
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar dados do produto:', fetchError);
        throw fetchError;
      }

      console.log('📋 Dados do produto aprovado:', productData);
      console.log('✅ Produto aprovado com UUID:', productId);
      console.log('🔗 Link do produto será: /product/' + productId);

      // NÃO criar em dynamic_products - produtos de usuários usam UUID diretamente
      // O link será /product/{UUID} que busca na tabela products
      
      console.log('✅ Produto aprovado e disponível em /product/' + productId);

      // Criar um registro de referência em dynamic_products apenas para listagem
      // mas mantendo o source_product_id para redirecionar corretamente
      const dynamicProductData = {
        name: productData.title,
        price: `R$ ${productData.price.toFixed(2).replace('.', ',')}`,
        image_url: productData.images?.[0] || '/placeholder.svg',
        description: productData.description,
        category: selectedSection.label,
        type: 'produto',
        product_group: 'home',
        rating: 0,
        is_active: true,
        is_featured: false,
        is_essential: false,
        is_top_choice: false,
        is_offer: false,
        order_index: 0,
        source_product_id: productId, // UUID do produto original
        // Aplicar as flags específicas da seção selecionada
        ...selectedSection.flags
      };

      console.log('📦 Criando referência na tabela dynamic_products:');
      console.log('   - Nome:', dynamicProductData.name);
      console.log('   - Categoria:', dynamicProductData.category);
      console.log('   - Seção selecionada:', selectedSection.value);
      console.log('   - Flags aplicadas:', selectedSection.flags);
      console.log('   - Dados finais:', dynamicProductData);

      const { data: createdDynamicProduct, error: insertError } = await supabase
        .from('dynamic_products')
        .insert([dynamicProductData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir na dynamic_products:', insertError);
        throw insertError;
      }

      console.log('✅ Produto criado na dynamic_products:', createdDynamicProduct);

      // Disparar evento para atualizar as seções da página principal
      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type: 'product', action: 'create' }
      }));

      console.log('🎉 Aprovação concluída com sucesso!');
      toast.success(`Produto aprovado e adicionado à seção "${selectedSection.label}"!`);
      
      // Fechar modal e limpar estados
      setShowModal(false);
      setAdminComments('');
      setSelectedCategory('');
      setSelectedProduct(null);
      
      // Recarregar os produtos para mostrar o novo status
      await loadProducts();
      
      // Disparar evento para atualizar home
      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type: 'product', action: 'approved' }
      }));
    } catch (error) {
      console.error('💥 Erro completo na aprovação:', error);
      toast.error('Erro ao aprovar produto e adicionar à página principal');
    }
  };

  const handleReject = async (productId: string) => {
    if (!adminComments.trim()) {
      toast.error('É obrigatório adicionar um comentário ao rejeitar um produto');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          approval_status: 'rejected',
          approval_date: new Date().toISOString(),
          admin_comments: adminComments
        })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produto rejeitado');
      loadProducts();
      setShowModal(false);
      setAdminComments('');
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      toast.error('Erro ao rejeitar produto');
    }
  };

  const handleDelete = async (productId: string) => {
    console.log('🗑️ handleDelete chamado para produto:', productId);
    
    const confirmed = (await appConfirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'));
    console.log('Confirmação do usuário:', confirmed);
    
    if (!confirmed) {
      console.log('Exclusão cancelada pelo usuário');
      return;
    }

    console.log('Prosseguindo com a exclusão...');
    
    // Fechar o modal antes de fazer a exclusão
    setShowModal(false);
    
    try {
      // Primeiro, buscar os dados do produto para pegar o título
      console.log('🔍 Buscando dados do produto...');
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('title')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.warn('⚠️ Erro ao buscar dados do produto:', fetchError);
      }

      // Buscar produtos relacionados em dynamic_products
      console.log('🔍 Verificando produtos relacionados em dynamic_products...');
      
      // Buscar por source_product_id primeiro
      const { data: dynamicProductsById, error: searchByIdError } = await supabase
        .from('dynamic_products')
        .select('id, name')
        .eq('source_product_id', productId);

      if (searchByIdError) {
        console.warn('⚠️ Erro ao buscar por source_product_id:', searchByIdError);
      }

      let dynamicProductsToDelete = dynamicProductsById || [];

      // Se não encontrou por ID e temos o título, buscar também por nome (fallback para produtos antigos)
      if (dynamicProductsToDelete.length === 0 && productData?.title) {
        console.log('🔍 Buscando produtos antigos por nome...');
        const { data: dynamicProductsByName, error: searchByNameError } = await supabase
          .from('dynamic_products')
          .select('id, name')
          .eq('name', productData.title);

        if (!searchByNameError && dynamicProductsByName) {
          dynamicProductsToDelete = [...dynamicProductsToDelete, ...dynamicProductsByName];
        }
      }

      // Se encontrou produtos relacionados, excluir todos
      if (dynamicProductsToDelete.length > 0) {
        console.log(`🗑️ Encontrados ${dynamicProductsToDelete.length} produtos para excluir de dynamic_products`);
        
        for (const dp of dynamicProductsToDelete) {
          console.log('🗑️ Excluindo produto dynamic_products:', dp.name, 'id:', dp.id);
          const { error: dynamicError } = await supabase
            .from('dynamic_products')
            .delete()
            .eq('id', dp.id);

          if (dynamicError) {
            console.error('❌ Erro ao excluir de dynamic_products:', dynamicError);
          } else {
            console.log('✅ Produto removido de dynamic_products');
          }
        }
        
        // Disparar evento para atualizar as seções
        window.dispatchEvent(new CustomEvent('contentUpdated', {
          detail: { type: 'product', action: 'delete' }
        }));
      } else {
        console.log('ℹ️ Nenhum produto relacionado encontrado em dynamic_products');
      }

      // Excluir da tabela products
      console.log('🗑️ Excluindo produto da tabela products...');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      console.log('✅ Produto excluído com sucesso de todas as tabelas');
      toast.success('Produto excluído com sucesso da página principal!');
      
      // Recarregar produtos e disparar eventos de atualização
      await loadProducts();
      
      // Disparar mais eventos para garantir atualização
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      localStorage.setItem('admin_content_updated', Date.now().toString());
      
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleSet30DayExpiration = async (productId: string) => {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const { error } = await supabase
        .from('products')
        .update({ 
          expires_at: expirationDate.toISOString(),
          admin_comments: adminComments || 'Produto definido para expirar em 30 dias'
        })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produto definido para expirar em 30 dias!');
      loadProducts();
      setShowModal(false);
      setAdminComments('');
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      toast.error('Erro ao rejeitar produto');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Indefinido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <AdminLayout title="Produtos de Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Produtos de Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie e aprove produtos para aparecerem nas seções da página principal
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por produto, categoria ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter(p => p.approval_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter(p => p.approval_status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter(p => p.approval_status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.title}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.seller_type === 'individual' ? (
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                          ) : (
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.user_profiles?.full_name || 'Sem nome'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.user_profiles?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.approval_status)}`}>
                          {getStatusText(product.approval_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setAdminComments(product.admin_comments || '');
                            // Limpar categoria se produto está pendente para forçar seleção
                            setSelectedCategory(product.approval_status === 'pending' ? '' : product.category || '');
                            setShowModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes e Aprovação */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Detalhes do Produto
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Imagens */}
                  {selectedProduct.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedProduct.title} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Informações do Produto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço</label>
                      <p className="text-sm text-gray-900 dark:text-white">{formatPrice(selectedProduct.price)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.product_type}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.description}</p>
                  </div>

                  {/* Informações do Vendedor */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações do Vendedor</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.user_profiles?.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.user_profiles?.email}</p>
                      </div>
                    </div>
                  </div>

                   {/* Seleção de Seção da Página Principal (apenas para aprovação) */}
                   {selectedProduct.approval_status === 'pending' && (() => {
                     console.log('🔍 Status do produto no modal:', selectedProduct.approval_status, 'Deve mostrar dropdown? SIM');
                     return null;
                   })()}
                   {selectedProduct.approval_status === 'pending' && (
                     <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                       <label className="block text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                         <Package className="h-4 w-4" />
                         Seção da Página Principal *
                       </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            console.log('📋 Categoria selecionada no dropdown:', e.target.value);
                            setSelectedCategory(e.target.value);
                          }}
                          className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                            selectedCategory 
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
                              : 'border-orange-300 bg-white dark:bg-gray-700 dark:border-orange-700'
                          }`}
                          required
                        >
                         <option value="" className="text-gray-500">🎯 Escolha onde o produto aparecerá...</option>
                         {mainPageSections.map((section) => (
                           <option key={section.value} value={section.value} className="text-gray-900 dark:text-white">
                             {section.label}
                           </option>
                         ))}
                       </select>
                       <div className="mt-2 flex items-start gap-2">
                         <div className={`mt-0.5 ${selectedCategory ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                           {selectedCategory ? (
                             <Check className="h-4 w-4" />
                           ) : (
                             <AlertTriangle className="h-4 w-4" />
                           )}
                         </div>
                         <p className={`text-xs ${selectedCategory ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                           {selectedCategory 
                             ? `✓ Produto será publicado em: ${mainPageSections.find(s => s.value === selectedCategory)?.label}`
                             : '⚠️ Você precisa selecionar uma seção antes de aprovar'}
                         </p>
                       </div>
                     </div>
                   )}

                  {/* Comentários do Admin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comentários do Administrador
                    </label>
                    <textarea
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Adicione comentários sobre a aprovação/rejeição..."
                    />
                  </div>

                  {/* Status Atual */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status atual:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.approval_status)}`}>
                        {getStatusText(selectedProduct.approval_status)}
                      </span>
                    </div>
                    
                    {/* Data de Expiração */}
                    {selectedProduct.expires_at && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expira em:</span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {formatDate(selectedProduct.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="space-y-3 pt-4 border-t">
                    {/* Ações de Aprovação/Rejeição (apenas para produtos pendentes) */}
                    {selectedProduct.approval_status === 'pending' && (
                      <div className="flex space-x-3">
                         <button
                           onClick={() => handleApprove(selectedProduct.id)}
                           className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                           title="Aprovar produto e publicar na seção selecionada"
                         >
                           <Check className="h-4 w-4" />
                           Aprovar & Publicar
                         </button>
                        <button
                          onClick={() => handleReject(selectedProduct.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Rejeitar
                        </button>
                      </div>
                    )}
                    
                    {/* Ações Administrativas (disponíveis para todos os produtos) */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSet30DayExpiration(selectedProduct.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                        title="Define o produto para expirar em 30 dias"
                      >
                        <Calendar className="h-4 w-4" />
                        30 Dias
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(selectedProduct.id);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                        title="Excluir produto permanentemente"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserProducts;