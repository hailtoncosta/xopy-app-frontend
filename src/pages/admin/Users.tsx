import { MaskedInput } from '@/components/ui/masked-input';
import { appNotify, appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Star,
  X,
  Save,
  Upload,
  Download,
  Ban,
  CheckCircle,
  AlertTriangle,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllUsers, updateUser, deleteUsers, type AdminUser } from '@/services/userService';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned' | 'pending';
  role: 'customer' | 'admin' | 'moderator' | 'seller' | 'service_provider' | 'store_owner' | 'guest';
  emailVerified: boolean;
  phoneVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  };
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as User['role'],
    status: 'active' as User['status'],
    emailVerified: false,
    phoneVerified: false,
    newsletter: false,
    smsNotifications: false,
    emailNotifications: false
  });

  // Form state for creating new user
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as User['role'],
    status: 'active' as User['status'],
    emailVerified: false,
    phoneVerified: false,
    newsletter: true,
    smsNotifications: false,
    emailNotifications: true,
    sendWelcomeEmail: true
  });

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      
      // Converter AdminUser para User
      const convertedUsers: User[] = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        role: user.type as User['role'],
        emailVerified: user.is_verified,
        phoneVerified: !!user.phone,
        stats: user.stats,
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true
        },
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
        lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
      }));
      
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    let matchesVerification = true;
    if (verificationFilter === 'verified') {
      matchesVerification = user.emailVerified;
    } else if (verificationFilter === 'unverified') {
      matchesVerification = !user.emailVerified;
    }

    return matchesSearch && matchesStatus && matchesRole && matchesVerification;
  });

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      banned: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colors[status];
  };

  const getStatusIcon = (status: User['status']) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      inactive: <UserX className="w-4 h-4" />,
      banned: <Ban className="w-4 h-4" />,
      pending: <AlertTriangle className="w-4 h-4" />
    };
    return icons[status];
  };

  const getStatusLabel = (status: User['status']) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      banned: 'Banido',
      pending: 'Pendente'
    };
    return labels[status];
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      seller: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      moderator: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[role];
  };

  const getRoleIcon = (role: User['role']) => {
    const icons = {
      customer: <UsersIcon className="w-4 h-4" />,
      seller: <ShoppingBag className="w-4 h-4" />,
      moderator: <Shield className="w-4 h-4" />,
      admin: <ShieldCheck className="w-4 h-4" />
    };
    return icons[role];
  };

  const getRoleLabel = (role: User['role']) => {
    const labels = {
      customer: 'Cliente',
      seller: 'Vendedor',
      moderator: 'Moderador',
      admin: 'Administrador',
      service_provider: 'Prestador',
      store_owner: 'Lojista',
      guest: 'Visitante'
    };
    return labels[role] || role;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      newsletter: user.preferences.newsletter,
      smsNotifications: user.preferences.smsNotifications,
      emailNotifications: user.preferences.emailNotifications
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        id: selectedUser.id,
        auth_id: '', // Não alteramos o auth_id
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        type: editForm.role as any,
        is_verified: editForm.emailVerified,
        avatar: selectedUser.avatar,
        created_at: selectedUser.createdAt.toISOString(),
        updated_at: new Date().toISOString()
      });

      toast.success('Usuário atualizado com sucesso!');
      await loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true,
      sendWelcomeEmail: true
    });
  };

  const handleCreateUser = () => {
    if (!createForm.name || !createForm.email || !createForm.password) return;
    if (createForm.password !== createForm.confirmPassword) return;

    // Check if email already exists
    if (users.some(user => user.email === createForm.email)) {
      appNotify('Este email já está em uso!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone || undefined,
      status: createForm.status,
      role: createForm.role,
      emailVerified: createForm.emailVerified,
      phoneVerified: createForm.phoneVerified,
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      },
      preferences: {
        newsletter: createForm.newsletter,
        smsNotifications: createForm.smsNotifications,
        emailNotifications: createForm.emailNotifications
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUsers(prev => [...prev, newUser]);
    setShowCreateModal(false);
    resetCreateForm();

    // Simulate sending welcome email
    if (createForm.sendWelcomeEmail) {
      console.log(`Welcome email sent to ${createForm.email}`);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: user.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date()
          }
        : user
    ));
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!(await appConfirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)?`))) {
      return;
    }

    try {
      await deleteUsers(selectedUsers);
      toast.success(`${selectedUsers.length} usuário(s) excluído(s) com sucesso!`);
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao deletar usuários:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir usuários');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getTotalUsers = () => users.length;
  const getActiveUsers = () => users.filter(user => user.status === 'active').length;
  const getVerifiedUsers = () => users.filter(user => user.emailVerified).length;
  const getTotalRevenue = () => users.reduce((sum, user) => sum + user.stats.totalSpent, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando usuários...</span>
          </div>
        )}

        {!loading && (
          <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todos os usuários da plataforma
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button 
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalUsers()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getActiveUsers()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verificados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getVerifiedUsers()}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {getTotalRevenue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="banned">Banido</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas as Funções</option>
                <option value="customer">Cliente</option>
                <option value="seller">Vendedor</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Verificação</option>
                <option value="verified">Verificados</option>
                <option value="unverified">Não Verificados</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
              <span className="text-blue-700 dark:text-blue-300">
                {selectedUsers.length} usuário(s) selecionado(s)
              </span>
              <button
                onClick={handleDeleteUsers}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Verificação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UsersIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.emailVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        {user.phoneVerified ? (
                          <Phone className="w-4 h-4 text-green-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.stats.totalOrders} pedidos
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        R$ {user.stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-gray-400 hover:text-red-600 dark:hover:text-red-400' 
                              : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                          }`}
                          title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' || verificationFilter !== 'all'
                  ? 'Nenhum usuário encontrado com os filtros aplicados'
                  : 'Nenhum usuário encontrado'}
              </p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do Usuário
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UsersIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p className="text-gray-500 dark:text-gray-500">{selectedUser.phone}</p>
                    )}
                  </div>
                </div>

                {/* Status and Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                      {getStatusIcon(selectedUser.status)}
                      {getStatusLabel(selectedUser.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Função
                    </label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)}
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verificações
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {selectedUser.emailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">Email {selectedUser.emailVerified ? 'verificado' : 'não verificado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.phoneVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">Telefone {selectedUser.phoneVerified ? 'verificado' : 'não verificado'}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedUser.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedUser.address.street}, {selectedUser.address.city}/{selectedUser.address.state} - {selectedUser.address.zipCode}
                    </p>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estatísticas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pedidos</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.stats.totalOrders}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Gasto</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        R$ {selectedUser.stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        R$ {selectedUser.stats.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Último Pedido</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedUser.stats.lastOrderDate ? selectedUser.stats.lastOrderDate.toLocaleDateString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Datas
                  </label>
                  <div className="space-y-2 text-sm">
                    <p><strong>Cadastrado em:</strong> {selectedUser.createdAt.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Atualizado em:</strong> {selectedUser.updatedAt.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Último login:</strong> {selectedUser.lastLoginAt ? selectedUser.lastLoginAt.toLocaleDateString('pt-BR') : 'Nunca'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Editar Usuário
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <MaskedInput mask="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Função
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="customer">Cliente</option>
                      <option value="seller">Vendedor</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="banned">Banido</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Verification Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verificações
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.emailVerified}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emailVerified: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Email verificado</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.phoneVerified}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phoneVerified: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Telefone verificado</span>
                    </label>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferências de Notificação
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.newsletter}
                        onChange={(e) => setEditForm(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Newsletter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.emailNotifications}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Notificações por email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.smsNotifications}
                        onChange={(e) => setEditForm(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Notificações por SMS</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Criar Novo Usuário
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome completo"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="usuario@email.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <MaskedInput mask="phone"
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Função
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="customer">Cliente</option>
                      <option value="seller">Vendedor</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite uma senha segura"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      value={createForm.confirmPassword}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme a senha"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        createForm.password && createForm.confirmPassword && createForm.password !== createForm.confirmPassword
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    />
                    {createForm.password && createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status Inicial
                    </label>
                    <select
                      value={createForm.status}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Verification Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verificações Iniciais
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.emailVerified}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, emailVerified: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Marcar email como verificado</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.phoneVerified}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, phoneVerified: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Marcar telefone como verificado</span>
                    </label>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferências de Notificação
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.newsletter}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Inscrever na newsletter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.emailNotifications}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Notificações por email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={createForm.smsNotifications}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Notificações por SMS</span>
                    </label>
                  </div>
                </div>

                {/* Welcome Email Option */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createForm.sendWelcomeEmail}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enviar email de boas-vindas</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    O usuário receberá um email com as credenciais de acesso e instruções iniciais.
                  </p>
                </div>

                {/* Password Strength Indicator */}
                {createForm.password && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Força da Senha
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            createForm.password.length < 6 
                              ? 'w-1/3 bg-red-500' 
                              : createForm.password.length < 8 
                              ? 'w-2/3 bg-yellow-500' 
                              : 'w-full bg-green-500'
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${
                        createForm.password.length < 6 
                          ? 'text-red-500' 
                          : createForm.password.length < 8 
                          ? 'text-yellow-500' 
                          : 'text-green-500'
                      }`}>
                        {createForm.password.length < 6 ? 'Fraca' : createForm.password.length < 8 ? 'Média' : 'Forte'}
                      </span>
                    </div>
                  </div>
                )}

                {/* User Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Resumo do Usuário</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <p><strong>Nome:</strong> {createForm.name || 'Não definido'}</p>
                    <p><strong>Email:</strong> {createForm.email || 'Não definido'}</p>
                    <p><strong>Função:</strong> {getRoleLabel(createForm.role)}</p>
                    <p><strong>Status:</strong> {getStatusLabel(createForm.status)}</p>
                    {createForm.phone && <p><strong>Telefone:</strong> {createForm.phone}</p>}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !createForm.name || 
                      !createForm.email || 
                      !createForm.password || 
                      createForm.password !== createForm.confirmPassword ||
                      users.some(user => user.email === createForm.email)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Criar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;