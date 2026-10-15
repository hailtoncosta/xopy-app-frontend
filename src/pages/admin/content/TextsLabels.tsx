import { appNotify, appConfirm } from '@/lib/feedback';
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Type,
  X,
  Save,
  Tag,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface TextLabel {
  id: string;
  key: string;
  category: string;
  ptBR: string;
  enUS?: string;
  esES?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TextsLabels: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingText, setEditingText] = useState<TextLabel | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [texts, setTexts] = useState<TextLabel[]>([
    {
      id: '1',
      key: 'app.title',
      category: 'general',
      ptBR: 'Xopy - Materiais de Construção',
      enUS: 'Xopy - Construction Materials',
      esES: 'Xopy - Materiales de Construcción',
      description: 'Título principal da aplicação',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      key: 'nav.home',
      category: 'navigation',
      ptBR: 'Início',
      enUS: 'Home',
      esES: 'Inicio',
      description: 'Label do menu de navegação - Início',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '3',
      key: 'nav.products',
      category: 'navigation',
      ptBR: 'Produtos',
      enUS: 'Products',
      esES: 'Productos',
      description: 'Label do menu de navegação - Produtos',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '4',
      key: 'nav.services',
      category: 'navigation',
      ptBR: 'Serviços',
      enUS: 'Services',
      esES: 'Servicios',
      description: 'Label do menu de navegação - Serviços',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '5',
      key: 'nav.rentals',
      category: 'navigation',
      ptBR: 'Locações',
      enUS: 'Rentals',
      esES: 'Alquileres',
      description: 'Label do menu de navegação - Locações',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '6',
      key: 'button.add_to_cart',
      category: 'buttons',
      ptBR: 'Adicionar ao Carrinho',
      enUS: 'Add to Cart',
      esES: 'Añadir al Carrito',
      description: 'Botão para adicionar produto ao carrinho',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '7',
      key: 'button.buy_now',
      category: 'buttons',
      ptBR: 'Comprar Agora',
      enUS: 'Buy Now',
      esES: 'Comprar Ahora',
      description: 'Botão para compra direta',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '8',
      key: 'form.name',
      category: 'forms',
      ptBR: 'Nome',
      enUS: 'Name',
      esES: 'Nombre',
      description: 'Label do campo nome em formulários',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '9',
      key: 'form.email',
      category: 'forms',
      ptBR: 'E-mail',
      enUS: 'Email',
      esES: 'Correo',
      description: 'Label do campo email em formulários',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '10',
      key: 'message.success',
      category: 'messages',
      ptBR: 'Operação realizada com sucesso!',
      enUS: 'Operation completed successfully!',
      esES: '¡Operación completada con éxito!',
      description: 'Mensagem de sucesso genérica',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-12')
    }
  ]);

  const [formData, setFormData] = useState({
    key: '',
    category: 'general',
    ptBR: '',
    enUS: '',
    esES: '',
    description: ''
  });

  const categories = [
    { value: 'general', label: 'Geral' },
    { value: 'navigation', label: 'Navegação' },
    { value: 'buttons', label: 'Botões' },
    { value: 'forms', label: 'Formulários' },
    { value: 'messages', label: 'Mensagens' },
    { value: 'errors', label: 'Erros' },
    { value: 'validation', label: 'Validação' }
  ];

  const filteredTexts = texts.filter(text => {
    const matchesSearch = text.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         text.ptBR.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         text.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || text.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (text?: TextLabel) => {
    if (text) {
      setEditingText(text);
      setFormData({
        key: text.key,
        category: text.category,
        ptBR: text.ptBR,
        enUS: text.enUS || '',
        esES: text.esES || '',
        description: text.description
      });
    } else {
      setEditingText(null);
      setFormData({
        key: '',
        category: 'general',
        ptBR: '',
        enUS: '',
        esES: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingText(null);
    setFormData({
      key: '',
      category: 'general',
      ptBR: '',
      enUS: '',
      esES: '',
      description: ''
    });
  };

  const handleSave = () => {
    if (!formData.key.trim() || !formData.ptBR.trim()) {
      appNotify('Chave e texto em português são obrigatórios');
      return;
    }

    // Verificar se a chave já existe (apenas para novos textos)
    if (!editingText && texts.some(t => t.key === formData.key)) {
      appNotify('Esta chave já existe. Use uma chave única.');
      return;
    }

    if (editingText) {
      // Editar texto existente
      setTexts(prev => 
        prev.map(text => 
          text.id === editingText.id 
            ? { 
                ...text, 
                ...formData,
                updatedAt: new Date() 
              }
            : text
        )
      );
    } else {
      // Adicionar novo texto
      const newText: TextLabel = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTexts(prev => [...prev, newText]);
    }

    handleCloseModal();
  };

  const handleDelete = async (text: TextLabel) => {
    if (!(await appConfirm(`Tem certeza que deseja excluir o texto "${text.key}"?`))) {
      return;
    }

    setTexts(prev => prev.filter(t => t.id !== text.id));
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const totalTexts = texts.length;
  const categoriesCount = new Set(texts.map(t => t.category)).size;
  const translatedTexts = texts.filter(t => t.enUS && t.esES).length;

  return (
    <AdminLayout title="Textos e Labels">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Textos e Labels</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todos os textos e traduções da aplicação
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Texto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Type className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Textos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTexts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoriesCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Traduzidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{translatedTexts}</p>
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
                  placeholder="Buscar textos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Texts List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Chave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Português
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Traduções
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTexts.map((text) => (
                  <tr key={text.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                          {text.key}
                        </code>
                        <button
                          onClick={() => handleCopyKey(text.key)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          title="Copiar chave"
                        >
                          {copiedKey === text.key ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {text.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                        {getCategoryLabel(text.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {text.ptBR}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          text.enUS 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          EN
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          text.esES 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          ES
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(text)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(text)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTexts.length === 0 && (
            <div className="text-center py-12">
              <Type className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum texto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tente ajustar os filtros ou criar um novo texto.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingText ? 'Editar Texto' : 'Novo Texto'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chave *
                      </label>
                      <input
                        type="text"
                        value={formData.key}
                        onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                        placeholder="app.button.save"
                        disabled={!!editingText}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descrição do texto para facilitar identificação"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Português (Brasil) *
                    </label>
                    <textarea
                      value={formData.ptBR}
                      onChange={(e) => setFormData(prev => ({ ...prev, ptBR: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Texto em português"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inglês (Estados Unidos)
                    </label>
                    <textarea
                      value={formData.enUS}
                      onChange={(e) => setFormData(prev => ({ ...prev, enUS: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Text in English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Espanhol (Espanha)
                    </label>
                    <textarea
                      value={formData.esES}
                      onChange={(e) => setFormData(prev => ({ ...prev, esES: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Texto en español"
                    />
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
                    {editingText ? 'Salvar' : 'Criar'}
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

export default TextsLabels;