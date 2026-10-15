import { getRentalCompanies } from '@/services/rentalCompaniesService';
import { MaskedInput } from '@/components/ui/masked-input';
import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Truck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RentalCompany {
  id: string;
  name: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  description?: string;
  rating: number | null;
  total_rentals: number | null;
  created_at: string;
  updated_at: string;
}

const RentalCompanies = () => {
  const [companies, setCompanies] = useState<RentalCompany[]>([]);
  const [loadError,setLoadError]=useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<RentalCompany>>({
    name: '',
    avatar_url: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    description: '',
    rating: 4.9,
    total_rentals: 0
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      
      setLoadError('');
      const data = await getRentalCompanies();
      setCompanies(data.map((company:any)=>({...company,
        name:String(company.name || ''), rating:company.rating==null?null:Number(company.rating)||0,total_rentals:company.total_rentals==null?null:Number(company.total_rentals)||0
      })));
    } catch (error) {
      setLoadError(error instanceof Error?error.message:'Não foi possível carregar as empresas.');
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: RentalCompany) => {
    setEditingId(company.id);
    setIsAdding(false);
    setFormData({
      name: company.name,
      avatar_url: company.avatar_url || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      phone: company.phone || '',
      email: company.email || '',
      description: company.description || '',
      rating: company.rating,
      total_rentals: company.total_rentals
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      avatar_url: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      description: '',
      rating: 4.9,
      total_rentals: 0
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      avatar_url: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      description: '',
      rating: 4.9,
      total_rentals: 0
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error('Nome é obrigatório');
        return;
      }

      // Aqui você implementaria a lógica de salvar no banco
      // Por enquanto, apenas mostra mensagem de sucesso
      toast.success(isAdding ? 'Empresa adicionada com sucesso!' : 'Empresa atualizada com sucesso!');
      
      handleCancel();
      loadCompanies();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await appConfirm('Tem certeza que deseja excluir esta empresa?'))) return;

    try {
      // Aqui você implementaria a lógica de deletar do banco
      toast.success('Empresa excluída com sucesso!');
      loadCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Empresas de Locação
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie as empresas de locação de equipamentos
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {/* Formulário de Edição/Adição */}
        {(editingId || isAdding) && (
          <Card>
            <CardHeader>
              <CardTitle>{isAdding ? 'Nova Empresa' : 'Editar Empresa'}</CardTitle>
              <CardDescription>
                {isAdding ? 'Adicione uma nova empresa de locação' : 'Atualize as informações da empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="URL da imagem do avatar"
                  />
                  {formData.avatar_url && (
                    <div className="mt-2">
                      <img
                        src={formData.avatar_url}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <MaskedInput mask="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Avaliação</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição sobre a empresa"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Empresas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Cadastradas</CardTitle>
            <CardDescription>
              {companies.length} empresa(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? <div role="alert" className="rounded-lg bg-red-50 text-red-800 p-4">{loadError}<button type="button" className="ml-3 underline" onClick={loadCompanies}>Tentar novamente</button></div> : loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma empresa cadastrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {company.avatar_url ? (
                        <img
                          src={company.avatar_url}
                          alt={company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100">
                          <Truck className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {company.city && company.state ? `${company.city}, ${company.state}` : 'Localização não informada'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-500">
                          {company.rating==null?'Sem avaliações':`⭐ ${company.rating}`}{company.total_rentals!=null && ` • ${company.total_rentals} locações`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RentalCompanies;
