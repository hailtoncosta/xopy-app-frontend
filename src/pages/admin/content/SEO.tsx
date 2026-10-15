import { appNotify, appConfirm } from '@/lib/feedback';
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe,
  X,
  Save,
  Eye,
  BarChart3,
  Target,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface SEOConfig {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots: string;
  priority: number;
  changeFreq: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SEO: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSEO, setEditingSEO] = useState<SEOConfig | null>(null);

  const [seoConfigs, setSeoConfigs] = useState<SEOConfig[]>([
    {
      id: '1',
      page: 'Home',
      title: 'Xopy - Materiais de Construção e Serviços | Marketplace',
      description: 'Encontre os melhores materiais de construção, prestadores de serviços e equipamentos para locação. Conectamos clientes, lojistas e profissionais em uma única plataforma.',
      keywords: ['materiais construção', 'prestadores serviços', 'locação equipamentos', 'marketplace construção'],
      ogTitle: 'Xopy - Seu Marketplace de Construção',
      ogDescription: 'A plataforma que conecta você aos melhores materiais, serviços e equipamentos para sua obra.',
      ogImage: 'https://xopy.com/images/og-home.jpg',
      canonicalUrl: 'https://xopy.com/',
      robots: 'index, follow',
      priority: 1.0,
      changeFreq: 'daily',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      page: 'Produtos',
      title: 'Produtos - Materiais de Construção | Xopy',
      description: 'Explore nossa ampla variedade de materiais de construção: cimento, tijolos, telhas, pisos, tintas e muito mais. Preços competitivos e entrega rápida.',
      keywords: ['cimento', 'tijolos', 'telhas', 'pisos', 'tintas', 'materiais construção'],
      ogTitle: 'Materiais de Construção - Xopy',
      ogDescription: 'Encontre todos os materiais que você precisa para sua obra com os melhores preços.',
      ogImage: 'https://xopy.com/images/og-produtos.jpg',
      canonicalUrl: 'https://xopy.com/produtos',
      robots: 'index, follow',
      priority: 0.9,
      changeFreq: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '3',
      page: 'Serviços',
      title: 'Prestadores de Serviços - Profissionais Qualificados | Xopy',
      description: 'Contrate os melhores profissionais da construção: pedreiros, pintores, eletricistas, encanadores e mais. Avaliações reais e orçamentos gratuitos.',
      keywords: ['pedreiro', 'pintor', 'eletricista', 'encanador', 'prestadores serviços', 'profissionais construção'],
      ogTitle: 'Prestadores de Serviços - Xopy',
      ogDescription: 'Encontre profissionais qualificados para sua obra com avaliações reais.',
      ogImage: 'https://xopy.com/images/og-servicos.jpg',
      canonicalUrl: 'https://xopy.com/servicos',
      robots: 'index, follow',
      priority: 0.9,
      changeFreq: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '4',
      page: 'Locações',
      title: 'Locação de Equipamentos - Máquinas e Ferramentas | Xopy',
      description: 'Alugue equipamentos profissionais para sua obra: escavadeiras, plataformas elevatórias, ferramentas elétricas e mais. Preços acessíveis e equipamentos revisados.',
      keywords: ['locação equipamentos', 'aluguel máquinas', 'escavadeira', 'plataforma elevatória', 'ferramentas elétricas'],
      ogTitle: 'Locação de Equipamentos - Xopy',
      ogDescription: 'Alugue equipamentos profissionais com segurança e preços acessíveis.',
      ogImage: 'https://xopy.com/images/og-locacoes.jpg',
      canonicalUrl: 'https://xopy.com/locacoes',
      robots: 'index, follow',
      priority: 0.8,
      changeFreq: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '5',
      page: 'Sobre',
      title: 'Sobre a Xopy - Nossa História e Missão | Marketplace de Construção',
      description: 'Conheça a história da Xopy, nossa missão de conectar pessoas no setor de construção e como estamos revolucionando o mercado brasileiro.',
      keywords: ['sobre xopy', 'história', 'missão', 'marketplace construção', 'empresa'],
      ogTitle: 'Sobre a Xopy - Nossa História',
      ogDescription: 'Descubra como a Xopy está revolucionando o mercado de construção no Brasil.',
      ogImage: 'https://xopy.com/images/og-sobre.jpg',
      canonicalUrl: 'https://xopy.com/sobre',
      robots: 'index, follow',
      priority: 0.6,
      changeFreq: 'monthly',
      isActive: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12')
    }
  ]);

  const [formData, setFormData] = useState({
    page: '',
    title: '',
    description: '',
    keywords: [] as string[],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    robots: 'index, follow',
    priority: 0.8,
    changeFreq: 'weekly',
    isActive: true
  });

  const [keywordInput, setKeywordInput] = useState('');

  const changeFreqOptions = [
    { value: 'always', label: 'Sempre' },
    { value: 'hourly', label: 'Por hora' },
    { value: 'daily', label: 'Diariamente' },
    { value: 'weekly', label: 'Semanalmente' },
    { value: 'monthly', label: 'Mensalmente' },
    { value: 'yearly', label: 'Anualmente' },
    { value: 'never', label: 'Nunca' }
  ];

  const robotsOptions = [
    { value: 'index, follow', label: 'Index, Follow' },
    { value: 'index, nofollow', label: 'Index, NoFollow' },
    { value: 'noindex, follow', label: 'NoIndex, Follow' },
    { value: 'noindex, nofollow', label: 'NoIndex, NoFollow' }
  ];

  const filteredSEO = seoConfigs.filter(seo => {
    const matchesSearch = seo.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && seo.isActive) ||
                         (statusFilter === 'inactive' && !seo.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (seo?: SEOConfig) => {
    if (seo) {
      setEditingSEO(seo);
      setFormData({
        page: seo.page,
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        ogTitle: seo.ogTitle || '',
        ogDescription: seo.ogDescription || '',
        ogImage: seo.ogImage || '',
        canonicalUrl: seo.canonicalUrl || '',
        robots: seo.robots,
        priority: seo.priority,
        changeFreq: seo.changeFreq,
        isActive: seo.isActive
      });
    } else {
      setEditingSEO(null);
      setFormData({
        page: '',
        title: '',
        description: '',
        keywords: [],
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonicalUrl: '',
        robots: 'index, follow',
        priority: 0.8,
        changeFreq: 'weekly',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSEO(null);
    setKeywordInput('');
    setFormData({
      page: '',
      title: '',
      description: '',
      keywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: '',
      robots: 'index, follow',
      priority: 0.8,
      changeFreq: 'weekly',
      isActive: true
    });
  };

  const handleSave = () => {
    if (!formData.page.trim() || !formData.title.trim() || !formData.description.trim()) {
      appNotify('Página, título e descrição são obrigatórios');
      return;
    }

    if (formData.title.length > 60) {
      appNotify('O título deve ter no máximo 60 caracteres');
      return;
    }

    if (formData.description.length > 160) {
      appNotify('A descrição deve ter no máximo 160 caracteres');
      return;
    }

    if (editingSEO) {
      // Editar configuração existente
      setSeoConfigs(prev => 
        prev.map(seo => 
          seo.id === editingSEO.id 
            ? { 
                ...seo, 
                ...formData,
                updatedAt: new Date() 
              }
            : seo
        )
      );
    } else {
      // Adicionar nova configuração
      const newSEO: SEOConfig = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSeoConfigs(prev => [...prev, newSEO]);
    }

    handleCloseModal();
  };

  const handleDelete = async (seo: SEOConfig) => {
    if (!(await appConfirm(`Tem certeza que deseja excluir a configuração SEO da página "${seo.page}"?`))) {
      return;
    }

    setSeoConfigs(prev => prev.filter(s => s.id !== seo.id));
  };

  const handleToggleStatus = (seoId: string) => {
    setSeoConfigs(prev => 
      prev.map(seo => 
        seo.id === seoId 
          ? { ...seo, isActive: !seo.isActive, updatedAt: new Date() }
          : seo
      )
    );
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const totalConfigs = seoConfigs.length;
  const activeConfigs = seoConfigs.filter(s => s.isActive).length;
  const avgTitleLength = Math.round(seoConfigs.reduce((acc, s) => acc + s.title.length, 0) / seoConfigs.length);

  return (
    <AdminLayout title="Configurações SEO">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações SEO</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie as configurações de SEO para todas as páginas
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Configuração
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Páginas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalConfigs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeConfigs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Média Título</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgTitleLength}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Score Médio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
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
                  placeholder="Buscar configurações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Página
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Título SEO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSEO.map((seo) => (
                  <tr key={seo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {seo.page}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {seo.keywords.length} palavras-chave
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-md">
                        <div className="truncate font-medium">{seo.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {seo.title.length}/60 caracteres
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${
                          seo.priority >= 0.8 ? 'text-green-600' :
                          seo.priority >= 0.5 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {seo.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seo.isActive
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {seo.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(seo.canonicalUrl, '_blank')}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Visualizar página"
                          disabled={!seo.canonicalUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(seo.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            seo.isActive
                              ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={seo.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(seo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(seo)}
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
          
          {filteredSEO.length === 0 && (
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma configuração encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tente ajustar os filtros ou criar uma nova configuração.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingSEO ? 'Editar Configuração SEO' : 'Nova Configuração SEO'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Página *
                      </label>
                      <input
                        type="text"
                        value={formData.page}
                        onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Home, Produtos, Sobre..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL Canônica
                      </label>
                      <input
                        type="url"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://xopy.com/pagina"
                      />
                    </div>
                  </div>

                  {/* SEO Meta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título SEO * (máximo 60 caracteres)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Título otimizado para SEO"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.title.length}/60 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Descrição * (máximo 160 caracteres)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descrição otimizada para SEO"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/160 caracteres
                    </p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Palavras-chave
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={handleKeywordKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Digite uma palavra-chave"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Open Graph */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Open Graph (Redes Sociais)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Título OG
                        </label>
                        <input
                          type="text"
                          value={formData.ogTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Título para redes sociais"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Imagem OG
                        </label>
                        <input
                          type="url"
                          value={formData.ogImage}
                          onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descrição OG
                      </label>
                      <textarea
                        value={formData.ogDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Descrição para redes sociais"
                      />
                    </div>
                  </div>

                  {/* Technical SEO */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configurações Técnicas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Robots
                        </label>
                        <select
                          value={formData.robots}
                          onChange={(e) => setFormData(prev => ({ ...prev, robots: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {robotsOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prioridade (0.0 - 1.0)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Frequência de Mudança
                        </label>
                        <select
                          value={formData.changeFreq}
                          onChange={(e) => setFormData(prev => ({ ...prev, changeFreq: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {changeFreqOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Configuração ativa
                      </label>
                    </div>
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
                    {editingSEO ? 'Salvar' : 'Criar'}
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

export default SEO;