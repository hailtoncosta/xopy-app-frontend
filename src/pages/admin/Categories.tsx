import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { appNotify, appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderTree,
  Package,
  Wrench,
  Truck,
  X,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentService, type DynamicCategory } from '@/services/contentService';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'produto' | 'serviço' | 'locação';
  icon: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
}

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result=await supabase.from('dynamic_categories').select('*').order('label',{ascending:true}).limit(500);
      if(result.error)throw new Error(result.error.message);
      const dynamicCategories=result.data || [];
      const counts=await Promise.all(dynamicCategories.map(async(cat:any)=>{const result=await supabase.from('products').select('id',{head:true,count:'exact'}).eq('category',cat.label);if(result.error)throw new Error(result.error.message);return Number(result.count)||0;}));
      
      // Converter para formato local
      const convertedCategories: Category[] = dynamicCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.label,
        description: cat.description || '',
        type: cat.category_type || 'produto',
        icon: getIconForCategory(cat.label),
        isActive: cat.is_active,
        productCount: counts[index],
        createdAt: new Date(cat.created_at)
      }));
      
      setCategories(convertedCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Usar dados mock como fallback
      toast.error('Não foi possível carregar as categorias.');setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (label: string): string => {
    const iconMap: { [key: string]: string } = {
      'Cimento': '🏗️',
      'Tijolo': '🧱',
      'Telha': '🏠',
      'Piso': '🏢',
      'Tinta': '🎨',
      'Ferramenta': '🔧',
      'Pedreiro': '👷',
      'Pintor': '🎨',
      'Eletricista': '⚡'
    };
    return iconMap[label] || '📦';
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'produto' as 'produto' | 'serviço' | 'locação',
    icon: '',
    isActive: true
  });

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || category.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        type: category.type,
        icon: category.icon,
        isActive: category.isActive
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        type: 'produto',
        icon: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      type: 'produto',
      icon: '',
      isActive: true
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      appNotify('Nome da categoria é obrigatório');
      return;
    }

    try {
      const values={label:formData.name.trim(),description:formData.description.trim(),category_type:formData.type,is_active:formData.isActive,icon_name:'Tag',updated_at:new Date().toISOString()};
      const result=editingCategory?await supabase.from('dynamic_categories').update(values).eq('id',editingCategory.id).select('*').single():await supabase.from('dynamic_categories').insert({...values,id:crypto.randomUUID(),order_index:0}).select('*').single();
      if(result.error || !result.data)throw new Error(result.error?.message || 'Falha ao salvar categoria');
      handleCloseModal();await loadCategories();window.dispatchEvent(new Event('contentUpdated'));toast.success('Categoria salva!');
    }catch(error){toast.error(error instanceof Error?error.message:'Não foi possível salvar.');}
  };

  const handleDelete=async(category:Category)=>{
    if(!await appConfirm(`Excluir a categoria "${category.name}"? Os produtos cadastrados serão mantidos.`))return;
    try{const result=await supabase.from('dynamic_categories').delete().eq('id',category.id).select('*').single();if(result.error || !result.data)throw new Error(result.error?.message || 'Falha na exclusão');await loadCategories();window.dispatchEvent(new Event('contentUpdated'));toast.success('Categoria excluída.');}catch(error){toast.error(error instanceof Error?error.message:'Não foi possível excluir.');}
  };
  const handleToggleStatus=async(categoryId:string)=>{const category=categories.find(item=>item.id===categoryId);if(!category)return;const result=await supabase.from('dynamic_categories').update({is_active:!category.isActive}).eq('id',categoryId);if(result.error){toast.error(result.error.message);return;}await loadCategories();window.dispatchEvent(new Event('contentUpdated'));};
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'produto': return <Package className="h-4 w-4" />;
      case 'serviço': return <Wrench className="h-4 w-4" />;
      case 'locação': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'produto': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
      case 'serviço': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      case 'locação': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const productCategories = categories.filter(cat => cat.type === 'produto').length;
  const serviceCategories = categories.filter(cat => cat.type === 'serviço').length;
  const rentalCategories = categories.filter(cat => cat.type === 'locação').length;

  return (
    <AdminLayout title="Gerenciar Categorias">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie as categorias de produtos, serviços e locações
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCategories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCategories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produtos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{productCategories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Serviços</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{serviceCategories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Locações</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rentalCategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">Todos os Tipos</option>
                <option value="produto">Produtos</option>
                <option value="serviço">Serviços</option>
                <option value="locação">Locações</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all ${
                category.isActive 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-gray-300 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className={`font-semibold ${
                      category.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {category.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                      {getTypeIcon(category.type)}
                      <span className="ml-1">{category.type}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(category.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isActive
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={category.isActive ? 'Desativar categoria' : 'Ativar categoria'}
                  >
                    {category.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className={`text-sm mb-4 ${
                category.isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  category.isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {category.productCount} {category.type === 'produto' ? 'produtos' : category.type === 'serviço' ? 'prestadores' : 'itens'}
                </span>
                <span className={`text-xs ${
                  category.isActive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'
                }`}>
                  {category.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma categoria encontrada</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou criar uma nova categoria.
            </p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Máquinas Pesadas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descreva a categoria..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="produto">Produto</option>
                      <option value="serviço">Serviço</option>
                      <option value="locação">Locação</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ícone (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="🚜"
                      maxLength={2}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categoria ativa
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCategory ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Categories;